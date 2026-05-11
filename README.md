# DataPilot AI - Neural Horizon Edition

DataPilot is a premium, autonomous data science mission control. It transforms raw datasets into deep strategic insights through a production-grade, self-healing agentic loop.

## 🌌 The Neural Horizon Experience

DataPilot v2.0 introduces an immersive, autonomous workspace designed for high-stakes data exploration.

- **Neural Core Engine**: A dynamic AI visualization that pulses and shifts through states (Planning, Executing, Success, Failure) to reflect the agent's real-time cognitive activity.
- **Interactive Holo-Charts**: Moving beyond static images. All visualizations are powered by Plotly, allowing for full interactivity (hover, zoom, slice) with a high-end holographic aesthetic.
- **Autonomous Discovery Audit**: A one-click "Magic Wand" feature that allows the agent to deep-scan a dataset without any user prompt—automatically identifying anomalies, correlations, and business opportunities.
- **Thought Stream (Chain of Thought)**: A real-time monologue panel that exposes the internal reasoning and decision-making logic of the ADS as it navigates the data pipeline.
- **Self-Healing Loop**: If a code execution fails, the Reflection Agent automatically analyzes the trace and generates healing code to bypass bottlenecks.

## 🏗️ Technical Architecture

- **The Planner**: Translates ambiguous goals into high-fidelity JSON execution graphs.
- **The Executor**: Runs Jupyter-style cells in a safe runtime environment.
- **The Critic**: A high-confidence quality gate that scores every artifact and triggers retries on logic gaps.
- **Memory Store**: Session-aware persistence for query history and multi-step state.

## 🛠️ Tech Stack

- **Backend**: FastAPI, Pandas, Scikit-Learn, Plotly, LangGraph-inspired state loops.
- **Intelligence**: Gemini Pro / GPT-4o / Groq / Ollama (Multi-model support).
- **Frontend**: Next.js 15, Framer Motion, Tailwind CSS, React-Plotly.

## 🚀 Getting Started

### 1. Backend Synchronization
```bash
pip install -r requirements.txt
uvicorn api.main:app --reload
```

### 2. Neural Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to launch the Mission Control.

---

*Built with passion for autonomous intelligence.*


