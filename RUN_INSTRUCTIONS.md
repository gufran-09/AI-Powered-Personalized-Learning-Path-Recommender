# How to Run the AdaptIQ Application

To run the complete website functionality, you need to start the Backend, Frontend, and ML Service in three separate terminal windows.

All paths below assume you are starting from the root directory of the project (`d:\Mass-Mutual\App`).

---

## 1. Start the Backend API (Node.js/Express)
The backend handles core logic, database queries to Supabase, and orchestrates the quiz engine.

**Commands:**
```bash
cd backend
npm install       # (Only needed if dependencies are not installed)
npm run dev
```
*The backend server will start on `http://localhost:3000`.*

---

## 2. Start the ML Service (FastAPI)
The ML Service provides intelligent next-question predictions and analytics using machine learning models.

**Commands:**
```bash
cd ml-service

# Create and activate a python virtual environment
python -m venv venv

# If using Windows PowerShell, you may need to run the binaries directly from the venv folder
# rather than relying on the activate script, as PowerShell can sometimes lose context:
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000

```
*The ML service will start on `http://localhost:8000`.*

---

## 3. Start the Frontend (React + Vite)
The frontend is the user interface that communicates with both the Backend API and ML Service.

**Commands:**
```bash
cd frontend
npm install       # (Only needed if dependencies are not installed)
npm run dev
```
*The frontend application will start on `http://localhost:5173`.*

---

Once all three services are running:
1. Open your web browser.
2. Navigate to [http://localhost:5173](http://localhost:5173).
3. The site is fully functional, with the UI layer, Express API, and ML prediction engine all communicating together.
