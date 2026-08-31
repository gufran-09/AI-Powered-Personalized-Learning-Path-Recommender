import { supabaseAdmin, ERROR_MESSAGES, RESPONSE_CODES } from "./quizEngine/index.js";

/**
 * Get the user's profile from the profiles table.
 */
export async function getUserProfile(userId) {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        return { success: true, profile: profile || null };
    } catch (error) {
        console.error("Dashboard Service - Get Profile error:", error);
        return {
            success: false,
            error: error.message || ERROR_MESSAGES.DATABASE_ERROR,
        };
    }
}

/**
 * Get aggregated dashboard summary for the user.
 * Combines overall accuracy, subject performance, weak topics, and recommended playlists.
 */
export async function getDashboardSummary(userId) {
    try {
        // 1. Overall Accuracy
        const { data: overallStats, error: overallError } = await supabaseAdmin.rpc(
            "get_user_overall_accuracy", // We might need to write this RPC, or we can query directly
            { p_user_id: userId }
        );

        // If RPC doesn't exist, we do it directly using raw querying, but supabase-js doesn't easily support dynamic sums without RPC.
        // Let's fetch all user_topic_stats and aggregate in memory for simplicity if RPC isn't available, or write an RPC.
        // The prompt specified exact queries. Since we are using supabase-js, let's use the provided SQL logic.
        // To execute raw SQL, we typically need to use an RPC. Alternatively, do memory aggregation since stats count isn't huge per user.

        // Let's implement the memory aggregation approach for the exact queries requested.
        const { data: topicStats, error: statsError } = await supabaseAdmin
            .from("user_topic_stats")
            .select(`
        accuracy,
        attempts,
        correct,
        level,
        topics(
          name,
          subjects(
            id,
            name,
            has_levels
          )
        )
      `)
            .eq("user_id", userId);

        if (statsError) throw statsError;

        // 1. Overall performance
        let totalCorrect = 0;
        let totalAttempts = 0;
        topicStats.forEach((stat) => {
            totalCorrect += stat.correct || 0;
            totalAttempts += stat.attempts || 0;
        });
        const overallAccuracy = totalAttempts > 0 ? parseFloat((totalCorrect / totalAttempts).toFixed(4)) : 0;

        // 2. Subject-wise performance
        const subjectMap = {};
        topicStats.forEach((stat) => {
            const subjectName = stat.topics?.subjects?.name;
            if (!subjectName) return;
            if (!subjectMap[subjectName]) {
                subjectMap[subjectName] = { sumAccuracy: 0, count: 0 };
            }
            subjectMap[subjectName].sumAccuracy += parseFloat(stat.accuracy || 0);
            subjectMap[subjectName].count += 1;
        });

        const subjectStats = Object.keys(subjectMap).map((subject) => ({
            subject,
            accuracy: parseFloat((subjectMap[subject].sumAccuracy / subjectMap[subject].count).toFixed(4))
        }));

        // 3. Weak topics
        // Sort topicStats by accuracy ascending, limit 5
        const weakTopics = [...topicStats]
            .filter(stat => stat.topics?.name) // ensure valid
            .sort((a, b) => parseFloat(a.accuracy || 0) - parseFloat(b.accuracy || 0))
            .slice(0, 5)
            .map((stat) => ({
                topic: stat.topics.name,
                accuracy: parseFloat(stat.accuracy || 0),
                level: stat.level || 'beginner'
            }));

        // 4. Recommended playlists
        // We get the subjects of the weak topics to recommend playlists.
        const recommendations = [];
        const processedSubjects = new Set();

        for (const weak of weakTopics) {
            // Find the stat record
            const statRecord = topicStats.find(s => s.topics?.name === weak.topic);
            const subjectData = statRecord?.topics?.subjects;

            if (!subjectData || processedSubjects.has(subjectData.id)) continue;
            processedSubjects.add(subjectData.id);

            let resourceQuery = supabaseAdmin
                .from("learning_resources")
                .select("*")
                .eq("subject_id", subjectData.id);

            if (subjectData.has_levels) {
                resourceQuery = resourceQuery.eq("level", weak.level);
            } else {
                resourceQuery = resourceQuery.is("level", null);
            }

            // Order by priority and take 1
            const { data: resources, error: resourceError } = await resourceQuery
                .order("priority", { ascending: true })
                .limit(1);

            if (!resourceError && resources && resources.length > 0) {
                recommendations.push({
                    subject: subjectData.name,
                    title: resources[0].title,
                    youtubeUrl: resources[0].youtube_url
                });
            }
        }

        // 5. Last Assessment
        let lastAssessmentData = null;
        const { data: lastAssessment, error: lastAssessmentError } = await supabaseAdmin
            .from("assessments")
            .select("score, total_questions, completed_at, assessment_type")
            .eq("user_id", userId)
            .eq("status", "completed")
            .order("completed_at", { ascending: false })
            .limit(1)
            .single();

        if (lastAssessment) {
            lastAssessmentData = {
                score: lastAssessment.score || 0,
                total: lastAssessment.total_questions || 0,
                completedAt: lastAssessment.completed_at,
                type: lastAssessment.assessment_type,
            };
        }

        return {
            success: true,
            data: {
                overallAccuracy,
                subjectStats,
                weakTopics,
                recommendations,
                lastAssessment: lastAssessmentData
            }
        };
    } catch (error) {
        console.error("Dashboard Service - Get Summary error:", error);
        return {
            success: false,
            error: error.message || ERROR_MESSAGES.DATABASE_ERROR,
        };
    }
}
