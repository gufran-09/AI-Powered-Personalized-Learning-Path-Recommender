const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Helper to get the auth headers
 */
export const getHeaders = (token) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // standard auth header
    }
    return headers;
};

/**
 * Fetch user profile from the backend
 */
export const fetchProfile = async (token) => {
    try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("fetchProfile Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch dashboard summary
 */
export const fetchDashboardSummary = async (token) => {
    try {
        const res = await fetch(`${API_BASE_URL}/dashboard-summary`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("fetchDashboardSummary Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Start assessment
 */
export const startAssessment = async (token, payload) => {
    try {
        const res = await fetch(`${API_BASE_URL}/start-assessment`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("startAssessment Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Finish assessment
 */
export const finishAssessment = async (token, payload) => {
    try {
        const res = await fetch(`${API_BASE_URL}/finish-assessment`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("finishAssessment Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch user achievements
 */
export const fetchAchievements = async (token) => {
    try {
        const res = await fetch(`${API_BASE_URL}/achievements`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("fetchAchievements Error:", error);
        return { success: false, error: error.message };
    }
};
