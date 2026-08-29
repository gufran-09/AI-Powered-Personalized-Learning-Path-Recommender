import { getHeaders } from "./api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const ADMIN_API_BASE_URL = `${API_BASE}/admin`;

// Admin API calls require the standard user JWT in Authorization header.
// The backend will decode the JWT, verify the role in the database/metadata,
// and then use its service_role key to bypass RLS for admin tasks.

export const fetchAdminStats = async (token) => {
  try {
    const res = await fetch(`${ADMIN_API_BASE_URL}/stats`, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("fetchAdminStats Error:", error);
    return { success: false, error: error.message };
  }
};

export const fetchUsersList = async (token, page = 1, search = "") => {
  try {
    const queryParams = new URLSearchParams({ page, search }).toString();
    const res = await fetch(`${ADMIN_API_BASE_URL}/users?${queryParams}`, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("fetchUsersList Error:", error);
    return { success: false, error: error.message };
  }
};

export const fetchQuestionsAdmin = async (token, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${ADMIN_API_BASE_URL}/questions?${queryParams}`, {
      method: "GET",
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("fetchQuestionsAdmin Error:", error);
    return { success: false, error: error.message };
  }
};

export const addQuestionAdmin = async (token, questionData) => {
  try {
    const res = await fetch(`${ADMIN_API_BASE_URL}/questions`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(questionData),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("addQuestionAdmin Error:", error);
    return { success: false, error: error.message };
  }
};
