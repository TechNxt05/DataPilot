import json
from llm.model_router import query_llm
from utils.logger import get_logger

logger = get_logger("reflection_agent")

def generate_healing_code(error_trace: str, df_info: str, task: str) -> str:
    """Uses the LLM to generate a Python code snippet that fixes a data-related error."""
    
    system_prompt = f"""You are the Auto-Healing Reflection Agent.
    An error occurred during the {task} pipeline. 
    Review the trace and describe the Pandas code required to fix the DataFrame (`df`).
    
    Guidelines:
    1. Only return the raw python code snippet. 
    2. Do NOT wrap in markdown backticks, do NOT include explanations. 
    3. Assume a variable `df` exists. The output code will be executed via `exec()` locally.
    
    Data Schema snippet:
    {df_info}
    
    Error Trace:
    {error_trace}
    """
    
    response = query_llm(system_prompt, "Generate the pandas fix.")
    
    # Strip any potential markdown wrappers that the LLM ignored
    clean_resp = response.replace("```python", "").replace("```", "").strip()
    return clean_resp
