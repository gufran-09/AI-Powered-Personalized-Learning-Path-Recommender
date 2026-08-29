/**
 * Quiz Generation Engine
 *
 * Handles dynamic, non-repeating, adaptive quiz generation.
 * Supports diagnostic, practice, and retest assessment types.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

import { supabaseAdmin } from "./supabaseAdmin.js";
import {
  BLUEPRINTS,
  REPEAT_AVOIDANCE,
  getDifficultyWeight,
  getBlueprint,
  EVENT_TYPES,
  ERROR_MESSAGES,
} from "./constants.js";
import { predictNextQuestion, predictBatch } from "../../lib/mlService.js";

// ============================================================================
// ML-ADAPTIVE DIFFICULTY (Phase 2 Integration)
// ============================================================================

/**
 * ML-driven difficulty distributions centered on the optimal difficulty.
 * These are blended with the static blueprint distribution.
 */
const ML_DIFFICULTY_PROFILES = {
  easy: { easy: 0.6, medium: 0.3, hard: 0.1 },
  medium: { easy: 0.25, medium: 0.5, hard: 0.25 },
  hard: { easy: 0.1, medium: 0.3, hard: 0.6 },
};

/** Max influence the ML model has on difficulty distribution (0–1) */
const ML_BLEND_FACTOR = 0.6;

/**
 * Get ML-adaptive difficulty distribution for a user-topic pair.
 * Falls back to the static blueprint distribution if ML is unavailable.
 *
 * @param {string} userId
 * @param {string} topicId
 * @param {Object} defaultDist - Static blueprint distribution {easy, medium, hard}
 * @returns {Promise<{easy: number, medium: number, hard: number}>}
 */
async function getAdaptiveDifficulty(userId, topicId, defaultDist) {
  try {
    const prediction = await predictNextQuestion(userId, topicId);
    if (!prediction?.optimal_difficulty) return defaultDist;

    const optimal = prediction.optimal_difficulty;
    const mlDist = ML_DIFFICULTY_PROFILES[optimal];
    if (!mlDist) return defaultDist;

    // Blend: ML_BLEND_FACTOR% ML, rest static
    return {
      easy:
        defaultDist.easy * (1 - ML_BLEND_FACTOR) +
        mlDist.easy * ML_BLEND_FACTOR,
      medium:
        defaultDist.medium * (1 - ML_BLEND_FACTOR) +
        mlDist.medium * ML_BLEND_FACTOR,
      hard:
        defaultDist.hard * (1 - ML_BLEND_FACTOR) +
        mlDist.hard * ML_BLEND_FACTOR,
    };
  } catch {
    return defaultDist;
  }
}

/**
 * Get batch-adaptive difficulty distributions for multiple topics.
 * Returns a map of topicId → blended distribution.
 *
 * @param {string} userId
 * @param {string[]} topicIds
 * @param {Object} defaultDist
 * @returns {Promise<Map<string, {easy: number, medium: number, hard: number}>>}
 */
async function getBatchAdaptiveDifficulties(userId, topicIds, defaultDist) {
  const distMap = new Map();
  topicIds.forEach((id) => distMap.set(id, defaultDist));

  try {
    const batchResult = await predictBatch(userId, topicIds);
    if (!batchResult?.predictions) return distMap;

    for (const pred of batchResult.predictions) {
      if (!pred?.optimal_difficulty) continue;
      const mlDist = ML_DIFFICULTY_PROFILES[pred.optimal_difficulty];
      if (!mlDist) continue;

      distMap.set(pred.topic_id, {
        easy:
          defaultDist.easy * (1 - ML_BLEND_FACTOR) +
          mlDist.easy * ML_BLEND_FACTOR,
        medium:
          defaultDist.medium * (1 - ML_BLEND_FACTOR) +
          mlDist.medium * ML_BLEND_FACTOR,
        hard:
          defaultDist.hard * (1 - ML_BLEND_FACTOR) +
          mlDist.hard * ML_BLEND_FACTOR,
      });
    }
  } catch {
    // ML unavailable — all topics get default distribution
  }

  return distMap;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sample n items from array without replacement
 */
function sample(array, n) {
  if (n >= array.length) return [...array];
  const shuffled = shuffle(array);
  return shuffled.slice(0, n);
}

/**
 * Distribute count across difficulties according to distribution
 */
function distributeDifficulty(totalCount, distribution) {
  const result = {
    easy: Math.round(totalCount * distribution.easy),
    medium: Math.round(totalCount * distribution.medium),
    hard: 0,
  };
  // Remaining goes to hard (handles rounding)
  result.hard = totalCount - result.easy - result.medium;
  return result;
}

// ============================================================================
// MAIN QUIZ GENERATION CLASS
// ============================================================================

class QuizGenerator {
  constructor(supabase = supabaseAdmin) {
    this.supabase = supabase;
  }

  /**
   * Get question IDs recently attempted by user
   */
  async getRecentQuestionIds(
    userId,
    days = REPEAT_AVOIDANCE.EXCLUDE_RECENT_DAYS,
  ) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.supabase
        .from("user_answers")
        .select("question_id")
        .eq("user_id", userId)
        .gte("answered_at", cutoffDate.toISOString());

      if (error) {
        console.error("Error fetching recent questions:", error);
        return [];
      }

      return (data || []).map((r) => r.question_id);
    } catch (err) {
      console.error("Exception in getRecentQuestionIds:", err);
      return [];
    }
  }

  /**
   * Get all subjects
   */
  async getSubjects() {
    const { data, error } = await this.supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch subjects: ${error.message}`);
    return data || [];
  }

  /**
   * Get topics for a subject
   */
  async getTopics(subjectId) {
    const { data, error } = await this.supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to fetch topics: ${error.message}`);
    return data || [];
  }

  /**
   * Get user's weak topics (for retest)
   */
  async getWeakTopics(userId, limit = 5, subjectId = null) {
    let query = this.supabase
      .from("user_topic_stats")
      .select(
        `
        topic_id,
        accuracy,
        level,
        attempts,
        topics:topic_id (
          id,
          name,
          subject_id
        )
      `,
      )
      .eq("user_id", userId)
      .gt("attempts", 0)
      .order("accuracy", { ascending: true })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch weak topics: ${error.message}`);

    // Filter by subject if provided
    let results = data || [];
    if (subjectId && results.length > 0) {
      results = results.filter((r) => r.topics?.subject_id === subjectId);
    }

    return results;
  }

  /**
   * Fetch candidate questions for given criteria
   */
  async fetchCandidates(topicIds, difficulties, excludeIds = [], limit = 200) {
    try {
      let query = this.supabase
        .from("questions")
        .select("*")
        .in("difficulty", difficulties)
        .limit(limit);

      // Apply topic filter
      if (topicIds.length > 0) {
        query = query.in("topic_id", topicIds);
      }

      const { data, error } = await query;
      if (error)
        throw new Error(`Failed to fetch candidates: ${error.message}`);

      // Filter out excluded questions
      let candidates = data || [];
      if (excludeIds.length > 0) {
        const excludeSet = new Set(excludeIds);
        candidates = candidates.filter((q) => !excludeSet.has(q.id));
      }

      return candidates;
    } catch (err) {
      console.error("Error fetching candidates:", err);
      return [];
    }
  }

  /**
   * Build diagnostic assessment (covers all subjects).
   * Uses ML batch prediction to adapt difficulty per-topic when available.
   */
  async buildDiagnosticQuiz(userId, blueprint, recentQIds) {
    const selected = [];
    const subjects = await this.getSubjects();
    const perSubject = Math.ceil(blueprint.numQuestions / subjects.length);
    const defaultDist = blueprint.difficultyDistribution;

    // Collect all topic IDs for batch ML prediction
    const allTopics = [];
    const subjectTopics = {};
    for (const subject of subjects) {
      const topics = await this.getTopics(subject.id);
      subjectTopics[subject.id] = topics;
      allTopics.push(...topics);
    }

    // Batch-fetch ML difficulty for all topics (graceful fallback)
    const allTopicIds = allTopics.map((t) => t.id);
    const adaptiveDistMap = await getBatchAdaptiveDifficulties(
      userId,
      allTopicIds,
      defaultDist,
    );

    for (const subject of subjects) {
      const topics = subjectTopics[subject.id] || [];
      if (topics.length === 0) continue;

      const topicIds = topics.map((t) => t.id);

      // Use averaged ML distribution across topics in this subject
      const avgDist = { easy: 0, medium: 0, hard: 0 };
      for (const tid of topicIds) {
        const d = adaptiveDistMap.get(tid) || defaultDist;
        avgDist.easy += d.easy;
        avgDist.medium += d.medium;
        avgDist.hard += d.hard;
      }
      avgDist.easy /= topicIds.length;
      avgDist.medium /= topicIds.length;
      avgDist.hard /= topicIds.length;

      const diffDist = distributeDifficulty(perSubject, avgDist);

      for (const [difficulty, count] of Object.entries(diffDist)) {
        if (count <= 0) continue;

        const candidates = await this.fetchCandidates(
          topicIds,
          [difficulty],
          recentQIds,
          count * 3,
        );

        const chosen = sample(candidates, count);
        selected.push(...chosen);
      }
    }

    return selected;
  }

  /**
   * Build practice assessment (topic-focused).
   * Uses ML to adapt difficulty to the user's optimal zone.
   */
  async buildPracticeQuiz(userId, blueprint, config, recentQIds) {
    const selected = [];
    const { topicId, subjectId } = config;

    if (!topicId && !subjectId) {
      throw new Error("Practice quiz requires topicId or subjectId");
    }

    // Get focus topic info
    let focusTopicIds = [];
    let relatedTopicIds = [];

    if (topicId) {
      focusTopicIds = [topicId];

      // Get related topics (same subject)
      const { data: topic } = await this.supabase
        .from("topics")
        .select("subject_id")
        .eq("id", topicId)
        .single();

      if (topic) {
        const allTopics = await this.getTopics(topic.subject_id);
        relatedTopicIds = allTopics
          .filter((t) => t.id !== topicId)
          .map((t) => t.id);
      }
    } else if (subjectId) {
      const allTopics = await this.getTopics(subjectId);
      focusTopicIds = allTopics.map((t) => t.id);
    }

    const totalQuestions = blueprint.numQuestions;
    const topicShare = Math.round(
      totalQuestions * (blueprint.topicShare || 0.6),
    );
    const relatedShare = Math.round(
      totalQuestions * (blueprint.relatedTopicShare || 0.3),
    );
    const randomShare = totalQuestions - topicShare - relatedShare;

    // ML-adaptive difficulty for the focus topic(s)
    const defaultDist = blueprint.difficultyDistribution;
    const primaryTopicForML = topicId || focusTopicIds[0];
    const adaptedDist = primaryTopicForML
      ? await getAdaptiveDifficulty(userId, primaryTopicForML, defaultDist)
      : defaultDist;
    const difficulties = Object.keys(adaptedDist);

    // 1. Focus topic questions (with ML-adapted distribution)
    const focusDiffDist = distributeDifficulty(topicShare, adaptedDist);
    for (const [difficulty, count] of Object.entries(focusDiffDist)) {
      if (count <= 0) continue;
      const candidates = await this.fetchCandidates(
        focusTopicIds,
        [difficulty],
        [...recentQIds, ...selected.map((q) => q.id)],
        count * 3,
      );
      selected.push(...sample(candidates, count));
    }

    // 2. Related topic questions
    if (relatedTopicIds.length > 0 && relatedShare > 0) {
      const relatedCandidates = await this.fetchCandidates(
        relatedTopicIds,
        difficulties,
        [...recentQIds, ...selected.map((q) => q.id)],
        relatedShare * 3,
      );
      selected.push(...sample(relatedCandidates, relatedShare));
    }

    // 3. Random challenge questions
    if (randomShare > 0) {
      const excludeSet = new Set([...recentQIds, ...selected.map((q) => q.id)]);
      const { data: allQuestions } = await this.supabase
        .from("questions")
        .select("*");

      const randomPool = (allQuestions || []).filter(
        (q) => !excludeSet.has(q.id),
      );
      selected.push(...sample(randomPool, randomShare));
    }

    return selected;
  }

  /**
   * Build retest assessment (weak-topic prioritization).
   * Uses per-topic ML difficulty to adapt each weak area individually.
   */
  async buildRetestQuiz(userId, blueprint, config, recentQIds) {
    const selected = [];
    const weakTopics = await this.getWeakTopics(userId, 10, config.subjectId);

    const totalQuestions = blueprint.numQuestions;
    const weakShare = Math.round(
      totalQuestions * (blueprint.weakTopicShare || 0.6),
    );
    const neutralShare = Math.round(
      totalQuestions * (blueprint.neutralTopicShare || 0.3),
    );
    const challengeShare = totalQuestions - weakShare - neutralShare;

    const defaultDist = blueprint.difficultyDistribution;

    // Batch-fetch ML difficulty for all weak topics
    const weakTopicIds = weakTopics.map((t) => t.topic_id);
    const adaptiveDistMap = await getBatchAdaptiveDifficulties(
      userId,
      weakTopicIds,
      defaultDist,
    );

    // 1. Weak topic questions (prioritized by (1 - accuracy), ML-adapted difficulty)
    if (weakTopics.length > 0) {
      const totalWeight = weakTopics.reduce(
        (sum, t) => sum + (1 - t.accuracy + 0.05),
        0,
      );

      for (const topic of weakTopics) {
        const weight = (1 - topic.accuracy + 0.05) / totalWeight;
        const questionsForTopic = Math.ceil(weakShare * weight);

        // Per-topic ML-adapted difficulty distribution
        const topicDist = adaptiveDistMap.get(topic.topic_id) || defaultDist;
        const topicDiffDist = distributeDifficulty(
          questionsForTopic,
          topicDist,
        );

        for (const [difficulty, count] of Object.entries(topicDiffDist)) {
          if (count <= 0) continue;
          const candidates = await this.fetchCandidates(
            [topic.topic_id],
            [difficulty],
            [...recentQIds, ...selected.map((q) => q.id)],
            count * 3,
          );
          selected.push(...sample(candidates, count));
        }
      }
    }

    // 2. Neutral/moderate questions
    if (neutralShare > 0) {
      const { data: moderateTopics } = await this.supabase
        .from("user_topic_stats")
        .select("topic_id")
        .eq("user_id", userId)
        .gte("accuracy", 0.4)
        .lt("accuracy", 0.75)
        .limit(5);

      const topicIds = (moderateTopics || []).map((t) => t.topic_id);
      if (topicIds.length > 0) {
        const difficulties = Object.keys(defaultDist);
        const candidates = await this.fetchCandidates(
          topicIds,
          difficulties,
          [...recentQIds, ...selected.map((q) => q.id)],
          neutralShare * 3,
        );
        selected.push(...sample(candidates, neutralShare));
      }
    }

    // 3. Challenge questions (hard difficulty)
    if (challengeShare > 0) {
      const { data: hardQuestions } = await this.supabase
        .from("questions")
        .select("*")
        .eq("difficulty", "hard")
        .limit(challengeShare * 3);

      const excludeSet = new Set([...recentQIds, ...selected.map((q) => q.id)]);
      const challengePool = (hardQuestions || []).filter(
        (q) => !excludeSet.has(q.id),
      );
      selected.push(...sample(challengePool, challengeShare));
    }

    return selected;
  }

  /**
   * Create question snapshot for immutable storage
   */
  createQuestionSnapshot(question) {
    return {
      question_text: question.question_text,
      options: {
        A: question.option_a,
        B: question.option_b,
        C: question.option_c,
        D: question.option_d,
      },
      correct_option: question.correct_option,
      difficulty: question.difficulty,
      explanation: question.explanation,
      topic_id: question.topic_id,
      subject_id: question.subject_id,
    };
  }

  /**
   * Main quiz generation function
   */
  async generateQuiz({
    userId,
    type = "diagnostic",
    numQuestions = null,
    subjectFilter = null,
    topicId = null,
    subjectId = null,
    blueprintOverride = null,
  }) {
    try {
      // 1. Get blueprint configuration
      const baseBlueprint = getBlueprint(type);
      const blueprint = {
        ...baseBlueprint,
        ...blueprintOverride,
        numQuestions: numQuestions || baseBlueprint.numQuestions,
      };

      // 2. Get recent question IDs to exclude
      const recentQIds = await this.getRecentQuestionIds(
        userId,
        blueprint.excludeRecentDays || REPEAT_AVOIDANCE.EXCLUDE_RECENT_DAYS,
      );

      // 3. Build questions based on assessment type
      let selected = [];
      const config = { topicId, subjectId, subjectFilter };

      switch (type) {
        case "diagnostic":
          selected = await this.buildDiagnosticQuiz(
            userId,
            blueprint,
            recentQIds,
          );
          break;
        case "practice":
          selected = await this.buildPracticeQuiz(
            userId,
            blueprint,
            config,
            recentQIds,
          );
          break;
        case "retest":
          selected = await this.buildRetestQuiz(
            userId,
            blueprint,
            config,
            recentQIds,
          );
          break;
        default:
          selected = await this.buildDiagnosticQuiz(
            userId,
            blueprint,
            recentQIds,
          );
      }

      // 4. Validate we have enough questions
      if (selected.length < Math.ceil(blueprint.numQuestions * 0.5)) {
        console.warn(
          `Only found ${selected.length} questions, minimum expected: ${Math.ceil(blueprint.numQuestions * 0.5)}`,
        );
        // Fall back to any available questions
        const { data: fallbackQuestions } = await this.supabase
          .from("questions")
          .select("*")
          .limit(blueprint.numQuestions * 2);

        const excludeSet = new Set([
          ...recentQIds,
          ...selected.map((q) => q.id),
        ]);
        const additionalPool = (fallbackQuestions || []).filter(
          (q) => !excludeSet.has(q.id),
        );
        selected.push(
          ...sample(additionalPool, blueprint.numQuestions - selected.length),
        );
      }

      // 5. Shuffle and trim to exact count
      const shuffled = shuffle(selected);
      const finalQuestions = shuffled.slice(0, blueprint.numQuestions);

      // 6. Create assessment record
      const { data: assessment, error: assessmentError } = await this.supabase
        .from("assessments")
        .insert({
          user_id: userId,
          assessment_type: type,
          status: "in_progress",
          total_questions: finalQuestions.length,
          started_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (assessmentError) {
        throw new Error(
          `Failed to create assessment: ${assessmentError.message}`,
        );
      }

      // 7. Create assessment_questions records
      const snapshots = finalQuestions.map((q, idx) => ({
        assessment_id: assessment.id,
        question_id: q.id,
        question_order: idx + 1,
      }));

      const { data: insertedSnapshots, error: snapshotError } =
        await this.supabase
          .from("assessment_questions")
          .insert(snapshots)
          .select("id, question_id, question_order");

      if (snapshotError) {
        throw new Error(
          `Failed to create question snapshots: ${snapshotError.message}`,
        );
      }

      // 8. Record analytics event (optional — skip if RPC doesn't exist)
      try {
        await this.supabase.rpc("rpc_record_event", {
          p_user_id: userId,
          p_event_type: EVENT_TYPES.ASSESSMENT_STARTED,
          p_event_data: {
            assessment_id: assessment.id,
            assessment_type: type,
            num_questions: finalQuestions.length,
          },
        });
      } catch (_) {
        // RPC may not exist yet — non-critical
      }

      // 9. Return response
      // Build a question lookup for response mapping
      const questionMap = {};
      finalQuestions.forEach((q) => {
        questionMap[q.id] = q;
      });

      return {
        success: true,
        assessmentId: assessment.id,
        assessmentType: type,
        totalQuestions: finalQuestions.length,
        timeLimitSeconds: blueprint.timeLimitSeconds,
        questions: insertedSnapshots.map((s) => {
          const q = questionMap[s.question_id] || {};
          return {
            assessmentQuestionId: s.id,
            questionId: s.question_id,
            order: s.question_order,
            questionText: q.question_text || "",
            options: [
              q.option_a || "",
              q.option_b || "",
              q.option_c || "",
              q.option_d || "",
            ],
            difficulty: q.difficulty || "medium",
          };
        }),
      };
    } catch (error) {
      console.error("Quiz generation error:", error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.DATABASE_ERROR,
      };
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const quizGenerator = new QuizGenerator();

export async function generateQuiz(params) {
  return quizGenerator.generateQuiz(params);
}

export default QuizGenerator;
