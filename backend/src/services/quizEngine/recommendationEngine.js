/**
 * Recommendation Engine
 *
 * Handles playlist/resource recommendations based on user performance
 * and topic levels. Supports both multi-level and single-playlist subjects.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

import { supabaseAdmin } from "./supabaseAdmin.js";
import {
  SUBJECT_CONFIG,
  subjectHasLevels,
  calculateLevel,
  LEVEL_CONFIG,
} from "./constants.js";

// ============================================================================
// RECOMMENDATION ENGINE CLASS
// ============================================================================

class RecommendationEngine {
  constructor(supabase = supabaseAdmin) {
    this.supabase = supabase;
  }

  /**
   * Get user's stats for specified topics
   */
  async getUserTopicStats(userId, topicIds) {
    const { data, error } = await this.supabase
      .from("user_topic_stats")
      .select(
        `
        topic_id,
        accuracy,
        level,
        attempts,
        correct,
        weighted_score
      `,
      )
      .eq("user_id", userId)
      .in("topic_id", topicIds);

    if (error) {
      console.error("Error fetching user topic stats:", error);
      return {};
    }

    const map = {};
    (data || []).forEach((stat) => {
      map[stat.topic_id] = stat;
    });

    return map;
  }

  /**
   * Get topic and subject information
   */
  async getTopicInfo(topicIds) {
    const { data, error } = await this.supabase
      .from("topics")
      .select(
        `
        id,
        name,
        subject_id,
        subjects:subject_id (
          id,
          name,
          has_levels
        )
      `,
      )
      .in("id", topicIds);

    if (error) {
      console.error("Error fetching topic info:", error);
      return {};
    }

    const map = {};
    (data || []).forEach((topic) => {
      map[topic.id] = topic;
    });

    return map;
  }

  /**
   * Find resource for topic + level (multi-level subjects)
   */
  async findResourceForTopicLevel(topicId, level, subjectId) {
    // 1. Try exact match: topic + level
    let { data: resources } = await this.supabase
      .from("learning_resources")
      .select("*")
      .eq("topic_id", topicId)
      .eq("level", level)
      .order("priority", { ascending: true })
      .limit(1);

    if (resources && resources.length > 0) {
      return resources[0];
    }

    // 2. Fallback: same topic, any level
    ({ data: resources } = await this.supabase
      .from("learning_resources")
      .select("*")
      .eq("topic_id", topicId)
      .order("priority", { ascending: true })
      .limit(1));

    if (resources && resources.length > 0) {
      return resources[0];
    }

    // 3. Fallback: subject-level resource
    if (subjectId) {
      ({ data: resources } = await this.supabase
        .from("learning_resources")
        .select("*")
        .eq("subject_id", subjectId)
        .is("topic_id", null)
        .order("priority", { ascending: true })
        .limit(1));

      if (resources && resources.length > 0) {
        return resources[0];
      }
    }

    return null;
  }

  /**
   * Find resource for single-playlist subject
   */
  async findSubjectResource(subjectId) {
    const { data: resources } = await this.supabase
      .from("learning_resources")
      .select("*")
      .eq("subject_id", subjectId)
      .is("topic_id", null)
      .order("priority", { ascending: true })
      .limit(1);

    if (resources && resources.length > 0) {
      return resources[0];
    }

    return null;
  }

  /**
   * Generate reason string for recommendation
   */
  generateReason(accuracy, level, attempts) {
    const { MIN_ATTEMPTS, INTERMEDIATE_THRESHOLD, ADVANCED_THRESHOLD } =
      LEVEL_CONFIG;
    const pct = Math.round(accuracy * 100);

    if (attempts < MIN_ATTEMPTS) {
      return `Only ${attempts} attempts - need more practice to assess level`;
    }

    if (accuracy < INTERMEDIATE_THRESHOLD) {
      return `Low accuracy (${pct}%) - foundational review recommended`;
    }

    if (accuracy < ADVANCED_THRESHOLD) {
      return `Moderate accuracy (${pct}%) - strengthen intermediate concepts`;
    }

    return `Good accuracy (${pct}%) - ready for advanced material`;
  }

  /**
   * Get recommendations for specified topics
   */
  async getRecommendations(userId, topicIds) {
    try {
      if (!topicIds || topicIds.length === 0) {
        return [];
      }

      // Get user stats and topic info
      const [userStats, topicInfo] = await Promise.all([
        this.getUserTopicStats(userId, topicIds),
        this.getTopicInfo(topicIds),
      ]);

      const recommendations = [];

      for (const topicId of topicIds) {
        const topic = topicInfo[topicId];
        if (!topic) continue;

        const stats = userStats[topicId] || {
          accuracy: 0,
          level: "beginner",
          attempts: 0,
          correct: 0,
        };

        const subject = topic.subjects;
        const hasLevels = subject?.has_levels !== false;

        let resource = null;

        if (hasLevels) {
          // Multi-level subject: match topic + level
          resource = await this.findResourceForTopicLevel(
            topicId,
            stats.level || "beginner",
            topic.subject_id,
          );
        } else {
          // Single-playlist subject: get subject-level resource
          resource = await this.findSubjectResource(topic.subject_id);
        }

        const reason = this.generateReason(
          parseFloat(stats.accuracy) || 0,
          stats.level || "beginner",
          stats.attempts || 0,
        );

        recommendations.push({
          topic_id: topicId,
          topic_name: topic.name,
          subject_id: topic.subject_id,
          subject_name: subject?.name || "Unknown",
          accuracy: parseFloat(stats.accuracy) || 0,
          level: stats.level || "beginner",
          attempts: stats.attempts || 0,
          resource: resource,
          reason,
        });
      }

      // Sort by accuracy (weakest first)
      recommendations.sort((a, b) => a.accuracy - b.accuracy);

      return recommendations;
    } catch (error) {
      console.error("Recommendation error:", error);
      return [];
    }
  }

  /**
   * Get recommendations for user's weakest topics
   */
  async getWeakTopicRecommendations(userId, limit = 5) {
    try {
      // Get weak topics
      const { data: weakTopics, error } = await this.supabase
        .from("user_topic_stats")
        .select("topic_id")
        .eq("user_id", userId)
        .gt("attempts", 0)
        .order("accuracy", { ascending: true })
        .limit(limit);

      if (error || !weakTopics || weakTopics.length === 0) {
        return [];
      }

      const topicIds = weakTopics.map((t) => t.topic_id);
      return this.getRecommendations(userId, topicIds);
    } catch (error) {
      console.error("Weak topic recommendations error:", error);
      return [];
    }
  }

  /**
   * Get recommendations by subject
   */
  async getSubjectRecommendations(userId, subjectId, limit = 3) {
    try {
      // Get topics for this subject that user has attempted
      const { data: userTopics } = await this.supabase
        .from("user_topic_stats")
        .select(
          `
          topic_id,
          accuracy,
          topics:topic_id (subject_id)
        `,
        )
        .eq("user_id", userId)
        .gt("attempts", 0);

      // Filter by subject
      const subjectTopics = (userTopics || [])
        .filter((t) => t.topics?.subject_id === subjectId)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, limit)
        .map((t) => t.topic_id);

      if (subjectTopics.length === 0) {
        // No attempts yet - recommend foundational topics
        const { data: topics } = await this.supabase
          .from("topics")
          .select("id")
          .eq("subject_id", subjectId)
          .limit(limit);

        return this.getRecommendations(
          userId,
          (topics || []).map((t) => t.id),
        );
      }

      return this.getRecommendations(userId, subjectTopics);
    } catch (error) {
      console.error("Subject recommendations error:", error);
      return [];
    }
  }

  /**
   * Mark recommendation as viewed/started/completed
   * (no-op: recommendations table does not exist in current DB)
   */
  async updateRecommendationStatus(recommendationId, userId, status) {
    // recommendations table does not exist — return success as no-op
    return { success: true, note: "recommendations table not available" };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const recommendationEngine = new RecommendationEngine();

export async function getRecommendations(userId, topicIds) {
  return recommendationEngine.getRecommendations(userId, topicIds);
}

export async function getWeakTopicRecommendations(userId, limit) {
  return recommendationEngine.getWeakTopicRecommendations(userId, limit);
}

export async function getSubjectRecommendations(userId, subjectId, limit) {
  return recommendationEngine.getSubjectRecommendations(
    userId,
    subjectId,
    limit,
  );
}

export async function updateRecommendationStatus(
  recommendationId,
  userId,
  status,
) {
  return recommendationEngine.updateRecommendationStatus(
    recommendationId,
    userId,
    status,
  );
}

export default RecommendationEngine;
