import json
from llm.model_router import query_llm
from utils.logger import get_logger

logger = get_logger("capability_agent")

def suggest_capabilities(schema_dict: dict) -> dict:
    """Analyzes dataset schema and suggests ML/Analyses."""
    system_prompt = f"""You are the Capability Agent.
    Given this dataset schema: {schema_dict}
    
    Suggest:
    1. "ml_tasks": up to 3 possible ML models/use cases
    2. "analyses": up to 3 possible business insights to explore
    3. "transformations": up to 3 possible feature engineering steps
    
    Return STRICTLY as JSON with these exact keys. Example:
    {{"ml_tasks": ["Predict sales using Regression"], "analyses": ["Analyze sales by region"], "transformations": ["Extract month from date"]}}
    """
    
    response = query_llm(system_prompt, "Suggest capabilities.")
    try:
         if "```json" in response:
             clean_resp = response.split("```json")[-1].split("```")[0].strip()
             return json.loads(clean_resp)
         elif "```" in response:
             clean_resp = response.split("```")[-1].split("```")[0].strip()
             return json.loads(clean_resp)
         return json.loads(response)
    except Exception as e:
         logger.error(f"Capability agent parse error: {e}")
         return {"ml_tasks": ["Unable to determine"], "analyses": [], "transformations": []}
