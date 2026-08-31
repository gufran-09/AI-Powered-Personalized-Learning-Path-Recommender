import express from "express";
import supabaseAdmin from "../services/quizEngine/supabaseAdmin.js";
import { RESPONSE_CODES, ERROR_MESSAGES } from "../services/quizEngine/index.js";

const router = express.Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Validate user authentication and check for admin role.
 */
const requireAdmin = async (req, res, next) => {
    let userId = req.body?.userId || req.query?.userId || req.headers["x-user-id"];

    // Extract user ID from Supabase JWT if Authorization header is present
    if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            try {
                const token = authHeader.slice(7);
                let payloadStr = token.split(".")[1];
                // Convert Base64Url to standard Base64
                payloadStr = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
                // Pad string with "=" to make it a multiple of 4
                while (payloadStr.length % 4) {
                    payloadStr += "=";
                }
                const payload = JSON.parse(
                    Buffer.from(payloadStr, "base64").toString(),
                );
                userId = payload.sub; // Supabase JWT 'sub' claim = user UUID
            } catch {
                // Invalid token format
                return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                    success: false,
                    error: "Invalid authorization token format.",
                });
            }
        }
    }

    if (!userId) {
        return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
            success: false,
            error: "User ID required. Send Authorization: Bearer <token>.",
        });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        return res.status(RESPONSE_CODES.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.INVALID_USER_ID,
        });
    }

    try {
        // Query the profiles table using service_role to check user's role
        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

        if (error || !profile) {
            return res.status(RESPONSE_CODES.UNAUTHORIZED).json({
                success: false,
                error: "User profile not found.",
            });
        }

        if (profile.role !== "admin") {
            return res.status(RESPONSE_CODES.FORBIDDEN).json({
                success: false,
                error: "Access denied. Admin role required.",
            });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR).json({
            success: false,
            error: "Failed to verify admin priviledges.",
        });
    }
};

router.use(requireAdmin);

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/stats
 * Get overview stats for the dashboard.
 */
router.get("/stats", async (req, res) => {
    try {
        // Run aggregations using service_role to bypass RLS
        const { count: totalUsers } = await supabaseAdmin
            .from("profiles")
            .select("*", { count: "exact", head: true });

        const { count: totalAssessments } = await supabaseAdmin
            .from("assessments")
            .select("*", { count: "exact", head: true })
            .in("status", ["completed"]);

        // Simple average approximation (for real prod, use SQL function)
        const { data: assessmentsWithScores } = await supabaseAdmin
            .from("assessments")
            .select("score, total_questions")
            .eq("status", "completed");

        let averageAccuracy = 0;
        if (assessmentsWithScores && assessmentsWithScores.length > 0) {
            let totalScore = 0;
            let totalPossible = 0;
            for (const a of assessmentsWithScores) {
                totalScore += a.score || 0;
                totalPossible += a.total_questions || 0;
            }
            if (totalPossible > 0) {
                averageAccuracy = (totalScore / totalPossible) * 100;
            }
        }

        // Active users check: assessments started within last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Distinct active users might require custom SQL, keeping it simple here
        const { data: recentAssessments } = await supabaseAdmin
            .from("assessments")
            .select("user_id")
            .gte("started_at", sevenDaysAgo.toISOString());

        const activeUsersSet = new Set(recentAssessments?.map(a => a.user_id) || []);

        return res.status(RESPONSE_CODES.SUCCESS).json({
            success: true,
            stats: {
                totalUsers: totalUsers || 0,
                totalAssessments: totalAssessments || 0,
                averageAccuracy: averageAccuracy,
                activeUsers: activeUsersSet.size
            }
        });
    } catch (error) {
        console.error("fetchAdminStats Error:", error);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/users
 * Get paginated list of users.
 */
router.get("/users", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50; // default page size
        const search = req.query.search || '';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from("profiles")
            .select("id, full_name, role, created_at", { count: "exact" })
            .order("created_at", { ascending: false });

        if (search) {
            query = query.ilike('full_name', `%${search}%`);
        }

        query = query.range(from, to);

        const { data: users, count, error } = await query;
        if (error) {
            console.error("Supabase query error in /users:", error);
            throw error;
        }

        // For admin dashboard UI we can map avatar_url as email mock if email isn't in profile table
        const mappedUsers = (users || []).map(u => ({
            id: u.id,
            full_name: u.full_name || 'Anonymous',
            email: u.email || 'Email Private (Auth table only)', // Email is in auth.users by default, not profiles unless explicitly mirrored.
            role: u.role || 'user',
            created_at: u.created_at
        }));

        return res.status(RESPONSE_CODES.SUCCESS).json({
            success: true,
            users: mappedUsers,
            total: count,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (error) {
        console.error("fetchUsersList Error detailed:", error);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/questions
 * Get paginated list of questions for the bank.
 */
router.get("/questions", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const search = req.query.search || '';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from("questions")
            .select(`
                id, 
                text, 
                difficulty,
                subject:subjects!subject_id(name),
                topic:topics!topic_id(name)
            `, { count: "exact" })
            .order("created_at", { ascending: false });

        if (search) {
            query = query.ilike('text', `%${search}%`);
        }

        query = query.range(from, to);

        const { data: questions, count, error } = await query;
        if (error) throw error;

        const mappedQuestions = (questions || []).map(q => ({
            id: q.id,
            text: q.text,
            difficulty: q.difficulty,
            subject: q.subject?.name || 'Unknown',
            topic: q.topic?.name || 'Unknown'
        }));

        return res.status(RESPONSE_CODES.SUCCESS).json({
            success: true,
            questions: mappedQuestions,
            total: count,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (error) {
        console.error("fetchQuestionsAdmin Error:", error);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/admin/questions
 * Add a new question to the bank.
 */
router.post("/questions", async (req, res) => {
    try {
        // Validate payload (basic implementation)
        const { subject_id, topic_id, text, options, correct_option_index, explanation, difficulty } = req.body;

        if (!subject_id || !topic_id || !text || !options || correct_option_index === undefined || !difficulty) {
            return res.status(RESPONSE_CODES.BAD_REQUEST).json({
                success: false,
                error: "Missing required question fields."
            });
        }

        const { data: newQuestion, error } = await supabaseAdmin
            .from("questions")
            .insert({
                subject_id,
                topic_id,
                text,
                options,
                correct_option_index,
                explanation,
                difficulty
            })
            .select()
            .single();

        if (error) throw error;

        return res.status(RESPONSE_CODES.CREATED).json({
            success: true,
            question: newQuestion
        });
    } catch (error) {
        console.error("addQuestionAdmin Error:", error);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/admin/learning-resources
 * Get paginated list of learning resources.
 */
router.get("/learning-resources", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const search = req.query.search || '';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from("learning_resources")
            .select(`
                id,
                title,
                resource_type,
                level,
                priority,
                subject:subjects!subject_id(name),
                topic:topics!topic_id(name)
            `, { count: "exact" })
            .order("priority", { ascending: true })
            .order("created_at", { ascending: false });

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        query = query.range(from, to);

        const { data: resources, count, error } = await query;
        if (error) {
            console.error("Supabase query error in /learning-resources:", error);
            throw error;
        }

        const mappedResources = (resources || []).map(r => ({
            id: r.id,
            title: r.title,
            type: r.resource_type,
            level: r.level || 'All',
            priority: r.priority,
            subject: r.subject?.name || 'Unknown',
            topic: r.topic?.name || 'Unknown',
            source: r.resource_type === 'youtube_playlist' || r.resource_type === 'youtube_video' ? 'YouTube' : 'Internal'
        }));

        return res.status(RESPONSE_CODES.SUCCESS).json({
            success: true,
            resources: mappedResources,
            total: count,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (error) {
        console.error("fetchLearningResourcesAdmin Error:", error);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
