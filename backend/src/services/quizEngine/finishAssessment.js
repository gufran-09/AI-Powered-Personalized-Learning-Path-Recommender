/**
 * Assessment Completion Handler
 *
 * Handles assessment finishing, answer recording, stats updates,
 * and recommendation generation.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

import { supabaseAdmin } from "./supabaseAdmin.js";
import {
  DIFFICULTY_WEIGHTS,
  getDifficultyWeight,
  getMaxWeight,
  calculateLevel,
  EVENT_TYPES,
  ERROR_MESSAGES,
} from "./constants.js";
import { getRecommendations } from "./recommendationEngine.js";
import { invalidateCache as invalidateMLCache } from "../../lib/mlService.js";

// ============================================================================
// ASSESSMENT COMPLETION CLASS
// ============================================================================

class AssessmentCompleter {
  constructor(supabase = supabaseAdmin) {
    this.supabase = supabase;
  }

  /**
   * Validate assessment exists and belongs to user
   */
  async validateAssessment(assessmentId, userId) {
    const { data, error } = await this.supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      throw new Error(ERROR_MESSAGES.ASSESSMENT_NOT_FOUND);
    }

    if (data.status === "completed") {
      throw new Error(ERROR_MESSAGES.ALREADY_COMPLETED);
    }

    return data;
  }

  /**
   * Fetch question metadata for answer validation
   */
  async getQuestionMetadata(questionIds) {
    const { data, error } = await this.supabase
      .from("questions")
      .select("id, topic_id, subject_id, difficulty, correct_option")
      .in("id", questionIds);

    if (error) {
      throw new Error(`Failed to fetch question metadata: ${error.message}`);
    }

    // Create lookup map
    const map = {};
    (data || []).forEach((q) => {
      map[q.id] = q;
    });

    return map;
  }

  /**
   * Process answers and compute per-topic deltas
   */
  processAnswers(answers, questionMap) {
    const processedAnswers = [];
    const topicDeltas = {};

    for (const answer of answers) {
      const question = questionMap[answer.questionId];
      if (!question) {
        console.warn(`Question ${answer.questionId} not found in metadata`);
        continue;
      }

      const isSkipped =
        answer.selectedOption === null || answer.selectedOption === undefined;
      const isCorrect = isSkipped
        ? false
        : question.correct_option === answer.selectedOption;
      const weight = getDifficultyWeight(question.difficulty);
      const maxWeight = getMaxWeight();

      // Build processed answer
      processedAnswers.push({
        question_id: answer.questionId,
        assessment_question_id: answer.assessmentQuestionId || null,
        topic_id: question.topic_id,
        subject_id: question.subject_id,
        selected_option: isSkipped ? null : answer.selectedOption,
        is_correct: isCorrect,
        is_skipped: isSkipped,
        difficulty: question.difficulty,
        time_taken_seconds: answer.timeTakenSeconds || null,
        confidence_rating: answer.confidenceRating || null,
      });

      // Aggregate by topic
      const topicId = question.topic_id || "unknown";
      if (!topicDeltas[topicId]) {
        topicDeltas[topicId] = {
          topic_id: question.topic_id,
          subject_id: question.subject_id,
          attempts: 0,
          correct: 0,
          skipped: 0,
          weighted_score: 0,
          max_possible_weighted: 0,
          total_time: 0,
        };
      }

      const delta = topicDeltas[topicId];
      delta.attempts += 1;
      delta.max_possible_weighted += maxWeight;

      if (isSkipped) {
        delta.skipped += 1;
      } else if (isCorrect) {
        delta.correct += 1;
        delta.weighted_score += weight;
      }

      if (answer.timeTakenSeconds) {
        delta.total_time += answer.timeTakenSeconds;
      }
    }

    return { processedAnswers, topicDeltas };
  }

  /**
   * Fetch prior attempt stats per topic for ML data logging (Phase 1).
   * Returns { [topic_id]: { prior_attempts, prior_correct, days_since_last } }
   */
  async getPriorTopicStats(userId, topicIds) {
    const uniqueTopics = [...new Set(topicIds.filter(Boolean))];
    if (uniqueTopics.length === 0) return {};

    const priorStats = {};

    // Get existing stats from user_topic_stats
    const { data: stats } = await this.supabase
      .from("user_topic_stats")
      .select("topic_id, attempts, correct")
      .eq("user_id", userId)
      .in("topic_id", uniqueTopics);

    (stats || []).forEach((s) => {
      priorStats[s.topic_id] = {
        prior_attempts: s.attempts || 0,
        prior_correct: s.correct || 0,
        days_since_last: null,
      };
    });

    // Get last answer timestamps per topic
    for (const topicId of uniqueTopics) {
      const { data: lastAnswer } = await this.supabase
        .from("user_answers")
        .select("answered_at")
        .eq("user_id", userId)
        .eq("topic_id", topicId)
        .order("answered_at", { ascending: false })
        .limit(1);

      if (lastAnswer && lastAnswer.length > 0) {
        const lastDate = new Date(lastAnswer[0].answered_at);
        const daysSince =
          (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (!priorStats[topicId]) {
          priorStats[topicId] = {
            prior_attempts: 0,
            prior_correct: 0,
            days_since_last: null,
          };
        }
        priorStats[topicId].days_since_last = Math.round(daysSince * 100) / 100;
      }
    }

    // Fill defaults
    uniqueTopics.forEach((tid) => {
      if (!priorStats[tid]) {
        priorStats[tid] = {
          prior_attempts: 0,
          prior_correct: 0,
          days_since_last: null,
        };
      }
    });

    return priorStats;
  }

  /**
   * Insert user answers in bulk.
   * Actual DB columns: user_id, assessment_id, question_id, topic_id,
   * selected_option, is_correct, difficulty, answered_at
   */
  async insertUserAnswers(
    userId,
    assessmentId,
    processedAnswers,
    priorTopicStats = {},
  ) {
    const rows = processedAnswers.map((answer) => ({
      user_id: userId,
      assessment_id: assessmentId,
      question_id: answer.question_id,
      topic_id: answer.topic_id || null,
      selected_option: answer.selected_option || null,
      is_correct: answer.is_correct,
      difficulty: answer.difficulty || null,
      answered_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase.from("user_answers").insert(rows);

    if (error) {
      throw new Error(`Failed to insert answers: ${error.message}`);
    }
  }

  /**
   * Update user topic stats — try RPC first, fall back to direct upsert
   */
  async updateTopicStats(userId, topicDeltas) {
    const updatedTopics = [];

    for (const [key, delta] of Object.entries(topicDeltas)) {
      if (key === "unknown" || !delta.topic_id) continue;

      try {
        // Try RPC first (atomic)
        const { data, error } = await this.supabase.rpc(
          "rpc_upsert_user_topic_stats",
          {
            p_user_id: userId,
            p_topic_id: delta.topic_id,
            p_subject_id: delta.subject_id,
            p_attempts: delta.attempts,
            p_correct: delta.correct,
            p_skipped: delta.skipped,
            p_weighted_score: delta.weighted_score,
            p_max_possible_weighted: delta.max_possible_weighted,
            p_total_time_seconds: delta.total_time,
          },
        );

        if (error) {
          // RPC may not exist — fall back to direct upsert
          console.warn(
            `RPC unavailable, using direct upsert for topic ${delta.topic_id}`,
          );
          const result = await this.directUpsertTopicStats(userId, delta);
          if (result) updatedTopics.push(result);
          continue;
        }

        if (data && data.length > 0) {
          updatedTopics.push({
            ...data[0],
            subject_id: delta.subject_id,
          });
        }
      } catch (err) {
        // Fallback to direct upsert
        try {
          const result = await this.directUpsertTopicStats(userId, delta);
          if (result) updatedTopics.push(result);
        } catch (innerErr) {
          console.error(
            `Exception updating topic ${delta.topic_id}:`,
            innerErr,
          );
        }
      }
    }

    return updatedTopics;
  }

  /**
   * Direct upsert fallback when RPC is not available
   */
  async directUpsertTopicStats(userId, delta) {
    // Check if row exists
    const { data: existing } = await this.supabase
      .from("user_topic_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", delta.topic_id)
      .maybeSingle();

    if (existing) {
      const newAttempts = (existing.attempts || 0) + delta.attempts;
      const newCorrect = (existing.correct || 0) + delta.correct;
      const newWeighted = (existing.weighted_score || 0) + delta.weighted_score;
      const newAccuracy = newAttempts > 0 ? newCorrect / newAttempts : 0;
      const newLevel = calculateLevel(newAccuracy, newAttempts);

      const { data, error } = await this.supabase
        .from("user_topic_stats")
        .update({
          attempts: newAttempts,
          correct: newCorrect,
          weighted_score: newWeighted,
          accuracy: newAccuracy,
          level: newLevel,
        })
        .eq("user_id", userId)
        .eq("topic_id", delta.topic_id)
        .select("*")
        .single();

      if (!error && data) return { ...data, subject_id: delta.subject_id };
    } else {
      const accuracy = delta.attempts > 0 ? delta.correct / delta.attempts : 0;
      const level = calculateLevel(accuracy, delta.attempts);

      const { data, error } = await this.supabase
        .from("user_topic_stats")
        .insert({
          user_id: userId,
          topic_id: delta.topic_id,
          attempts: delta.attempts,
          correct: delta.correct,
          weighted_score: delta.weighted_score,
          accuracy,
          level,
        })
        .select("*")
        .single();

      if (!error && data) return { ...data, subject_id: delta.subject_id };
    }

    return null;
  }

  /**
   * Update subject-level aggregates (no-op: user_subject_stats table does not exist)
   */
  async updateSubjectStats(userId, subjectIds) {
    // user_subject_stats table does not exist in current DB — skip
    // Subject-level aggregation is computed on-the-fly from user_topic_stats
  }

  /**
   * Mark assessment as completed
   */
  async completeAssessment(
    assessmentId,
    score,
    weightedScore,
    answeredCount,
    timeSpent,
  ) {
    const { data, error } = await this.supabase
      .from("assessments")
      .update({
        status: "completed",
        score,
        completed_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to complete assessment: ${error.message}`);
    }

    return data;
  }

  /**
   * Record recommendation for analytics (no-op: recommendations table does not exist)
   */
  async recordRecommendations(userId, assessmentId, recommendations) {
    // recommendations table does not exist in current DB — skip
    // Recommendations are computed on-the-fly and returned in the API response
  }

  /**
   * Hydrate assessment questions by fetching actual question data from the questions table.
   * (assessment_questions has no question_snapshot column in current DB)
   */
  async hydrateAssessmentQuestions(assessmentQuestions, answeredSet) {
    const questionIds = assessmentQuestions.map((aq) => aq.question_id);
    const { data: questions } = await this.supabase
      .from("questions")
      .select(
        "id, question_text, option_a, option_b, option_c, option_d, difficulty",
      )
      .in("id", questionIds);

    const qMap = {};
    (questions || []).forEach((q) => {
      qMap[q.id] = q;
    });

    return assessmentQuestions.map((aq) => {
      const q = qMap[aq.question_id] || {};
      return {
        assessmentQuestionId: aq.id,
        questionId: aq.question_id,
        order: aq.question_order,
        text: q.question_text || "",
        options: [
          q.option_a || "",
          q.option_b || "",
          q.option_c || "",
          q.option_d || "",
        ],
        difficulty: q.difficulty || "medium",
        isAnswered: answeredSet.has(aq.question_id),
      };
    });
  }

  /**
   * Main finish assessment function
   */
  async finishAssessment({
    userId,
    assessmentId,
    answers,
    timeSpentSeconds = null,
  }) {
    try {
      // 1. Validate assessment
      await this.validateAssessment(assessmentId, userId);

      // 2. Get question metadata
      const questionIds = answers.map((a) => a.questionId);
      const questionMap = await this.getQuestionMetadata(questionIds);

      // 3. Process answers and compute deltas
      const { processedAnswers, topicDeltas } = this.processAnswers(
        answers,
        questionMap,
      );

      // 3b. Fetch prior topic stats for ML data logging
      const topicIdsForPrior = [
        ...new Set(processedAnswers.map((a) => a.topic_id).filter(Boolean)),
      ];
      const priorTopicStats = await this.getPriorTopicStats(
        userId,
        topicIdsForPrior,
      );

      // 4. Insert user answers (with ML context)
      await this.insertUserAnswers(
        userId,
        assessmentId,
        processedAnswers,
        priorTopicStats,
      );

      // 5. Update topic stats atomically
      const updatedTopics = await this.updateTopicStats(userId, topicDeltas);

      // 5b. Invalidate ML feature cache for affected topics (non-blocking)
      try {
        const affectedTopicIds = [
          ...new Set(
            Object.values(topicDeltas)
              .map((d) => d.topic_id)
              .filter(Boolean),
          ),
        ];
        for (const tid of affectedTopicIds) {
          invalidateMLCache(userId, tid).catch(() => {});
        }
      } catch (_) {
        // ML service unavailable — non-critical
      }

      // 6. Update subject stats
      const subjectIds = Object.values(topicDeltas)
        .map((d) => d.subject_id)
        .filter(Boolean);
      await this.updateSubjectStats(userId, subjectIds);

      // 7. Calculate scores
      const totalCorrect = processedAnswers.filter(
        (a) => a.is_correct === true,
      ).length;
      const totalAttempted = processedAnswers.filter(
        (a) => !a.is_skipped,
      ).length;
      const totalWeightedScore = Object.values(topicDeltas).reduce(
        (sum, d) => sum + d.weighted_score,
        0,
      );

      // 8. Mark assessment complete
      const completedAssessment = await this.completeAssessment(
        assessmentId,
        totalCorrect,
        totalWeightedScore,
        processedAnswers.length,
        timeSpentSeconds,
      );

      // 9. Get recommendations for weak topics
      const weakTopicIds = updatedTopics
        .filter((t) => t.level === "beginner" || t.accuracy < 0.6)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)
        .map((t) => t.topic_id);

      let recommendations = [];
      if (weakTopicIds.length > 0) {
        recommendations = await getRecommendations(userId, weakTopicIds);
      }

      // 10. Record recommendations for analytics
      await this.recordRecommendations(userId, assessmentId, recommendations);

      // 11. Record completion event (optional — RPC may not exist)
      try {
        await this.supabase.rpc("rpc_record_event", {
          p_user_id: userId,
          p_event_type: EVENT_TYPES.ASSESSMENT_COMPLETED,
          p_event_data: {
            assessment_id: assessmentId,
            score: totalCorrect,
            total_questions: processedAnswers.length,
            accuracy: totalAttempted > 0 ? totalCorrect / totalAttempted : 0,
            time_spent_seconds: timeSpentSeconds,
          },
        });
      } catch (_) {
        // RPC not available — silently skip
      }

      // 12. Build per-subject stats summary
      const perSubjectStats = {};
      for (const delta of Object.values(topicDeltas)) {
        if (!delta.subject_id) continue;
        if (!perSubjectStats[delta.subject_id]) {
          perSubjectStats[delta.subject_id] = {
            subject_id: delta.subject_id,
            attempts: 0,
            correct: 0,
            accuracy: 0,
          };
        }
        perSubjectStats[delta.subject_id].attempts += delta.attempts;
        perSubjectStats[delta.subject_id].correct += delta.correct;
      }

      // Calculate accuracies
      for (const stat of Object.values(perSubjectStats)) {
        stat.accuracy = stat.attempts > 0 ? stat.correct / stat.attempts : 0;
      }

      // 13. Build response matching exact required schema
      return {
        success: true,
        assessmentId,
        score: totalCorrect,
        total: processedAnswers.length,
        overallAccuracy:
          totalAttempted > 0
            ? parseFloat((totalCorrect / totalAttempted).toFixed(4))
            : 0,

        weakTopics: updatedTopics
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 5)
          .map((t) => {
            const rec = recommendations.find((r) => r.topic_id === t.topic_id);
            return {
              topic: rec?.topic_name || t.topic_id,
              accuracy: parseFloat(t.accuracy) || 0,
              level: t.level || "beginner",
            };
          }),

        recommendations: recommendations
          .map((r) => ({
            subject: r.subject_name || "Unknown",
            title: r.resource?.title || `${r.topic_name} Guide`,
            youtubeUrl: r.resource?.youtube_url || null,
          }))
          .filter((r) => r.youtubeUrl), // only include actionable video recommendations

        // Extra details for any legacy clients or deeper debugging
        answered: totalAttempted,
        skipped: processedAnswers.filter((a) => a.is_skipped).length,
        weightedScore: totalWeightedScore,
        completedAt: completedAssessment.completed_at,
        perSubjectStats: Object.values(perSubjectStats),
      };
    } catch (error) {
      console.error("Assessment completion error:", error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      };
    }
  }

  /**
   * Resume an in-progress assessment
   */
  async resumeAssessment(assessmentId, userId) {
    try {
      // Get assessment
      const { data: assessment, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .eq("user_id", userId)
        .single();

      if (assessmentError || !assessment) {
        throw new Error(ERROR_MESSAGES.ASSESSMENT_NOT_FOUND);
      }

      if (assessment.status === "completed") {
        return {
          success: false,
          error: ERROR_MESSAGES.ALREADY_COMPLETED,
        };
      }

      // Get questions
      const { data: questions, error: questionsError } = await this.supabase
        .from("assessment_questions")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("question_order", { ascending: true });

      if (questionsError) {
        throw new Error(`Failed to fetch questions: ${questionsError.message}`);
      }

      // Get already answered questions
      const { data: answered } = await this.supabase
        .from("user_answers")
        .select("question_id")
        .eq("assessment_id", assessmentId);

      const answeredSet = new Set((answered || []).map((a) => a.question_id));

      // Update assessment status if not already in_progress
      if (assessment.status !== "in_progress") {
        await this.supabase
          .from("assessments")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .eq("id", assessmentId);
      }

      return {
        success: true,
        assessmentId: assessment.id,
        assessmentType: assessment.assessment_type,
        totalQuestions: questions.length,
        answeredCount: answeredSet.size,
        startedAt: assessment.started_at,
        questions: await this.hydrateAssessmentQuestions(
          questions,
          answeredSet,
        ),
      };
    } catch (error) {
      console.error("Resume assessment error:", error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      };
    }
  }

  /**
   * Abandon an in-progress assessment
   */
  async abandonAssessment(assessmentId, userId) {
    try {
      const { data, error } = await this.supabase
        .from("assessments")
        .update({
          status: "abandoned",
          completed_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)
        .eq("user_id", userId)
        .neq("status", "completed")
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to abandon assessment: ${error.message}`);
      }

      // Record event (optional — RPC may not exist)
      try {
        await this.supabase.rpc("rpc_record_event", {
          p_user_id: userId,
          p_event_type: EVENT_TYPES.ASSESSMENT_ABANDONED,
          p_event_data: { assessment_id: assessmentId },
        });
      } catch (_) {
        // silently skip
      }

      return {
        success: true,
        assessmentId,
        status: "abandoned",
      };
    } catch (error) {
      console.error("Abandon assessment error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const assessmentCompleter = new AssessmentCompleter();

export async function finishAssessment(params) {
  return assessmentCompleter.finishAssessment(params);
}

export async function resumeAssessment(assessmentId, userId) {
  return assessmentCompleter.resumeAssessment(assessmentId, userId);
}

export async function abandonAssessment(assessmentId, userId) {
  return assessmentCompleter.abandonAssessment(assessmentId, userId);
}

export default AssessmentCompleter;
