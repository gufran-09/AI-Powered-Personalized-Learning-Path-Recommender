/**
 * ML Service Client — Frontend Edition
 *
 * Lightweight client for the Python ML service (FastAPI).
 * Used by Results.jsx for post-quiz ML predictions.
 * All methods return null on failure (never crashes the UI).
 *
 * @version 2.0.0
 */

const ML_API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8000";
const ML_API_KEY = import.meta.env.VITE_ML_API_KEY || "default_test_key";
const ML_TIMEOUT_MS = 5000;

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
    if (error.name === "AbortError") {
      console.warn(`ML Service ${path} timed out after ${ML_TIMEOUT_MS}ms`);
    } else {
      console.warn(`ML Service ${path} unavailable:`, error.message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMLPrediction(payload) {
  return _mlFetch("/predict", payload);
}

export async function predictLevel(userId, topicId, features = null) {
  const body = { user_id: userId, topic_id: topicId };
  if (features) body.features = features;
  return _mlFetch("/predict/level", body);
}

export async function predictDifficulty(userId, topicId, features = null) {
  const body = { user_id: userId, topic_id: topicId };
  if (features) body.features = features;
  return _mlFetch("/predict/difficulty", body);
}

export async function checkHealth() {
  return _mlFetch("/health", null, "GET");
}

export default {
  getMLPrediction,
  predictLevel,
  predictDifficulty,
  checkHealth,
};
