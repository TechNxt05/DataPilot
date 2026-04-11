import os
import json
from pydantic import BaseModel
from dotenv import load_dotenv
from utils.logger import get_logger

load_dotenv()
logger = get_logger("model_router")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

if GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)

if OPENAI_API_KEY:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

if GROQ_API_KEY:
    from groq import Groq
    groq_client = Groq(api_key=GROQ_API_KEY)

def query_llm(system_prompt: str, user_prompt: str, fallback_to_mock: bool = True) -> str:
    """
    Tries to query LLMs in order of preference: OpenAI -> Gemini -> Groq -> Ollama Local -> Fallback.
    """
    
    # Try OpenAI
    if OPENAI_API_KEY:
        try:
            logger.info("Routing query to OpenAI API...")
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"OpenAI API failed: {e}")
            
    # Try Gemini 
    if GEMINI_API_KEY:
        try:
            logger.info("Routing query to Gemini API...")
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
            return response.text
        except Exception as e:
            logger.warning(f"Gemini API failed: {e}")

    # Try Groq
    if GROQ_API_KEY:
        try:
            logger.info("Routing query to Groq API...")
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"Groq API failed: {e}")

    # Try Ollama (Local)
    if OLLAMA_AVAILABLE:
        try:
            logger.info("Routing query to Local Ollama (llama3)...")
            response = ollama.chat(model='llama3', messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ])
            return response['message']['content']
        except Exception as e:
            logger.warning(f"Ollama local failed: {e}")

    if fallback_to_mock:
        logger.warning("All LLM providers failed. Returning mock data.")
        return '{"intent": "unsupported", "message": "Mock Fallback: I could not reach my LLM backend."}'
    else:
        raise Exception("No LLM providers available and mock fallback disabled.")
