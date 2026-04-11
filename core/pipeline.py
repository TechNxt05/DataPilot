import pandas as pd
from typing import Dict, Any

from agents.router_agent import route_query
from agents.guardrails_agent import check_guardrails, get_guardrail_message
from agents.feature_request_agent import log_feature_request
from agents.detection_agent import detect_issues
from agents.correction_agent import clean_data
from agents.enrichment_agent import enrich_data
from agents.validation_agent import calculate_quality_score
from agents.insight_agent import generate_insights
from agents.visualization_agent import auto_visualize
from agents.ml_agent import suggest_and_run_model
from agents.query_agent import generate_query
from agents.capability_agent import suggest_capabilities

class DataPilotPipeline:
    def __init__(self):
        pass

    async def process_request(self, user_prompt: str, df: pd.DataFrame = None) -> Dict[str, Any]:
        """Main orchestrator based on intent."""
        
        # 1. Routing
        routing_decision = route_query(user_prompt)
        intent = routing_decision.get("intent")
        
        # 2. Guardrails
        if not check_guardrails(intent):
            # Log as feature request if it's unsupported
            await log_feature_request(intent, routing_decision.get("details", ""), user_prompt)
            return {"status": "blocked", "message": get_guardrail_message()}

        # Result object
        result = {"intent": intent, "status": "success", "data": {}}

        # If no DB/DF provided, we can't do much for data tasks
        if df is None and intent not in ["unsupported"]:
             result["status"] = "error"
             result["message"] = "No dataset provided."
             return result

        try:
            # 3. Execution Pipeline based on Intent
            if intent == "clean":
                issues = detect_issues(df)
                score_initial = calculate_quality_score(df, issues)
                
                df_cleaned = clean_data(df)
                df_enriched = enrich_data(df_cleaned)
                
                issues_after = detect_issues(df_enriched)
                score_final = calculate_quality_score(df_enriched, issues_after)
                
                result["data"]["cleaned_df"] = df_enriched
                result["data"]["quality_before"] = score_initial
                result["data"]["quality_after"] = score_final
                result["data"]["issues_fixed"] = issues

            elif intent == "analyze":
                insights = generate_insights(df)
                result["data"]["insights"] = insights
                
            elif intent == "visualize":
                charts = auto_visualize(df)
                result["data"]["charts"] = charts

            elif intent == "ml":
                target = df.columns[-1] 
                ml_res = suggest_and_run_model(df, target_col=target)
                result["data"]["ml_results"] = ml_res

            elif intent == "query":
                schema = {col: str(df[col].dtype) for col in df.columns}
                query_str = generate_query(user_prompt, "SQL", schema)
                result["data"]["generated_query"] = query_str

            elif intent == "suggest":
                schema = {col: str(df[col].dtype) for col in df.columns}
                suggestions = suggest_capabilities(schema)
                result["data"]["suggestions"] = suggestions
                
            else:
                result["status"] = "unsupported"
                result["message"] = "Intent unrecognized despite passing guardrails."

        except Exception as e:
            # Auto-Healing Reflection Loop
            import traceback
            from agents.reflection_agent import generate_healing_code
            
            error_msg = str(e)
            trace = traceback.format_exc()
            schema_info = str({c: str(df[c].dtype) for c in df.columns}) + f"\nPreview: \n{df.head(2).to_string()}"
            
            healing_code = generate_healing_code(trace, schema_info, intent)
            
            try:
                # Attempt to execute the healing code snippet directly onto the df
                local_vars = {"df": df, "pd": pd}
                exec(healing_code, globals(), local_vars)
                healed_df = local_vars["df"]
                
                result["status"] = "healed"
                result["data"]["healing_code"] = healing_code
                
                # Attempt simple response representing healed attempt
                if intent == "ml":
                    ml_res = suggest_and_run_model(healed_df, target_col=healed_df.columns[-1])
                    result["data"]["ml_results"] = ml_res
                elif intent == "clean":
                    result["data"]["cleaned_df"] = clean_data(healed_df)
                else:
                    result["message"] = "Healed DataFrame, but operation was too complex to automatically retry."
            except Exception as nested_e:
                result["status"] = "error"
                result["message"] = f"Original error: {error_msg}. Auto-healing failed: {nested_e}"
                
        return result
