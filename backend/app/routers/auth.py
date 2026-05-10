from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.auth_service import (
    register_user, login_user, get_user_by_id,
    update_user, get_user_id
)

router = APIRouter()

class RegisterRequest(BaseModel):
    email:     str
    password:  str
    full_name: str = ""

class LoginRequest(BaseModel):
    email:    str
    password: str

class UpdateRequest(BaseModel):
    full_name:    str = None
    avatar_url:   str = None
    groq_api_key: str = None

@router.post("/register")
async def register(req: RegisterRequest):
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not req.email or '@' not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    return register_user(req.email.strip(), req.password, req.full_name.strip())

@router.post("/login")
async def login(req: LoginRequest):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    return login_user(req.email.strip(), req.password)

@router.get("/me")
async def me(user_id: str = Depends(get_user_id)):
    return get_user_by_id(user_id)

@router.put("/me")
async def update_me(req: UpdateRequest, user_id: str = Depends(get_user_id)):
    data = {k: v for k, v in req.dict().items() if v is not None}
    return update_user(user_id, data)

@router.get("/check")
async def check():
    """Health check for auth system — no auth required"""
    from app.services.db_service import get_db
    from app.config import settings
    try:
        db = get_db()
        r  = db.table("users").select("id").limit(1).execute()
        return {
            "status":      "ok",
            "db":          "connected",
            "users_table": "exists",
            "url":         settings.SUPABASE_URL,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e), "url": settings.SUPABASE_URL}
