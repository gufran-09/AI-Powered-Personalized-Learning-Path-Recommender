/**
 * Quiz Engine Constants & Configuration
 *
 * Centralized configuration for quiz generation, level classification,
 * and recommendation logic.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

// ============================================================================
// DIFFICULTY WEIGHTS (Used for weighted score calculation)
// ============================================================================
export const DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

// ============================================================================
// LEVEL CLASSIFICATION THRESHOLDS
// ============================================================================
export const LEVEL_CONFIG = {
  MIN_ATTEMPTS: 5, // Minimum attempts before trusting level
  INTERMEDIATE_THRESHOLD: 0.5, // accuracy >= 0.5 for intermediate
  ADVANCED_THRESHOLD: 0.75, // accuracy >= 0.75 for advanced
  SMOOTHING_ALPHA: 2.0, // Laplace smoothing parameter
};

// ============================================================================
// REPEAT AVOIDANCE CONFIG
// ============================================================================
export const REPEAT_AVOIDANCE = {
  EXCLUDE_RECENT_DAYS: 90, // Default days to exclude recent questions
  EXCLUDE_RECENT_COUNT: 200, // Alternative: last N questions
  MIN_CANDIDATE_POOL: 150, // Minimum candidates to fetch per bucket
};

// ============================================================================
// ASSESSMENT BLUEPRINTS
// ============================================================================
export const BLUEPRINTS = {
  diagnostic: {
    numQuestions: 30,
    difficultyDistribution: { easy: 0.4, medium: 0.4, hard: 0.2 },
    subjectStrategy: "all",
    questionsPerSubject: 3,
    excludeRecentDays: 90,
    timeLimitSeconds: 2700, // 45 minutes
  },

  practice: {
    numQuestions: 20,
    difficultyDistribution: { easy: 0.3, medium: 0.5, hard: 0.2 },
    subjectStrategy: "topic-focused",
    topicShare: 0.6,
    relatedTopicShare: 0.3,
    randomShare: 0.1,
    excludeRecentDays: 30,
    timeLimitSeconds: 1800, // 30 minutes
  },

  retest: {
    numQuestions: 25,
    difficultyDistribution: { easy: 0.3, medium: 0.5, hard: 0.2 },
    subjectStrategy: "weak-priority",
    weakTopicShare: 0.6,
    neutralTopicShare: 0.3,
    challengeShare: 0.1,
    excludeRecentDays: 14,
    timeLimitSeconds: 2250, // 37.5 minutes
  },

  custom: {
    numQuestions: 10,
    difficultyDistribution: { easy: 0.33, medium: 0.34, hard: 0.33 },
    subjectStrategy: "topic-focused",
    excludeRecentDays: 7,
    timeLimitSeconds: 900, // 15 minutes
  },
};

// ============================================================================
// SUBJECT CONFIGURATION
// ============================================================================
export const SUBJECT_CONFIG = {
  // Multi-level subjects by name (case-insensitive match)
  MULTI_LEVEL_NAMES: ["dsa", "oop", "dbms", "os", "cn"],

  // Single-playlist subjects by name
  SINGLE_PLAYLIST_NAMES: [
    "verbal",
    "quant",
    "logical",
    "system design",
    "software engineering",
  ],
};

// ============================================================================
// API RESPONSE CODES
// ============================================================================
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// ============================================================================
// ANALYTICS EVENT TYPES
// ============================================================================
export const EVENT_TYPES = {
  ASSESSMENT_STARTED: "assessment_started",
  ASSESSMENT_COMPLETED: "assessment_completed",
  ASSESSMENT_ABANDONED: "assessment_abandoned",
  QUESTION_ANSWERED: "question_answered",
  RECOMMENDATION_SHOWN: "recommendation_shown",
  RECOMMENDATION_CLICKED: "recommendation_clicked",
  PLAYLIST_STARTED: "playlist_started",
  PLAYLIST_COMPLETED: "playlist_completed",
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  INVALID_USER_ID: "Invalid user ID provided",
  ASSESSMENT_NOT_FOUND: "Assessment not found",
  ALREADY_COMPLETED: "Assessment already completed",
  INSUFFICIENT_QUESTIONS:
    "Not enough questions available for this configuration",
  INVALID_BLUEPRINT: "Invalid assessment blueprint",
  DATABASE_ERROR: "Database operation failed",
  INVALID_ANSWER: "Invalid answer format",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get difficulty weight for a given difficulty level
 */
export function getDifficultyWeight(difficulty) {
  return DIFFICULTY_WEIGHTS[difficulty] || 1;
}

/**
 * Get the maximum possible weight for a difficulty
 */
export function getMaxWeight() {
  return Math.max(...Object.values(DIFFICULTY_WEIGHTS));
}

/**
 * Calculate level from accuracy and attempts
 */
export function calculateLevel(accuracy, attempts) {
  const { MIN_ATTEMPTS, INTERMEDIATE_THRESHOLD, ADVANCED_THRESHOLD } =
    LEVEL_CONFIG;

  if (attempts < MIN_ATTEMPTS) {
    return "beginner";
  }

  if (accuracy < INTERMEDIATE_THRESHOLD) {
    return "beginner";
  }

  if (accuracy < ADVANCED_THRESHOLD) {
    return "intermediate";
  }

  return "advanced";
}

/**
 * Calculate level confidence based on number of attempts
 */
export function calculateLevelConfidence(attempts) {
  const { MIN_ATTEMPTS } = LEVEL_CONFIG;
  return Math.min(1.0, attempts / (MIN_ATTEMPTS * 2));
}

/**
 * Calculate smoothed accuracy using Laplace smoothing
 */
export function calculateSmoothedAccuracy(correct, attempts) {
  const { SMOOTHING_ALPHA } = LEVEL_CONFIG;
  return (correct + SMOOTHING_ALPHA) / (attempts + 2 * SMOOTHING_ALPHA);
}

/**
 * Get blueprint by assessment type
 */
export function getBlueprint(assessmentType) {
  return BLUEPRINTS[assessmentType] || BLUEPRINTS.diagnostic;
}

/**
 * Check if subject has multiple levels.
 * Accepts a subject object with `has_levels`, or a subject name string.
 */
export function subjectHasLevels(subject) {
  if (subject && typeof subject === "object") {
    return subject.has_levels === true;
  }
  // Fallback: match by name string
  const name = String(subject || "")
    .toLowerCase()
    .trim();
  return SUBJECT_CONFIG.MULTI_LEVEL_NAMES.some(
    (n) => name === n || name.includes(n),
  );
}

export default {
  DIFFICULTY_WEIGHTS,
  LEVEL_CONFIG,
  REPEAT_AVOIDANCE,
  BLUEPRINTS,
  SUBJECT_CONFIG,
  RESPONSE_CODES,
  EVENT_TYPES,
  ERROR_MESSAGES,
  getDifficultyWeight,
  getMaxWeight,
  calculateLevel,
  calculateLevelConfidence,
  calculateSmoothedAccuracy,
  getBlueprint,
  subjectHasLevels,
};
