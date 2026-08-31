# Project Summary: AI Learning Path Recommender

After investigating the source code, it's clear that the project has evolved significantly from what the `README.md` and `docs/HOW_IT_WORKS.md` described. Instead of an adaptive quiz engine using XGBoost/LightGBM, the project is an **AI-powered Learning Path Recommender** powered by LLMs (specifically Google Gemini).

## 1. High-Level Architecture

The platform uses a three-tier architecture:
1.  **Frontend**: React (Vite) application providing the user interface.
2.  **Backend**: Node.js/Express API that acts as the main orchestrator, handles database operations, and communicates with the ML Service.
3.  **ML Service**: Python/FastAPI microservice that interfaces directly with Google's GenAI (`gemini-2.5-flash`) to generate personalized learning paths and power an AI chat assistant.
4.  **Database**: Supabase (PostgreSQL) is used for authentication and storing user profiles, learning paths, and milestones.

## 2. Component Details

### ML Service (AI Engine)
-   **Tech Stack**: Python 3.11, FastAPI, `google-genai` SDK, Pydantic.
-   **Core Functions**:
    -   `/api/extract-profile`: Uses Gemini to extract a structured `UserProfile` (interests, experience level, career aspirations, learning goals) from a conversational chat history.
    -   `/api/generate-path`: Uses Gemini to generate a structured learning path with milestones (including titles, descriptions, and AI explanations) based on the user's profile.
    -   `/api/chat`: Provides an interactive AI learning assistant interface.
-   *Note*: There is no trace of XGBoost or LightGBM in the actual implementation. It purely leverages Generative AI.

### Backend (Server-Side)
-   **Tech Stack**: Node.js, Express, `cors`, `@supabase/supabase-js`.
-   **Core Functions**:
    -   **Paths Routing (`pathsRoutes.js`)**: Orchestrates the process of calling the ML Service to extract profiles and generate paths. It then saves these generated learning paths and their individual milestones to the Supabase PostgreSQL database (`learning_paths` and `learning_path_milestones` tables).
    -   **Chat & Admin**: Exposes routes for chat functionalities and administrative tasks.
    -   It acts as a secure middleware layer between the frontend and the ML service/database.

### Frontend (Client-Side)
-   **Tech Stack**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router.
-   **Core Functions**:
    -   Provides an interactive UI for users to converse with the AI assistant, which implicitly helps build their profile.
    -   Displays the generated learning paths and milestones.
    -   Utilizes Framer Motion for smooth animations and canvas-confetti for gamification/celebrations.
    -   Integrates directly with Supabase for authentication.

## 3. Workflow Summary

1.  **Onboarding/Conversation**: The user chats with the AI assistant on the frontend.
2.  **Profile Extraction**: The frontend sends the chat history to the backend, which forwards it to the ML Service. The ML Service uses Gemini to extract a structured user profile (interests, goals, etc.).
3.  **Path Generation**: The backend requests a learning path from the ML Service based on this extracted profile. The ML Service uses Gemini to design a custom curriculum (milestones).
4.  **Persistence**: The backend saves the generated path and milestones to Supabase.
5.  **Execution**: The frontend retrieves the path from the backend/Supabase and displays it to the user, allowing them to track their progress.
