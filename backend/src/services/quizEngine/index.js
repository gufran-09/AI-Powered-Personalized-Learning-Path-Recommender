/**
 * Quiz Engine - Main Entry Point
 *
 * Exports all quiz engine services for easy import.
 *
 * @version 1.0.0
 * @author Person 2 - Quiz Engine Team
 */

// Import everything for re-export and default export
import {
  generateQuiz as _generateQuiz,
  quizGenerator as _quizGenerator,
} from "./generateQuiz.js";
import {
  finishAssessment as _finishAssessment,
  resumeAssessment as _resumeAssessment,
  abandonAssessment as _abandonAssessment,
  assessmentCompleter as _assessmentCompleter,
} from "./finishAssessment.js";
import {
  getRecommendations as _getRecommendations,
  getWeakTopicRecommendations as _getWeakTopicRecommendations,
  getSubjectRecommendations as _getSubjectRecommendations,
  updateRecommendationStatus as _updateRecommendationStatus,
  recommendationEngine as _recommendationEngine,
} from "./recommendationEngine.js";
import {
  classifyLevel as _classifyLevel,
  classifyUserTopic as _classifyUserTopic,
  classifyUserTopics as _classifyUserTopics,
  getUserProfile as _getUserProfile,
  predictLevelTransition as _predictLevelTransition,
  levelClassifier as _levelClassifier,
} from "./levelClassifier.js";
import {
  DIFFICULTY_WEIGHTS as _DIFFICULTY_WEIGHTS,
  LEVEL_CONFIG as _LEVEL_CONFIG,
  REPEAT_AVOIDANCE as _REPEAT_AVOIDANCE,
  BLUEPRINTS as _BLUEPRINTS,
  SUBJECT_CONFIG as _SUBJECT_CONFIG,
  RESPONSE_CODES as _RESPONSE_CODES,
  EVENT_TYPES as _EVENT_TYPES,
  ERROR_MESSAGES as _ERROR_MESSAGES,
  getDifficultyWeight as _getDifficultyWeight,
  getMaxWeight as _getMaxWeight,
  calculateLevel as _calculateLevel,
  calculateLevelConfidence as _calculateLevelConfidence,
  calculateSmoothedAccuracy as _calculateSmoothedAccuracy,
  getBlueprint as _getBlueprint,
  subjectHasLevels as _subjectHasLevels,
} from "./constants.js";
import {
  supabaseAdmin as _supabaseAdmin,
  supabasePublic as _supabasePublic,
  getAdminClient as _getAdminClient,
  hasServiceKey as _hasServiceKey,
} from "./supabaseAdmin.js";

// Re-export everything as named exports
export const generateQuiz = _generateQuiz;
export const quizGenerator = _quizGenerator;
export const finishAssessment = _finishAssessment;
export const resumeAssessment = _resumeAssessment;
export const abandonAssessment = _abandonAssessment;
export const assessmentCompleter = _assessmentCompleter;
export const getRecommendations = _getRecommendations;
export const getWeakTopicRecommendations = _getWeakTopicRecommendations;
export const getSubjectRecommendations = _getSubjectRecommendations;
export const updateRecommendationStatus = _updateRecommendationStatus;
export const recommendationEngine = _recommendationEngine;
export const classifyLevel = _classifyLevel;
export const classifyUserTopic = _classifyUserTopic;
export const classifyUserTopics = _classifyUserTopics;
export const getUserProfile = _getUserProfile;
export const predictLevelTransition = _predictLevelTransition;
export const levelClassifier = _levelClassifier;
export const DIFFICULTY_WEIGHTS = _DIFFICULTY_WEIGHTS;
export const LEVEL_CONFIG = _LEVEL_CONFIG;
export const REPEAT_AVOIDANCE = _REPEAT_AVOIDANCE;
export const BLUEPRINTS = _BLUEPRINTS;
export const SUBJECT_CONFIG = _SUBJECT_CONFIG;
export const RESPONSE_CODES = _RESPONSE_CODES;
export const EVENT_TYPES = _EVENT_TYPES;
export const ERROR_MESSAGES = _ERROR_MESSAGES;
export const getDifficultyWeight = _getDifficultyWeight;
export const getMaxWeight = _getMaxWeight;
export const calculateLevel = _calculateLevel;
export const calculateLevelConfidence = _calculateLevelConfidence;
export const calculateSmoothedAccuracy = _calculateSmoothedAccuracy;
export const getBlueprint = _getBlueprint;
export const subjectHasLevels = _subjectHasLevels;
export const supabaseAdmin = _supabaseAdmin;
export const supabasePublic = _supabasePublic;
export const getAdminClient = _getAdminClient;
export const hasServiceKey = _hasServiceKey;

// Default export for convenience
export default {
  // Quiz Generation
  generateQuiz: _generateQuiz,

  // Assessment Management
  finishAssessment: _finishAssessment,
  resumeAssessment: _resumeAssessment,
  abandonAssessment: _abandonAssessment,

  // Recommendations
  getRecommendations: _getRecommendations,
  getWeakTopicRecommendations: _getWeakTopicRecommendations,
  getSubjectRecommendations: _getSubjectRecommendations,
  updateRecommendationStatus: _updateRecommendationStatus,

  // Level Classification
  classifyLevel: _classifyLevel,
  classifyUserTopic: _classifyUserTopic,
  classifyUserTopics: _classifyUserTopics,
  getUserProfile: _getUserProfile,
  predictLevelTransition: _predictLevelTransition,

  // Config
  BLUEPRINTS: _BLUEPRINTS,
  DIFFICULTY_WEIGHTS: _DIFFICULTY_WEIGHTS,
  LEVEL_CONFIG: _LEVEL_CONFIG,
};
