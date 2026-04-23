"""
Groq service — proxies LLM calls, injects real estate context.
Migrated from desktop app's _groq_call() in ui/app.py.
"""
import httpx
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are HomeVal Assistant, an expert in Egyptian real estate markets.
You help users understand property valuations, neighborhood comparisons, investment potential,
and market trends in Egypt. You have deep knowledge of areas like New Cairo, Sheikh Zayed,
Maadi, Heliopolis, 6th of October, and other major Egyptian cities.

When users ask about prices, always clarify that values are in EGP (Egyptian Pounds).
Be concise, data-driven, and helpful. If you reference a price estimate, remind the user
they can use the Predict tab for a precise ML-powered valuation.
"""


async def chat_completion(
    messages: list[dict],
    user_groq_key: Optional[str] = None,
    context: Optional[dict] = None,
) -> str:
    api_key = user_groq_key or settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("No Groq API key available. Please add your key in Settings.")

    # Inject context as a system message if provided
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        ctx_text = "Current context:\n" + "\n".join(f"- {k}: {v}" for k, v in context.items())
        full_messages.append({"role": "system", "content": ctx_text})
    full_messages.extend(messages)

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": full_messages,
        "max_tokens": 1024,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GROQ_URL,
            json=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
