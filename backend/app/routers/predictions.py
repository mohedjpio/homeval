from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_service import get_user_id
from app.services.db_service import get_db

router = APIRouter()

@router.get("")
async def list_predictions(user_id: str = Depends(get_user_id), limit: int = 20, offset: int = 0):
    db   = get_db()
    resp = db.table("predictions").select("*").eq("user_id", user_id) \
             .order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {"data": resp.data, "count": len(resp.data)}

@router.delete("/{pid}", status_code=204)
async def delete_prediction(pid: str, user_id: str = Depends(get_user_id)):
    get_db().table("predictions").delete().eq("id", pid).eq("user_id", user_id).execute()
