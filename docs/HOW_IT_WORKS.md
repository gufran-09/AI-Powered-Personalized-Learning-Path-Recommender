# How AdaptIQ Works

AdaptIQ is an AI-powered adaptive learning platform designed to personalize quiz difficulty in real-time. It leverages a modern three-tier architecture to deliver a seamless and intelligent user experience.

## 1. High-Level Architecture

The platform consists of three core services that work together:

1.  **Frontend (React + Vite)**: The user interface where learners take quizzes, view their analytics, and manage their profiles.
2.  **Backend (Node.js + Express)**: The central API gateway that handles business logic, database interactions, and orchestrates calls to the ML service.
3.  **ML Service (Python + FastAPI)**: A dedicated microservice that runs machine learning models (XGBoost/LightGBM) to predict the optimal difficulty for the next question based on the user's past performance.
4.  **Database (Supabase PostgreSQL)**: The central data store for all user data, questions, quiz sessions, and authentication.

## 2. Component Breakdown

### Frontend (Client-Side)
-   **Tech Stack**: React 18, Vite 5, Tailwind CSS, Framer Motion.
-   **Role**: Provides a highly responsive, animated, and themeable UI.
-   **Key Features**:
    -   Communicates with the Backend API via HTTPS REST calls.
    -   Uses Shadcn components for a polished design.
    -   Displays real-time analytics using Recharts.

### Backend (Server-Side)
-   **Tech Stack**: Node.js, Express 4, Supabase JS.
-   **Role**: Acts as the main orchestrator. It receives requests from the frontend, queries the Supabase database, and enforces business rules.
-   **Adaptive Logic**: When a user answers a question, the backend records the result. Before serving the next question, it asks the ML Service: "What difficulty should the next question be for this specific user?"

### ML Service (AI Engine)
-   **Tech Stack**: Python 3.11, FastAPI, XGBoost, LightGBM.
-   **Role**: The brain of the adaptive engine.
-   **How it predicts**: It takes historical data (user's accuracy, time taken, past difficulty levels) and uses trained models to predict whether the user is ready for a harder question, needs an easier one, or should stay at the current level.
-   **Fallback**: If the ML service is unavailable, the system falls back to a deterministic rule-based logic (e.g., 3 correct in a row = increase difficulty).

### Database (Supabase)
-   **Tech Stack**: PostgreSQL (managed via Supabase).
-   **Role**: Stores everything. Supabase also handles secure authentication (email/password).

## 3. The Request Flow (Taking a Quiz)

Here is a step-by-step breakdown of what happens when a user takes an adaptive quiz:

1.  **Start Quiz**: The user clicks "Start" on the frontend. A request is sent to the Backend API to initialize a new quiz session in Supabase.
2.  **Fetch Question**: The Backend retrieves an initial question (usually medium difficulty) from Supabase and sends it to the Frontend.
3.  **Submit Answer**: The user selects an answer. The Frontend sends the result (correct/incorrect) and the time taken to the Backend.
4.  **Analyze & Adapt**:
    -   The Backend saves the answer in Supabase.
    -   The Backend makes a fast RPC (Remote Procedure Call) to the **ML Service**.
    -   The ML Service analyzes the user's updated profile and returns the predicted optimal difficulty for the *next* question.
5.  **Serve Next Question**: The Backend queries Supabase for a new, non-repeated question matching the predicted difficulty and sends it back to the Frontend.
6.  **Loop & Classify**: This loop continues until the quiz ends. Finally, the user is classified (Beginner/Intermediate/Advanced) using Laplace-smoothed accuracy, and study paths are generated based on weak topics.

## 4. User-Level Classification & Recommendations

-   **Classification**: The system doesn't just look at raw scores. It uses smoothing algorithms to ensure a user isn't unfairly penalized for a single mistake, accurately determining their overall mastery level.
-   **Recommendations**: By tracking performance across different categories and tags, the platform identifies "weak topics" and dynamically generates personalized study paths to help the user improve.
