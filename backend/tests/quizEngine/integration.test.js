/**
 * Quiz Engine Integration Tests
 *
 * End-to-end tests for the quiz engine workflow.
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
 *
 * Run with: npm test -- --testPathPattern=integration
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  jest,
} from "@jest/globals";
import {
  generateQuiz,
  finishAssessment,
  resumeAssessment,
  abandonAssessment,
  getRecommendations,
  getWeakTopicRecommendations,
  getUserProfile,
  classifyUserTopic,
  supabaseAdmin,
} from "../../src/services/quizEngine/index.js";

// Test configuration
const TEST_CONFIG = {
  enabled: process.env.RUN_INTEGRATION_TESTS === "true",
  testUserId:
    process.env.TEST_USER_ID || "00000000-0000-0000-0000-000000000001",
  timeout: 30000,
};

// Skip integration tests if not enabled
const describeIntegration = TEST_CONFIG.enabled ? describe : describe.skip;

// ============================================================================
// TEST UTILITIES
// ============================================================================

async function createTestUser() {
  // In a real scenario, this would create a test user in auth.users
  // For now, we use a placeholder UUID
  return TEST_CONFIG.testUserId;
}

async function cleanupTestData(userId) {
  // Clean up test data after tests
  try {
    await supabaseAdmin.from("user_answers").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_topic_stats").delete().eq("user_id", userId);
    await supabaseAdmin
      .from("user_subject_stats")
      .delete()
      .eq("user_id", userId);
    await supabaseAdmin.from("recommendations").delete().eq("user_id", userId);
    await supabaseAdmin.from("assessment_questions").delete().match({
      "assessments.user_id": userId,
    });
    await supabaseAdmin.from("assessments").delete().eq("user_id", userId);
  } catch (error) {
    console.warn("Cleanup warning:", error.message);
  }
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describeIntegration("Quiz Engine Integration Tests", () => {
  let testUserId;
  let assessmentId;
  let questions;

  beforeAll(async () => {
    testUserId = await createTestUser();
    console.log("Test user ID:", testUserId);
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Optionally clean up test data
    if (process.env.CLEANUP_TEST_DATA === "true") {
      await cleanupTestData(testUserId);
    }
  }, TEST_CONFIG.timeout);

  // ============================================================================
  // DIAGNOSTIC QUIZ FLOW
  // ============================================================================

  describe("Diagnostic Quiz Flow", () => {
    test(
      "should generate a diagnostic quiz",
      async () => {
        const result = await generateQuiz({
          userId: testUserId,
          type: "diagnostic",
          numQuestions: 10, // Smaller for testing
        });

        expect(result.success).toBe(true);
        expect(result.assessmentId).toBeDefined();
        expect(result.questions).toBeDefined();
        expect(result.questions.length).toBeGreaterThan(0);
        expect(result.questions.length).toBeLessThanOrEqual(10);

        // Store for next tests
        assessmentId = result.assessmentId;
        questions = result.questions;

        console.log(
          `Generated assessment: ${assessmentId} with ${questions.length} questions`,
        );
      },
      TEST_CONFIG.timeout,
    );

    test("questions should have required fields", () => {
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);

      const question = questions[0];
      expect(question).toHaveProperty("assessmentQuestionId");
      expect(question).toHaveProperty("questionId");
      expect(question).toHaveProperty("text");
      expect(question).toHaveProperty("options");
      expect(question).toHaveProperty("order");
      expect(question.options).toHaveLength(4);
    });

    test(
      "should resume an in-progress assessment",
      async () => {
        expect(assessmentId).toBeDefined();

        const result = await resumeAssessment(assessmentId, testUserId);

        expect(result.success).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
        expect(result.questions).toBeDefined();
      },
      TEST_CONFIG.timeout,
    );

    test(
      "should finish assessment and update stats",
      async () => {
        expect(assessmentId).toBeDefined();
        expect(questions).toBeDefined();

        // Create mock answers (alternating correct/incorrect)
        const answers = questions.map((q, idx) => ({
          questionId: q.questionId,
          assessmentQuestionId: q.assessmentQuestionId,
          selectedOption: ["A", "B", "C", "D"][idx % 4],
          timeTakenSeconds: Math.floor(Math.random() * 60) + 10,
        }));

        const result = await finishAssessment({
          userId: testUserId,
          assessmentId,
          answers,
          timeSpentSeconds: 300,
        });

        expect(result.success).toBe(true);
        expect(result.assessmentId).toBe(assessmentId);
        expect(result.score).toBeDefined();
        expect(result.totalQuestions).toBe(questions.length);
        expect(result.perTopicStats).toBeDefined();

        console.log(
          `Assessment completed. Score: ${result.score}/${result.totalQuestions}`,
        );
      },
      TEST_CONFIG.timeout,
    );

    test(
      "should not allow finishing same assessment twice",
      async () => {
        expect(assessmentId).toBeDefined();

        const result = await finishAssessment({
          userId: testUserId,
          assessmentId,
          answers: [],
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain("already completed");
      },
      TEST_CONFIG.timeout,
    );
  });

  // ============================================================================
  // USER STATS VERIFICATION
  // ============================================================================

  describe("User Stats After Assessment", () => {
    test(
      "should have updated user_topic_stats",
      async () => {
        const { data, error } = await supabaseAdmin
          .from("user_topic_stats")
          .select("*")
          .eq("user_id", testUserId);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.length).toBeGreaterThan(0);

        const stat = data[0];
        expect(stat).toHaveProperty("attempts");
        expect(stat).toHaveProperty("correct");
        expect(stat).toHaveProperty("accuracy");
        expect(stat).toHaveProperty("level");
        expect(stat.attempts).toBeGreaterThan(0);

        console.log(`Found ${data.length} topic stats for user`);
      },
      TEST_CONFIG.timeout,
    );

    test(
      "should classify user topic correctly",
      async () => {
        const { data: stats } = await supabaseAdmin
          .from("user_topic_stats")
          .select("topic_id")
          .eq("user_id", testUserId)
          .limit(1)
          .single();

        if (stats) {
          const classification = await classifyUserTopic(
            testUserId,
            stats.topic_id,
          );

          expect(classification).toHaveProperty("level");
          expect(classification).toHaveProperty("accuracy");
          expect(classification).toHaveProperty("confidence");
          expect(["beginner", "intermediate", "advanced"]).toContain(
            classification.level,
          );
        }
      },
      TEST_CONFIG.timeout,
    );

    test(
      "should get user profile",
      async () => {
        const profile = await getUserProfile(testUserId);

        expect(profile).toBeDefined();
        expect(profile).toHaveProperty("totalTopicsAttempted");
        expect(profile).toHaveProperty("totalAttempts");
        expect(profile).toHaveProperty("overallAccuracy");
        expect(profile).toHaveProperty("overallLevel");

        console.log(
          `User profile: ${profile.totalTopicsAttempted} topics, ${profile.totalAttempts} attempts`,
        );
      },
      TEST_CONFIG.timeout,
    );
  });

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  describe("Recommendations", () => {
    test(
      "should get weak topic recommendations",
      async () => {
        const recommendations = await getWeakTopicRecommendations(
          testUserId,
          5,
        );

        expect(recommendations).toBeDefined();
        expect(Array.isArray(recommendations)).toBe(true);

        if (recommendations.length > 0) {
          const rec = recommendations[0];
          expect(rec).toHaveProperty("topic_id");
          expect(rec).toHaveProperty("accuracy");
          expect(rec).toHaveProperty("level");
          expect(rec).toHaveProperty("reason");

          console.log(`Got ${recommendations.length} recommendations`);
        }
      },
      TEST_CONFIG.timeout,
    );

    test(
      "should get topic-specific recommendations",
      async () => {
        const { data: stats } = await supabaseAdmin
          .from("user_topic_stats")
          .select("topic_id")
          .eq("user_id", testUserId)
          .limit(3);

        if (stats && stats.length > 0) {
          const topicIds = stats.map((s) => s.topic_id);
          const recommendations = await getRecommendations(
            testUserId,
            topicIds,
          );

          expect(recommendations).toBeDefined();
          expect(Array.isArray(recommendations)).toBe(true);
          expect(recommendations.length).toBeLessThanOrEqual(topicIds.length);
        }
      },
      TEST_CONFIG.timeout,
    );
  });

  // ============================================================================
  // PRACTICE QUIZ
  // ============================================================================

  describe("Practice Quiz Flow", () => {
    let practiceAssessmentId;

    test(
      "should generate a topic-focused practice quiz",
      async () => {
        // Get a topic to practice
        const { data: topics } = await supabaseAdmin
          .from("topics")
          .select("id, subject_id")
          .limit(1)
          .single();

        if (topics) {
          const result = await generateQuiz({
            userId: testUserId,
            type: "practice",
            topicId: topics.id,
            subjectId: topics.subject_id,
            numQuestions: 5,
          });

          expect(result.success).toBe(true);
          expect(result.assessmentType).toBe("practice");
          expect(result.questions.length).toBeLessThanOrEqual(5);

          practiceAssessmentId = result.assessmentId;
        }
      },
      TEST_CONFIG.timeout,
    );

    test(
      "should be able to abandon practice quiz",
      async () => {
        if (practiceAssessmentId) {
          const result = await abandonAssessment(
            practiceAssessmentId,
            testUserId,
          );
          expect(result.success).toBe(true);
          expect(result.status).toBe("abandoned");
        }
      },
      TEST_CONFIG.timeout,
    );
  });

  // ============================================================================
  // RETEST QUIZ (Weak Topic Prioritization)
  // ============================================================================

  describe("Retest Quiz Flow", () => {
    test(
      "should generate a retest quiz prioritizing weak topics",
      async () => {
        const result = await generateQuiz({
          userId: testUserId,
          type: "retest",
          numQuestions: 5,
        });

        expect(result.success).toBe(true);
        expect(result.assessmentType).toBe("retest");

        console.log(
          `Retest quiz generated with ${result.questions.length} questions`,
        );
      },
      TEST_CONFIG.timeout,
    );
  });

  // ============================================================================
  // REPEAT AVOIDANCE
  // ============================================================================

  describe("Repeat Avoidance", () => {
    test(
      "should not repeat recently answered questions",
      async () => {
        // Get recently answered question IDs
        const { data: recentAnswers } = await supabaseAdmin
          .from("user_answers")
          .select("question_id")
          .eq("user_id", testUserId)
          .order("answered_at", { ascending: false })
          .limit(50);

        const recentQuestionIds = new Set(
          (recentAnswers || []).map((a) => a.question_id),
        );

        // Generate new quiz
        const result = await generateQuiz({
          userId: testUserId,
          type: "diagnostic",
          numQuestions: 5,
        });

        expect(result.success).toBe(true);

        // Check that questions are not in recent set (most should be new)
        const newQuestionIds = result.questions.map((q) => q.questionId);
        const repeats = newQuestionIds.filter((id) =>
          recentQuestionIds.has(id),
        );

        // Allow some repeats if pool is small, but most should be new
        const repeatRatio = repeats.length / newQuestionIds.length;
        expect(repeatRatio).toBeLessThan(0.5);

        console.log(
          `Repeat check: ${repeats.length}/${newQuestionIds.length} were repeats`,
        );
      },
      TEST_CONFIG.timeout,
    );
  });
});

// ============================================================================
// CONCURRENT UPDATE TESTS
// ============================================================================

describeIntegration("Concurrent Update Tests", () => {
  test(
    "should handle concurrent stat updates correctly",
    async () => {
      const testUserId = TEST_CONFIG.testUserId;

      // Simulate concurrent updates by calling RPC multiple times quickly
      const updates = [
        supabaseAdmin.rpc("rpc_upsert_user_topic_stats", {
          p_user_id: testUserId,
          p_topic_id: "a1111111-1111-1111-1111-111111111111",
          p_subject_id: "11111111-1111-1111-1111-111111111111",
          p_attempts: 1,
          p_correct: 1,
          p_weighted_score: 2,
        }),
        supabaseAdmin.rpc("rpc_upsert_user_topic_stats", {
          p_user_id: testUserId,
          p_topic_id: "a1111111-1111-1111-1111-111111111111",
          p_subject_id: "11111111-1111-1111-1111-111111111111",
          p_attempts: 1,
          p_correct: 0,
          p_weighted_score: 0,
        }),
      ];

      const results = await Promise.allSettled(updates);

      // Both should succeed (atomic updates)
      const successes = results.filter((r) => r.status === "fulfilled");
      expect(successes.length).toBe(2);

      // Final state should reflect both updates
      const { data: finalState } = await supabaseAdmin
        .from("user_topic_stats")
        .select("attempts, correct")
        .eq("user_id", testUserId)
        .eq("topic_id", "a1111111-1111-1111-1111-111111111111")
        .single();

      if (finalState) {
        // Both updates should have been applied
        expect(finalState.attempts).toBeGreaterThanOrEqual(2);
      }
    },
    TEST_CONFIG.timeout,
  );
});
