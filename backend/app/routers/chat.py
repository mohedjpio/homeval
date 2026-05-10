from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
from app.services.auth_service import get_user_id
from app.services.groq_service import chat_completion
from app.services.db_service import get_db
from app.services.auth_service import get_user_by_id
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message:    str
    context:    Optional[dict] = None

@router.post("")
async def send_message(req: ChatRequest, user_id: str = Depends(get_user_id)):
    db  = get_db()
    now = datetime.now(timezone.utc)

    session_id = req.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        db.table("chat_sessions").insert({
            "id": session_id, "user_id": user_id,
            "title": req.message[:60], "created_at": now.isoformat(), "updated_at": now.isoformat(),
        }).execute()

    hist = db.table("chat_messages").select("role,content") \
             .eq("session_id", session_id).order("created_at").execute()
    history = [{"role": m["role"], "content": m["content"]} for m in (hist.data or [])]
    history.append({"role": "user", "content": req.message})

    user    = get_user_by_id(user_id)
    user_key = user.get("groq_api_key")

    reply = await chat_completion(history, user_groq_key=user_key, context=req.context)

    db.table("chat_messages").insert([
        {"id": str(uuid.uuid4()), "session_id": session_id, "role": "user",      "content": req.message, "created_at": now.isoformat()},
        {"id": str(uuid.uuid4()), "session_id": session_id, "role": "assistant", "content": reply,       "created_at": now.isoformat()},
    ]).execute()
    db.table("chat_sessions").update({"updated_at": now.isoformat()}).eq("id", session_id).execute()

    return {"session_id": session_id, "reply": reply, "created_at": now.isoformat()}

@router.get("/sessions")
async def list_sessions(user_id: str = Depends(get_user_id)):
    db = get_db()
    r  = db.table("chat_sessions").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
    return r.data or []

@router.delete("/sessions/{sid}", status_code=204)
async def delete_session(sid: str, user_id: str = Depends(get_user_id)):
    get_db().table("chat_sessions").delete().eq("id", sid).eq("user_id", user_id).execute()
