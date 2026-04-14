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


