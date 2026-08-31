import express from "express";
import mlService from "../lib/mlService.js";
import supabase from "../lib/supabaseClient.js";

const router = express.Router();

// Extract profile from conversational history
router.post("/extract-profile", async (req, res) => {
  const { chatHistory } = req.body;
  if (!chatHistory || !Array.isArray(chatHistory)) {
    return res.status(400).json({ error: "chatHistory array is required" });
  }

  try {
    const profile = await mlService.extractProfileFromConversation(chatHistory);
    if (!profile) {
      return res.status(500).json({ error: "Failed to extract profile from ML service" });
    }
    res.json({ profile });
  } catch (err) {
    console.error("Extract Profile Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Generate a learning path and save it to DB
router.post("/generate", async (req, res) => {
  const { user_id, profile } = req.body;
  
  if (!user_id || !profile) {
    return res.status(400).json({ error: "user_id and profile are required" });
  }

  try {
    // Upsert the extracted profile into the database
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: user_id,
        interests: profile.interests || [],
        experience_level: profile.experience_level || 'beginner',
        career_aspirations: profile.career_aspirations || '',
        learning_goals: profile.learning_goals || '',
        completed_courses: profile.completed_courses || [],
        preferred_learning_format: profile.preferred_learning_format || '',
        preferred_difficulty: profile.preferred_difficulty || '',
        available_hours_per_week: profile.available_hours_per_week || 0,
        target_completion_date: profile.target_completion_date || null,
        preferred_study_schedule: profile.preferred_study_schedule || '',
        learning_preferences: profile.learning_preferences || [],
        constraints: profile.constraints || [],
        updated_at: new Date()
      });

    if (profileError) {
      console.error("Profile Upsert Error:", profileError);
      // We log but continue, since generating the path is the primary action
    }

    const generatedPath = await mlService.generateLearningPath(user_id, profile);
    if (!generatedPath) {
      return res.status(500).json({ error: "Failed to generate path from ML service" });
    }

    // Insert path into Supabase
    const { data: pathData, error: pathError } = await supabase
      .from("learning_paths")
      .insert({
        user_id,
        title: generatedPath.title,
        description: generatedPath.description,
        status: "active"
      })
      .select()
      .single();

    if (pathError) throw pathError;

    // Insert milestones
    const milestones = generatedPath.milestones.map((m, idx) => ({
      path_id: pathData.id,
      title: m.title,
      description: m.description,
      step_order: idx + 1,
      status: "pending",
      ai_explanation: m.ai_explanation
    }));

    const { error: milesError } = await supabase
      .from("learning_path_milestones")
      .insert(milestones);

    if (milesError) throw milesError;

    res.json({ message: "Learning path generated successfully", pathId: pathData.id });
  } catch (err) {
    console.error("Generate Path Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch user's paths
router.get("/", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id required" });

  try {
    const { data, error } = await supabase
      .from("learning_paths")
      .select(`
        *,
        learning_path_milestones (*)
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error("Get Paths Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
