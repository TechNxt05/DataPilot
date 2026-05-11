from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from typing import Any, Deque, Dict, List
import uuid
import pandas as pd


@dataclass
class SessionMemory:
    session_id: str
    query_history: Deque[str] = field(default_factory=lambda: deque(maxlen=25))
    step_history: Deque[Dict[str, Any]] = field(default_factory=lambda: deque(maxlen=100))
    dataset_metadata: Dict[str, Any] = field(default_factory=dict)
    context: Dict[str, Any] = field(default_factory=dict)
    dataframe: pd.DataFrame | None = None


class MemoryStore:
    def __init__(self) -> None:
        self._sessions: Dict[str, SessionMemory] = {}

    def create_session(self) -> SessionMemory:
        session_id = str(uuid.uuid4())
        memory = SessionMemory(session_id=session_id)
        self._sessions[session_id] = memory
        return memory

    def get_session(self, session_id: str) -> SessionMemory | None:
        return self._sessions.get(session_id)

    def upsert_dataset(self, session_id: str, df: pd.DataFrame) -> SessionMemory:
        memory = self._sessions.get(session_id)
        if memory is None:
            memory = SessionMemory(session_id=session_id)
            self._sessions[session_id] = memory
        memory.dataframe = df
        memory.dataset_metadata = {
            "rows": len(df),
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        }
        return memory

    def add_query(self, session_id: str, query: str) -> None:
        memory = self._sessions.get(session_id)
        if memory:
            memory.query_history.append(query)

    def add_step_record(self, session_id: str, record: Dict[str, Any]) -> None:
        memory = self._sessions.get(session_id)
        if memory:
            memory.step_history.append(record)

    def snapshot(self, session_id: str) -> Dict[str, Any]:
        memory = self._sessions.get(session_id)
        if not memory:
            return {}
        return {
            "session_id": memory.session_id,
            "query_history": list(memory.query_history),
            "recent_steps": list(memory.step_history)[-10:],
            "dataset_metadata": memory.dataset_metadata,
            "context": memory.context,
        }


memory_store = MemoryStore()
