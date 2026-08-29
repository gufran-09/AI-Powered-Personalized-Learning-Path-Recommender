/**
 * ML Service Client — AI Learning Path Recommender
 *
 * Typed client for the Python ML service (FastAPI).
 */

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "default_test_key";
const ML_TIMEOUT_MS = 15000;

async function _mlFetch(path, body, method = "POST") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

  try {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ML_API_KEY,
      },
      signal: controller.signal,
    };
    if (body && method !== "GET") {
      opts.body = JSON.stringify(body);
    }

    const response = await fetch(`${ML_API_URL}${path}`, opts);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn(`ML Service ${path} error:`, err.detail || response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`ML Service ${path} unavailable:`, error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateLearningPath(userId, profile) {
  return _mlFetch("/api/generate-path", { user_id: userId, profile });
}

export async function chatWithAssistant(userId, message, context = null) {
  return _mlFetch("/api/chat", { user_id: userId, message, context });
}

export async function checkHealth() {
  return _mlFetch("/health", null, "GET");
}

export async function extractProfileFromConversation(chatHistory) {
  return _mlFetch("/api/extract-profile", { chat_history: chatHistory });
}

export default {
  generateLearningPath,
  chatWithAssistant,
  extractProfileFromConversation,
  checkHealth,
};
