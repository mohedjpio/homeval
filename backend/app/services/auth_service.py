import bcrypt, jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.services.db_service import get_db

security = HTTPBearer()

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt(12)).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try: return bcrypt.checkpw(pw.encode(), hashed.encode())
    except: return False

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub":   user_id,
        "email": email,
        "iat":   datetime.now(timezone.utc),
        "exp":   datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired — please sign in again")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token")

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return decode_token(creds.credentials)

def get_user_id(user: dict = Depends(get_current_user)) -> str:
    uid = user.get("sub")
    if not uid: raise HTTPException(status_code=401, detail="Invalid token")
    return uid

def _safe(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "password_hash"}

def register_user(email: str, password: str, full_name: str = "") -> dict:
    db = get_db()
    existing = db.table("users").select("id").eq("email", email.lower()).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered. Please sign in.")
    pw_hash = hash_password(password)
    result  = db.table("users").insert({
        "email": email.lower(), "password_hash": pw_hash, "full_name": full_name,
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create account")
    user  = result.data[0]
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": _safe(user)}

def login_user(email: str, password: str) -> dict:
    db     = get_db()
    result = db.table("users").select("*").eq("email", email.lower()).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = result.data[0]
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": _safe(user)}

def get_user_by_id(user_id: str) -> dict:
    db     = get_db()
    result = db.table("users").select(
        "id,email,full_name,avatar_url,groq_api_key,role,created_at"
    ).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]

def update_user(user_id: str, data: dict) -> dict:
    db      = get_db()
    allowed = {k: v for k, v in data.items() if k in ("full_name", "avatar_url", "groq_api_key")}
    if not allowed:
        raise HTTPException(status_code=400, detail="No valid fields")
    allowed["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = db.table("users").update(allowed).eq("id", user_id).execute()
    return result.data[0] if result.data else {}
