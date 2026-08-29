/**
 * Achievement Service
 *
 * Dynamically computes user achievements from existing DB data
 * (assessments, user_answers, user_topic_stats). No separate
 * achievements table required — everything is derived on the fly.
 *
 * @version 1.0.0
 */

import { supabaseAdmin } from "./quizEngine/index.js";

// ============================================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================================

const ACHIEVEMENT_DEFS = [
  {
    id: "first_steps",
    name: "First Steps",
    desc: "Complete your first quiz",
    icon: "Trophy",
    category: "milestone",
    check: (ctx) => ctx.completedCount >= 1,
    progress: (ctx) => Math.min(ctx.completedCount, 1),
    target: 1,
  },
  {
    id: "on_fire",
    name: "On Fire",
    desc: "Maintain a 7-day streak",
    icon: "Flame",
    category: "streak",
    check: (ctx) => ctx.maxStreak >= 7,
    progress: (ctx) => Math.min(ctx.maxStreak, 7),
    target: 7,
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    desc: "Score 100% on any quiz",
    icon: "Star",
    category: "performance",
    check: (ctx) => ctx.perfectCount >= 1,
    progress: (ctx) => Math.min(ctx.perfectCount, 1),
    target: 1,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    desc: "Finish a quiz in under 2 minutes",
    icon: "Zap",
    category: "performance",
    check: (ctx) => ctx.fastQuizCount >= 1,
    progress: (ctx) => Math.min(ctx.fastQuizCount, 1),
    target: 1,
  },
  {
    id: "scholar",
    name: "Scholar",
    desc: "Complete 50 quizzes",
    icon: "GraduationCap",
    category: "milestone",
    check: (ctx) => ctx.completedCount >= 50,
    progress: (ctx) => Math.min(ctx.completedCount, 50),
    target: 50,
  },
  {
    id: "polymath",
    name: "Polymath",
    desc: "Score 80%+ in 5 different subjects",
    icon: "Brain",
    category: "mastery",
    check: (ctx) => ctx.strongSubjectCount >= 5,
    progress: (ctx) => Math.min(ctx.strongSubjectCount, 5),
    target: 5,
  },
  {
    id: "quiz_warrior",
    name: "Quiz Warrior",
    desc: "Complete 10 quizzes",
    icon: "Swords",
    category: "milestone",
    check: (ctx) => ctx.completedCount >= 10,
    progress: (ctx) => Math.min(ctx.completedCount, 10),
    target: 10,
  },
  {
    id: "explorer",
    name: "Explorer",
    desc: "Attempt quizzes in 5 different subjects",
    icon: "Compass",
    category: "exploration",
    check: (ctx) => ctx.distinctSubjects >= 5,
    progress: (ctx) => Math.min(ctx.distinctSubjects, 5),
    target: 5,
  },
  {
    id: "topic_master",
    name: "Topic Master",
    desc: "Reach advanced level in any topic",
    icon: "Crown",
    category: "mastery",
    check: (ctx) => ctx.advancedTopicCount >= 1,
    progress: (ctx) => Math.min(ctx.advancedTopicCount, 1),
    target: 1,
  },
  {
    id: "consistent",
    name: "Consistent",
    desc: "Complete a quiz 3 days in a row",
    icon: "CalendarCheck",
    category: "streak",
    check: (ctx) => ctx.maxStreak >= 3,
    progress: (ctx) => Math.min(ctx.maxStreak, 3),
    target: 3,
  },
  {
    id: "high_achiever",
    name: "High Achiever",
    desc: "Score 90%+ on 5 quizzes",
    icon: "Target",
    category: "performance",
    check: (ctx) => ctx.highScoreCount >= 5,
    progress: (ctx) => Math.min(ctx.highScoreCount, 5),
    target: 5,
  },
  {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    desc: "Answer 100 questions total",
    icon: "BookOpen",
    category: "milestone",
    check: (ctx) => ctx.totalAnswers >= 100,
    progress: (ctx) => Math.min(ctx.totalAnswers, 100),
    target: 100,
  },
];

// ============================================================================
// DATA FETCHERS
// ============================================================================

/**
 * Fetch all data needed to evaluate achievements for a user.
 * Runs queries in parallel for speed.
 */
async function fetchAchievementContext(userId) {
  const [assessmentsRes, answersCountRes, topicStatsRes] = await Promise.all([
    // All completed assessments (for score analysis, streaks)
    supabaseAdmin
      .from("assessments")
      .select("id, score, total_questions, started_at, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: true }),

    // Total answer count
    supabaseAdmin
      .from("user_answers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    // Topic stats with subject info
    supabaseAdmin
      .from("user_topic_stats")
      .select(
        `
        level, accuracy, attempts,
        topics ( name, subject_id, subjects ( id, name ) )
      `,
      )
      .eq("user_id", userId),
  ]);

  const assessments = assessmentsRes.data || [];
  const totalAnswers = answersCountRes.count || 0;
  const topicStats = topicStatsRes.data || [];

  // --- Derived metrics ---

  const completedCount = assessments.length;

  // Perfect scores (score == total_questions, total_questions > 0)
  const perfectCount = assessments.filter(
    (a) => a.total_questions > 0 && a.score === a.total_questions,
  ).length;

  // High scores (90%+)
  const highScoreCount = assessments.filter(
    (a) => a.total_questions > 0 && a.score / a.total_questions >= 0.9,
  ).length;

  // Fast quizzes (under 120 seconds, computed from started_at → completed_at)
  const fastQuizCount = assessments.filter((a) => {
    if (!a.started_at || !a.completed_at) return false;
    const elapsed = (new Date(a.completed_at) - new Date(a.started_at)) / 1000;
    return elapsed > 0 && elapsed < 120;
  }).length;

  // Distinct subjects attempted (from topic stats)
  const subjectSet = new Set();
  topicStats.forEach((ts) => {
    const subId = ts.topics?.subjects?.id || ts.topics?.subject_id;
    if (subId) subjectSet.add(subId);
  });
  const distinctSubjects = subjectSet.size;

  // Subject accuracy map for polymath check
  const subjectAccMap = {};
  topicStats.forEach((ts) => {
    const subName = ts.topics?.subjects?.name;
    if (!subName) return;
    if (!subjectAccMap[subName]) subjectAccMap[subName] = { sum: 0, count: 0 };
    subjectAccMap[subName].sum += parseFloat(ts.accuracy || 0);
    subjectAccMap[subName].count += 1;
  });
  const strongSubjectCount = Object.values(subjectAccMap).filter(
    (s) => s.count > 0 && s.sum / s.count >= 0.8,
  ).length;

  // Advanced topics
  const advancedTopicCount = topicStats.filter(
    (ts) => ts.level === "advanced",
  ).length;

  // Streak calculation from completed_at dates
  const maxStreak = calculateMaxStreak(assessments);
  const currentStreak = calculateCurrentStreak(assessments);

  return {
    completedCount,
    perfectCount,
    highScoreCount,
    fastQuizCount,
    distinctSubjects,
    strongSubjectCount,
    advancedTopicCount,
    totalAnswers,
    maxStreak,
    currentStreak,
    assessments,
  };
}

// ============================================================================
// STREAK HELPERS
// ============================================================================

/**
 * Get unique dates (YYYY-MM-DD) from assessments, sorted ascending.
 */
function getUniqueDates(assessments) {
  const dateSet = new Set();
  for (const a of assessments) {
    if (a.completed_at) {
      const d = new Date(a.completed_at);
      dateSet.add(d.toISOString().slice(0, 10));
    }
  }
  return [...dateSet].sort();
}

/**
 * Calculate the maximum consecutive-day streak ever.
 */
function calculateMaxStreak(assessments) {
  const dates = getUniqueDates(assessments);
  if (dates.length === 0) return 0;

  let maxStreak = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }

  return maxStreak;
}

/**
 * Calculate the current streak ending today (or yesterday).
 */
function calculateCurrentStreak(assessments) {
  const dates = getUniqueDates(assessments);
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastDate = dates[dates.length - 1];

  // Streak must end today or yesterday to count as "current"
  if (lastDate !== today && lastDate !== yesterday) return 0;

  let streak = 1;
  for (let i = dates.length - 2; i >= 0; i--) {
    const curr = new Date(dates[i + 1]);
    const prev = new Date(dates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all achievements for a user with unlock status and progress.
 */
export async function getUserAchievements(userId) {
  try {
    const ctx = await fetchAchievementContext(userId);

    const achievements = ACHIEVEMENT_DEFS.map((def) => {
      const unlocked = def.check(ctx);
      const progress = def.progress(ctx);

      // Try to find approximate unlock date for unlocked achievements
      let unlockedAt = null;
      if (unlocked && ctx.assessments.length > 0) {
        // Use the date of the Nth assessment that would have triggered it
        unlockedAt = estimateUnlockDate(def, ctx);
      }

      return {
        id: def.id,
        name: def.name,
        desc: def.desc,
        icon: def.icon,
        category: def.category,
        unlocked,
        progress,
        target: def.target,
        unlockedAt,
      };
    });

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return {
      success: true,
      data: {
        achievements,
        summary: {
          total: achievements.length,
          unlocked: unlockedCount,
          currentStreak: ctx.currentStreak,
          maxStreak: ctx.maxStreak,
          totalQuizzes: ctx.completedCount,
          totalAnswers: ctx.totalAnswers,
        },
      },
    };
  } catch (error) {
    console.error("Achievement Service error:", error);
    return {
      success: false,
      error: error.message || "Failed to compute achievements",
    };
  }
}

/**
 * Estimate when an achievement was unlocked based on assessment history.
 */
function estimateUnlockDate(def, ctx) {
  const assessments = ctx.assessments; // already sorted ascending by completed_at

  switch (def.id) {
    case "first_steps":
      return assessments[0]?.completed_at || null;

    case "quiz_warrior":
      return assessments.length >= 10 ? assessments[9].completed_at : null;

    case "scholar":
      return assessments.length >= 50 ? assessments[49].completed_at : null;

    case "perfect_score": {
      const first = assessments.find(
        (a) => a.total_questions > 0 && a.score === a.total_questions,
      );
      return first?.completed_at || null;
    }

    case "speed_demon": {
      const first = assessments.find((a) => {
        if (!a.started_at || !a.completed_at) return false;
        const elapsed =
          (new Date(a.completed_at) - new Date(a.started_at)) / 1000;
        return elapsed > 0 && elapsed < 120;
      });
      return first?.completed_at || null;
    }

    case "high_achiever": {
      const highs = assessments.filter(
        (a) => a.total_questions > 0 && a.score / a.total_questions >= 0.9,
      );
      return highs.length >= 5 ? highs[4].completed_at : null;
    }

    case "knowledge_seeker":
      // Approximate: use the latest assessment date since we can't pinpoint exactly
      return assessments[assessments.length - 1]?.completed_at || null;

    default:
      // For streak/mastery achievements, use the latest assessment
      return assessments[assessments.length - 1]?.completed_at || null;
  }
}
