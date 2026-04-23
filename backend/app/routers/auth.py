from fastapi import APIRouter, Depends
from app.services.auth_service import get_user_id, verify_token
from app.services.db_service import get_db

router = APIRouter()


@router.get("/me")
async def me(user_id: str = Depends(get_user_id)):
    db   = get_db()
    resp = db.table("user_profiles").select("*").eq("id", user_id).single().execute()
    return resp.data or {"id": user_id}


@router.put("/me")
async def update_profile(data: dict, user_id: str = Depends(get_user_id)):
    db = get_db()
    # Only allow safe fields
    safe = {k: v for k, v in data.items() if k in ("full_name", "groq_api_key")}
    db.table("user_profiles").upsert({"id": user_id, **safe}).execute()
    return {"ok": True}
