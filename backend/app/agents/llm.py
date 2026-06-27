import json
from typing import Any, Dict

from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import get_settings


def get_chat_model() -> ChatGoogleGenerativeAI | None:
    settings = get_settings()
    if not settings.google_api_key:
        return None
    return ChatGoogleGenerativeAI(
        model=settings.model_name,
        google_api_key=settings.google_api_key,
        temperature=0.2,
    )


def invoke_json(prompt: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    model = get_chat_model()
    if not model:
        return fallback

    message = (
        "Return valid JSON only. "
        "Do not add markdown fences or extra text.\n"
        f"Prompt:\n{prompt}"
    )
    response = model.invoke(message)
    text = response.content if isinstance(response.content, str) else ""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return fallback


def invoke_text(prompt: str, fallback: str) -> str:
    model = get_chat_model()
    if not model:
        return fallback
    response = model.invoke(prompt)
    if isinstance(response.content, str):
        return response.content.strip()
    return fallback
