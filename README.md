# DataPilot AI – Architect Workspace Edition

DataPilot AI is an end-to-end multi-agent AI framework that allows you to directly connect datasets or database strings (MongoDB/SQL), visualize data structures, execute advanced Machine Learning models dynamically via an Agent Toolbox, and leverage conversational LLM reasoning over your datasets.

## Key Features
1. **Multi-Agent Architecture**: Discrete AI Agents specialized in data validation, correlation detection, dimensionality detection for Scikit-learn, and query generation.
2. **Auto-Healing Reflection Loop**: Uniquely equipped with an internal `reflection_agent.py` that catches tracebacks if an AI process fails, syntactically generates a Python corrective snippet using `exec()` dynamically, and retries the process autonomously.
3. **Multi-Pane UI Layout**: Built on Next.js, featuring an advanced Split-Panel Data Viewer grid, Sidebar Config, and Bottom Chatbox Overlay.
4. **Resilient LLM Routing**: Auto-handles quota logic descending from standard `OpenAI` to `Gemini`, routing down to `Groq` and `Ollama`.

## 📂 Repository Structure
- `agents/`: Contains specialized AI logic (Reflection, Detection, ML, Insight).
- `core/`: Orchestration pipelines binding datasets to agents.
- `connectors/`: Database hooks for native Pandas dataframe ingestion.
- `api/main.py`: The Python FastAPI backend.
- `frontend/`: The Next.js 14 and Tailwind CSS frontend dashboard.

---

## 🚀 Running Locally

You'll need two terminals. Ensure you copy `.env.example` to `.env` and fill in your API Keys (like `GROQ_API_KEY` or `GEMINI_API_KEY`).

**1. Start the API Backend (Python)**
```bash
pip install -r requirements.txt
uvicorn api.main:app --reload
```

**2. Start the Frontend (Next.js)**
Open a second terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

---

## ☁️ Deployment Guide (Vercel & Render)

Deploying a Heavy AI Python Application requires separating compute from the UI. Vercel Serverless Functions time out after 10-15s on the free tier, which terminates intensive Data Analysis or Regression tasks.

**Recommended Setup:** Deploy Frontend to **Vercel** and Backend to **Render**.

### Step 1: Deploy Backend to Render.com (Free)
1. Push this repository to GitHub.
2. Go to [Render.com](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
6. Click Deploy. Once finished, Render will give you a public URL (e.g., `https://datapilot-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel (Free)
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your DataPilot repository.
3. **CRITICAL STEP:** In the project configuration, find **Framework Preset** (ensure it says Next.js) and look for **Root Directory**. Click Edit, and select the `frontend` folder!
4. Before clicking Deploy, you must update the backend URL inside your Next.js application so the frontend knows where to talk. *(Instead of `http://127.0.0.1:8000`, replace the axios call in `frontend/src/app/page.tsx` with your Render API URL).*
5. Click **Deploy**.

