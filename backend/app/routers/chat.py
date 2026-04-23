from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid

from app.models.chat import ChatRequest, ChatResponse, ChatSession
from app.services.groq_service import chat_completion
from app.services.db_service import get_db
from app.services.auth_service import get_user_id
from typing import List

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def send_message(req: ChatRequest, user_id: str = Depends(get_user_id)):
    db  = get_db()
    now = datetime.now(timezone.utc)

    # Resolve or create session
    session_id = req.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        # Auto-title from first message (truncated)
        title = req.message[:60] + ("..." if len(req.message) > 60 else "")
        db.table("chat_sessions").insert({
            "id": session_id, "user_id": user_id,
            "title": title, "created_at": now.isoformat(), "updated_at": now.isoformat(),
        }).execute()

    # Load history for this session
    hist_resp = (
        db.table("chat_messages")
          .select("role,content")
          .eq("session_id", session_id)
          .order("created_at")
          .execute()
    )
    history = [{"role": m["role"], "content": m["content"]} for m in (hist_resp.data or [])]
    history.append({"role": "user", "content": req.message})

    # Get user's Groq key if set
    profile = db.table("user_profiles").select("groq_api_key").eq("id", user_id).single().execute()
    user_key = (profile.data or {}).get("groq_api_key")

    reply = await chat_completion(history, user_groq_key=user_key, context=req.context)

    # Persist both messages
    db.table("chat_messages").insert([
        {"id": str(uuid.uuid4()), "session_id": session_id, "role": "user",      "content": req.message, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "session_id": session_id, "role": "assistant", "content": reply,       "created_at": now.isoformat()},
    ]).execute()

    # Update session timestamp
    db.table("chat_sessions").update({"updated_at": now.isoformat()}).eq("id", session_id).execute()

    return ChatResponse(session_id=session_id, reply=reply, created_at=now)


@router.get("/chat/sessions", response_model=List[ChatSession])
async def list_sessions(user_id: str = Depends(get_user_id)):
    db   = get_db()
    resp = db.table("chat_sessions").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
    return [ChatSession(**s) for s in (resp.data or [])]


@router.delete("/chat/sessions/{session_id}", status_code=204)
async def delete_session(session_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    db.table("chat_sessions").delete().eq("id", session_id).eq("user_id", user_id).execute()
