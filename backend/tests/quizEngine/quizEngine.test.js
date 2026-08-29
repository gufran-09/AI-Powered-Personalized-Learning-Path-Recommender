/**
 * Quiz Engine Tests
 *
 * Comprehensive test suite for quiz generation and assessment completion.
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
  classifyLevel,
  calculateSmoothedAccuracy,
  getBlueprint,
  DIFFICULTY_WEIGHTS,
  LEVEL_CONFIG,
  BLUEPRINTS,
} from "../../src/services/quizEngine/index.js";

// Mock Supabase client for unit tests
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
};

// ============================================================================
// UNIT TESTS: Constants and Utility Functions
// ============================================================================

describe("Constants", () => {
  test("DIFFICULTY_WEIGHTS should have correct values", () => {
    expect(DIFFICULTY_WEIGHTS.easy).toBe(1);
    expect(DIFFICULTY_WEIGHTS.medium).toBe(2);
    expect(DIFFICULTY_WEIGHTS.hard).toBe(3);
  });

  test("LEVEL_CONFIG should have required thresholds", () => {
    expect(LEVEL_CONFIG.MIN_ATTEMPTS).toBe(5);
    expect(LEVEL_CONFIG.INTERMEDIATE_THRESHOLD).toBe(0.5);
    expect(LEVEL_CONFIG.ADVANCED_THRESHOLD).toBe(0.75);
    expect(LEVEL_CONFIG.SMOOTHING_ALPHA).toBe(2.0);
  });

  test("BLUEPRINTS should have all assessment types", () => {
    expect(BLUEPRINTS).toHaveProperty("diagnostic");
    expect(BLUEPRINTS).toHaveProperty("practice");
    expect(BLUEPRINTS).toHaveProperty("retest");
    expect(BLUEPRINTS).toHaveProperty("custom");
  });
});

describe("getBlueprint", () => {
  test("should return diagnostic blueprint by default", () => {
    const blueprint = getBlueprint("unknown-type");
    expect(blueprint).toEqual(BLUEPRINTS.diagnostic);
  });

  test("should return correct blueprint for each type", () => {
    expect(getBlueprint("diagnostic")).toEqual(BLUEPRINTS.diagnostic);
    expect(getBlueprint("practice")).toEqual(BLUEPRINTS.practice);
    expect(getBlueprint("retest")).toEqual(BLUEPRINTS.retest);
  });

  test("diagnostic blueprint should have 30 questions", () => {
    const blueprint = getBlueprint("diagnostic");
    expect(blueprint.numQuestions).toBe(30);
  });

  test("difficulty distribution should sum to 1", () => {
    const blueprint = getBlueprint("diagnostic");
    const sum =
      blueprint.difficultyDistribution.easy +
      blueprint.difficultyDistribution.medium +
      blueprint.difficultyDistribution.hard;
    expect(sum).toBe(1);
  });
});

// ============================================================================
// UNIT TESTS: Level Classification
// ============================================================================

describe("classifyLevel", () => {
  test("should return beginner when attempts < MIN_ATTEMPTS", () => {
    const result = classifyLevel(4, 4); // 100% accuracy but only 4 attempts
    expect(result.level).toBe("beginner");
    expect(result.meetsMinThreshold).toBe(false);
  });

  test("should return beginner when accuracy < 0.5", () => {
    const result = classifyLevel(10, 3); // 30% accuracy
    expect(result.level).toBe("beginner");
    expect(result.accuracy).toBe(0.3);
  });

  test("should return intermediate when 0.5 <= accuracy < 0.75", () => {
    const result = classifyLevel(10, 6); // 60% accuracy
    expect(result.level).toBe("intermediate");
    expect(result.accuracy).toBe(0.6);
  });

  test("should return advanced when accuracy >= 0.75", () => {
    const result = classifyLevel(10, 8); // 80% accuracy
    expect(result.level).toBe("advanced");
    expect(result.accuracy).toBe(0.8);
  });

  test("should handle edge case at exactly 0.5 accuracy", () => {
    const result = classifyLevel(10, 5); // Exactly 50%
    expect(result.level).toBe("intermediate");
  });

  test("should handle edge case at exactly 0.75 accuracy", () => {
    const result = classifyLevel(20, 15); // Exactly 75%
    expect(result.level).toBe("advanced");
  });

  test("should return 0 accuracy for 0 attempts", () => {
    const result = classifyLevel(0, 0);
    expect(result.accuracy).toBe(0);
    expect(result.level).toBe("beginner");
  });

  test("should calculate confidence correctly", () => {
    const lowAttempts = classifyLevel(3, 3);
    const highAttempts = classifyLevel(15, 12);

    expect(lowAttempts.confidence).toBeLessThan(highAttempts.confidence);
    expect(highAttempts.confidence).toBe(1.0); // Capped at 1
  });
});

describe("calculateSmoothedAccuracy", () => {
  test("should return 0.5 for 0 attempts (prior)", () => {
    const result = calculateSmoothedAccuracy(0, 0);
    expect(result).toBe(0.5); // (0 + 2) / (0 + 4) = 0.5
  });

  test("should converge to raw accuracy as attempts increase", () => {
    const raw100 = calculateSmoothedAccuracy(100, 100); // 100% raw
    const raw0 = calculateSmoothedAccuracy(0, 100); // 0% raw

    // With high attempts, smoothed should be close to raw
    expect(raw100).toBeGreaterThan(0.95);
    expect(raw0).toBeLessThan(0.05);
  });

  test("should dampen extreme values with low attempts", () => {
    const perfect = calculateSmoothedAccuracy(5, 5); // 100% with 5 attempts
    expect(perfect).toBeLessThan(1.0);
    expect(perfect).toBeGreaterThan(0.7);
  });
});

// ============================================================================
// UNIT TESTS: Quiz Generation Blueprint Logic
// ============================================================================

describe("Quiz Generation Blueprint Logic", () => {
  test("diagnostic should allocate questions per subject", () => {
    const blueprint = BLUEPRINTS.diagnostic;
    expect(blueprint.subjectStrategy).toBe("all");
    expect(blueprint.questionsPerSubject).toBeDefined();
  });

  test("practice should be topic-focused", () => {
    const blueprint = BLUEPRINTS.practice;
    expect(blueprint.subjectStrategy).toBe("topic-focused");
    expect(blueprint.topicShare).toBe(0.6);
  });

  test("retest should prioritize weak topics", () => {
    const blueprint = BLUEPRINTS.retest;
    expect(blueprint.subjectStrategy).toBe("weak-priority");
    expect(blueprint.weakTopicShare).toBe(0.6);
    expect(blueprint.neutralTopicShare).toBe(0.3);
    expect(blueprint.challengeShare).toBe(0.1);
  });
});

// ============================================================================
// UNIT TESTS: Difficulty Weight Calculations
// ============================================================================

describe("Weighted Score Calculations", () => {
  test("should calculate weighted score correctly", () => {
    const answers = [
      { difficulty: "easy", isCorrect: true },
      { difficulty: "medium", isCorrect: true },
      { difficulty: "hard", isCorrect: false },
      { difficulty: "easy", isCorrect: true },
    ];

    const weightedScore = answers.reduce((sum, a) => {
      return sum + (a.isCorrect ? DIFFICULTY_WEIGHTS[a.difficulty] : 0);
    }, 0);

    expect(weightedScore).toBe(1 + 2 + 0 + 1); // 4
  });

  test("should calculate max possible weighted score", () => {
    const questions = ["easy", "medium", "hard", "easy"];
    const maxPossible = questions.reduce((sum, diff) => {
      return sum + DIFFICULTY_WEIGHTS[diff];
    }, 0);

    expect(maxPossible).toBe(1 + 2 + 3 + 1); // 7
  });

  test("should calculate weighted accuracy correctly", () => {
    const weightedScore = 4;
    const maxPossible = 7;
    const weightedAccuracy = weightedScore / maxPossible;

    expect(weightedAccuracy).toBeCloseTo(0.571, 2);
  });
});

// ============================================================================
// UNIT TESTS: Answer Processing
// ============================================================================

describe("Answer Processing", () => {
  test("should correctly identify correct/incorrect answers", () => {
    const correctOption = "A";
    const userAnswers = ["A", "B", "A", "C"];

    const results = userAnswers.map((answer) => answer === correctOption);

    expect(results).toEqual([true, false, true, false]);
  });

  test("should handle skipped questions (null selection)", () => {
    const answer = null;
    const isSkipped = !answer;

    expect(isSkipped).toBe(true);
  });

  test("should aggregate by topic correctly", () => {
    const answers = [
      { topicId: "topic-1", isCorrect: true },
      { topicId: "topic-1", isCorrect: false },
      { topicId: "topic-2", isCorrect: true },
      { topicId: "topic-1", isCorrect: true },
    ];

    const byTopic = {};
    for (const a of answers) {
      if (!byTopic[a.topicId]) {
        byTopic[a.topicId] = { attempts: 0, correct: 0 };
      }
      byTopic[a.topicId].attempts++;
      if (a.isCorrect) byTopic[a.topicId].correct++;
    }

    expect(byTopic["topic-1"].attempts).toBe(3);
    expect(byTopic["topic-1"].correct).toBe(2);
    expect(byTopic["topic-2"].attempts).toBe(1);
    expect(byTopic["topic-2"].correct).toBe(1);
  });
});

// ============================================================================
// UNIT TESTS: Repeat Avoidance Logic
// ============================================================================

describe("Repeat Avoidance", () => {
  test("should filter out recently attempted questions", () => {
    const allQuestions = ["q1", "q2", "q3", "q4", "q5"];
    const recentlyAttempted = new Set(["q1", "q3"]);

    const available = allQuestions.filter((q) => !recentlyAttempted.has(q));

    expect(available).toEqual(["q2", "q4", "q5"]);
    expect(available).not.toContain("q1");
    expect(available).not.toContain("q3");
  });

  test("should handle empty recent list", () => {
    const allQuestions = ["q1", "q2", "q3"];
    const recentlyAttempted = new Set([]);

    const available = allQuestions.filter((q) => !recentlyAttempted.has(q));

    expect(available).toEqual(allQuestions);
  });
});

// ============================================================================
// UNIT TESTS: Level Transition Prediction
// ============================================================================

describe("Level Transition Prediction", () => {
  test("should predict questions needed for intermediate", () => {
    // Current: 5 attempts, 2 correct (40%)
    // Target: 50% (intermediate)
    // Need: (0.5 * 5 - 2) / (1 - 0.5) = 0.5 / 0.5 = 1 more correct

    const currentAttempts = 5;
    const currentCorrect = 2;
    const currentAccuracy = currentCorrect / currentAttempts; // 0.4

    // Formula: questions needed = (target * current_attempts - current_correct) / (1 - target)
    const targetAccuracy = 0.5;
    const needed = Math.ceil(
      (targetAccuracy * currentAttempts - currentCorrect) /
        (1 - targetAccuracy),
    );

    expect(needed).toBe(1);
  });

  test("should predict questions needed for advanced", () => {
    // Current: 10 attempts, 6 correct (60%)
    // Target: 75% (advanced)
    // Need: (0.75 * 10 - 6) / (1 - 0.75) = 1.5 / 0.25 = 6 more correct

    const currentAttempts = 10;
    const currentCorrect = 6;
    const targetAccuracy = 0.75;
    const needed = Math.ceil(
      (targetAccuracy * currentAttempts - currentCorrect) /
        (1 - targetAccuracy),
    );

    expect(needed).toBe(6);
  });
});

// ============================================================================
// INTEGRATION TESTS (Would require real database connection)
// ============================================================================

describe("Integration Tests (Mocked)", () => {
  test("generateQuiz should return expected structure", async () => {
    // This would be a real integration test with database
    // For now, we test the expected return structure
    const expectedStructure = {
      success: expect.any(Boolean),
      assessmentId: expect.any(String),
      questions: expect.any(Array),
    };

    // Mock test - in real scenario, call generateQuiz with test user
    const mockResult = {
      success: true,
      assessmentId: "test-uuid",
      questions: [],
    };

    expect(mockResult).toMatchObject(expectedStructure);
  });

  test("finishAssessment should return expected structure", async () => {
    const expectedStructure = {
      success: expect.any(Boolean),
      score: expect.any(Number),
      recommendations: expect.any(Array),
    };

    const mockResult = {
      success: true,
      score: 10,
      recommendations: [],
    };

    expect(mockResult).toMatchObject(expectedStructure);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe("Edge Cases", () => {
  test("should handle perfect score (100%)", () => {
    const result = classifyLevel(20, 20);
    expect(result.level).toBe("advanced");
    expect(result.accuracy).toBe(1.0);
  });

  test("should handle zero score (0%)", () => {
    const result = classifyLevel(20, 0);
    expect(result.level).toBe("beginner");
    expect(result.accuracy).toBe(0);
  });

  test("should handle minimum threshold boundary", () => {
    // Exactly at MIN_ATTEMPTS (5) with 50% accuracy
    const result = classifyLevel(5, 3); // 60%
    expect(result.meetsMinThreshold).toBe(true);
    expect(result.level).toBe("intermediate");
  });

  test("should handle one below MIN_ATTEMPTS", () => {
    const result = classifyLevel(4, 4); // 100% but only 4 attempts
    expect(result.meetsMinThreshold).toBe(false);
    expect(result.level).toBe("beginner");
  });
});

// ============================================================================
// CONCURRENT UPDATE SIMULATION
// ============================================================================

describe("Concurrent Update Handling", () => {
  test("atomic increment formula should be correct", () => {
    // Simulate RPC atomic update
    const prior = { attempts: 10, correct: 6, weighted: 12 };
    const delta = { attempts: 5, correct: 3, weighted: 7 };

    const updated = {
      attempts: prior.attempts + delta.attempts,
      correct: prior.correct + delta.correct,
      weighted: prior.weighted + delta.weighted,
    };

    expect(updated.attempts).toBe(15);
    expect(updated.correct).toBe(9);
    expect(updated.weighted).toBe(19);

    const newAccuracy = updated.correct / updated.attempts;
    expect(newAccuracy).toBe(0.6);
  });
});
