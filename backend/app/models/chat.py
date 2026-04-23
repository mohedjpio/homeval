from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    role:    str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message:    str
    context:    Optional[dict] = None


class ChatResponse(BaseModel):
    session_id: str
    reply:      str
    created_at: datetime


class ChatSession(BaseModel):
    id:         str
    title:      Optional[str]
    created_at: datetime
    updated_at: datetime
