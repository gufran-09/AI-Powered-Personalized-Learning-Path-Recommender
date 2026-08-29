/**
 * Level Classification Engine
 *
 * Classifies user proficiency levels per topic using production-ready rules.
 * Supports Laplace smoothing for stability and confidence scoring.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

import { supabaseAdmin } from "./supabaseAdmin.js";
import {
  LEVEL_CONFIG,
  calculateLevel,
  calculateLevelConfidence,
  calculateSmoothedAccuracy,
} from "./constants.js";

// ============================================================================
// LEVEL CLASSIFICATION CLASS
// ============================================================================

class LevelClassifier {
  constructor(supabase = supabaseAdmin) {
    this.supabase = supabase;
    this.config = LEVEL_CONFIG;
  }

  /**
   * Classify level based on raw stats
   */
  classifyLevel(
    attempts,
    correct,
    weightedScore = null,
    maxPossibleWeighted = null,
  ) {
    const {
      MIN_ATTEMPTS,
      INTERMEDIATE_THRESHOLD,
      ADVANCED_THRESHOLD,
      SMOOTHING_ALPHA,
    } = this.config;

    // Calculate raw accuracy
    const accuracy = attempts > 0 ? correct / attempts : 0;

    // Calculate smoothed accuracy for stability
    const smoothedAccuracy = calculateSmoothedAccuracy(correct, attempts);

    // Calculate weighted accuracy if available
    let weightedAccuracy = null;
    if (
      weightedScore !== null &&
      maxPossibleWeighted !== null &&
      maxPossibleWeighted > 0
    ) {
      weightedAccuracy = weightedScore / maxPossibleWeighted;
    }

    // Determine level
    let level;
    if (attempts < MIN_ATTEMPTS) {
      level = "beginner";
    } else if (accuracy < INTERMEDIATE_THRESHOLD) {
      level = "beginner";
    } else if (accuracy < ADVANCED_THRESHOLD) {
      level = "intermediate";
    } else {
      level = "advanced";
    }

    // Calculate confidence
    const confidence = calculateLevelConfidence(attempts);

    return {
      level,
      accuracy,
      smoothedAccuracy,
      weightedAccuracy,
      confidence,
      attempts,
      correct,
      meetsMinThreshold: attempts >= MIN_ATTEMPTS,
    };
  }

  /**
   * Get classification for a specific user-topic pair
   */
  async classifyUserTopic(userId, topicId) {
    const { data, error } = await this.supabase
      .from("user_topic_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .single();

    if (error || !data) {
      return {
        level: "beginner",
        accuracy: 0,
        smoothedAccuracy: 0.5, // Prior with smoothing
        confidence: 0,
        attempts: 0,
        correct: 0,
        meetsMinThreshold: false,
        exists: false,
      };
    }

    return {
      ...this.classifyLevel(
        data.attempts,
        data.correct,
        parseFloat(data.weighted_score),
        null,
      ),
      exists: true,
    };
  }

  /**
   * Batch classify multiple topics for a user
   */
  async classifyUserTopics(userId, topicIds) {
    const { data, error } = await this.supabase
      .from("user_topic_stats")
      .select("*")
      .eq("user_id", userId)
      .in("topic_id", topicIds);

    if (error) {
      console.error("Error fetching topic stats:", error);
      return {};
    }

    const results = {};

    // Process existing stats
    (data || []).forEach((stat) => {
      results[stat.topic_id] = {
        ...this.classifyLevel(
          stat.attempts,
          stat.correct,
          parseFloat(stat.weighted_score),
          null,
        ),
        exists: true,
      };
    });

    // Fill in missing topics
    topicIds.forEach((topicId) => {
      if (!results[topicId]) {
        results[topicId] = {
          level: "beginner",
          accuracy: 0,
          smoothedAccuracy: 0.5,
          confidence: 0,
          attempts: 0,
          correct: 0,
          meetsMinThreshold: false,
          exists: false,
        };
      }
    });

    return results;
  }

  /**
   * Get user's overall profile across all topics
   */
  async getUserProfile(userId) {
    const { data, error } = await this.supabase
      .from("user_topic_stats")
      .select(
        `
        topic_id,
        attempts,
        correct,
        accuracy,
        level,
        weighted_score,
        topics:topic_id (name, subject_id)
      `,
      )
      .eq("user_id", userId)
      .order("accuracy", { ascending: true });

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    const stats = data || [];

    // Aggregate metrics
    const totalAttempts = stats.reduce((sum, s) => sum + s.attempts, 0);
    const totalCorrect = stats.reduce((sum, s) => sum + s.correct, 0);
    const overallAccuracy =
      totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    // Count levels
    const levelCounts = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };

    stats.forEach((s) => {
      if (s.level && levelCounts[s.level] !== undefined) {
        levelCounts[s.level]++;
      }
    });

    // Determine overall level
    let overallLevel = "beginner";
    if (totalAttempts >= this.config.MIN_ATTEMPTS) {
      overallLevel = calculateLevel(overallAccuracy, totalAttempts);
    }

    // Find strongest and weakest topics
    const sortedByAccuracy = stats
      .filter((s) => s.attempts >= 3)
      .sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));

    return {
      totalTopicsAttempted: stats.length,
      totalAttempts,
      totalCorrect,
      overallAccuracy,
      overallLevel,
      levelDistribution: levelCounts,
      strongestTopics: sortedByAccuracy.slice(0, 3).map((s) => ({
        topicId: s.topic_id,
        topicName: s.topics?.name,
        accuracy: parseFloat(s.accuracy),
        level: s.level,
      })),
      weakestTopics: sortedByAccuracy
        .slice(-3)
        .reverse()
        .map((s) => ({
          topicId: s.topic_id,
          topicName: s.topics?.name,
          accuracy: parseFloat(s.accuracy),
          level: s.level,
        })),
      allTopicStats: stats.map((s) => ({
        topicId: s.topic_id,
        topicName: s.topics?.name,
        subjectId: s.topics?.subject_id,
        accuracy: parseFloat(s.accuracy),
        level: s.level,
        attempts: s.attempts,
        correct: s.correct,
      })),
    };
  }

  /**
   * Calculate level transition prediction
   * (How many more correct answers needed to level up)
   */
  predictLevelTransition(currentAttempts, currentCorrect, targetLevel) {
    const { MIN_ATTEMPTS, INTERMEDIATE_THRESHOLD, ADVANCED_THRESHOLD } =
      this.config;

    let targetAccuracy;
    switch (targetLevel) {
      case "intermediate":
        targetAccuracy = INTERMEDIATE_THRESHOLD;
        break;
      case "advanced":
        targetAccuracy = ADVANCED_THRESHOLD;
        break;
      default:
        return { possible: false, questionsNeeded: 0 };
    }

    const currentAccuracy =
      currentAttempts > 0 ? currentCorrect / currentAttempts : 0;

    if (currentAccuracy >= targetAccuracy && currentAttempts >= MIN_ATTEMPTS) {
      return { possible: true, questionsNeeded: 0, alreadyAchieved: true };
    }

    // Calculate: if user gets next N questions correct, what's the minimum N?
    // (currentCorrect + N) / (currentAttempts + N) >= targetAccuracy
    // N >= (targetAccuracy * currentAttempts - currentCorrect) / (1 - targetAccuracy)

    const numerator = targetAccuracy * currentAttempts - currentCorrect;
    const denominator = 1 - targetAccuracy;

    if (denominator <= 0) {
      return { possible: false, questionsNeeded: Infinity };
    }

    const questionsNeeded = Math.ceil(numerator / denominator);
    const totalAttemptsNeeded = Math.max(MIN_ATTEMPTS - currentAttempts, 0);

    return {
      possible: true,
      questionsNeeded: Math.max(questionsNeeded, totalAttemptsNeeded),
      currentAccuracy,
      targetAccuracy,
      alreadyAchieved: false,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const levelClassifier = new LevelClassifier();

export function classifyLevel(
  attempts,
  correct,
  weightedScore,
  maxPossibleWeighted,
) {
  return levelClassifier.classifyLevel(
    attempts,
    correct,
    weightedScore,
    maxPossibleWeighted,
  );
}

export async function classifyUserTopic(userId, topicId) {
  return levelClassifier.classifyUserTopic(userId, topicId);
}

export async function classifyUserTopics(userId, topicIds) {
  return levelClassifier.classifyUserTopics(userId, topicIds);
}

export async function getUserProfile(userId) {
  return levelClassifier.getUserProfile(userId);
}

export function predictLevelTransition(
  currentAttempts,
  currentCorrect,
  targetLevel,
) {
  return levelClassifier.predictLevelTransition(
    currentAttempts,
    currentCorrect,
    targetLevel,
  );
}

export default LevelClassifier;
