from __future__ import annotations
from typing import Dict, Any, Optional
from core.memory import memory_store

class MemoryAgent:
    def __init__(self):
        self.agent_id = "MemoryAgent"

    def recall_context(self, session_id: str) -> Dict[str, Any]:
        session = memory_store.get_session(session_id)
        if not session:
            return {}
        return {
            "query_history": session.query_history,
            "metadata": session.metadata
        }

    def store_event(self, session_id: str, event: str, data: Any):
        # In a real system, this would persist to a DB
        pass
