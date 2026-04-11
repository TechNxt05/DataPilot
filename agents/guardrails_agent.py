def check_guardrails(intent: str) -> bool:
    """
    Returns True if the intent is permitted.
    Returns False if it is out of bounds.
    """
    is_valid = intent != "unsupported"
    return is_valid

def get_guardrail_message() -> str:
    return "This platform is designed for structured data tasks only. Unsupported features or unrelated tasks cannot be processed."
