from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, List


ToolCallable = Callable[..., Any]


@dataclass
class ToolSpec:
    name: str
    description: str
    handler: ToolCallable


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: Dict[str, ToolSpec] = {}

    def register(self, name: str, description: str, handler: ToolCallable) -> None:
        self._tools[name] = ToolSpec(name=name, description=description, handler=handler)

    def get(self, name: str) -> ToolSpec:
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered.")
        return self._tools[name]

    def list_tools(self) -> List[Dict[str, str]]:
        return [{"name": t.name, "description": t.description} for t in self._tools.values()]
