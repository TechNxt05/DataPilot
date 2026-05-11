import json
import sys
import io
import traceback
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

@dataclass
class SandboxResult:
    stdout: str
    artifacts: Dict[str, Any] = field(default_factory=dict)
    namespace: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

class Sandbox:
    def __init__(self):
        pass

    def run(self, code: str, initial_namespace: Dict[str, Any]) -> SandboxResult:
        # Note: In production, this should be in a separate process or container.
        # For this prototype, we use a restricted local environment.
        
        # Add common libraries to namespace
        import pandas as pd
        import numpy as np
        import sklearn
        import plotly.graph_objects as go
        import plotly.express as px
        
        namespace = {
            "pd": pd,
            "np": np,
            "sklearn": sklearn,
            "px": px,
            "go": go,
            "artifacts": {},
            **initial_namespace
        }

        stdout_capture = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = stdout_capture
        
        error = None
        artifacts = {}

        try:
            exec(code, namespace)
            
            # Extract artifacts
            if "fig" in namespace and hasattr(namespace["fig"], "to_json"):
                artifacts["chart"] = json.loads(namespace["fig"].to_json())
            
            if "results" in namespace:
                artifacts["metrics"] = namespace["results"]
                
            if "artifacts" in namespace:
                artifacts.update(namespace["artifacts"])
                
        except Exception as e:
            error = f"{str(e)}\n{traceback.format_exc()}"
        finally:
            sys.stdout = old_stdout

        return SandboxResult(
            stdout=stdout_capture.getvalue(),
            artifacts=artifacts,
            namespace=namespace,
            error=error
        )
