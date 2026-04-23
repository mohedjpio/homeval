from fastapi import APIRouter, Depends, HTTPException
from app.services.db_service import get_db
from app.services.auth_service import get_user_id
from typing import List

router = APIRouter()


@router.get("")
async def list_predictions(user_id: str = Depends(get_user_id), limit: int = 20, offset: int = 0):
    db = get_db()
    resp = (
        db.table("predictions")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", desc=True)
          .range(offset, offset + limit - 1)
          .execute()
    )
    return {"data": resp.data, "count": len(resp.data)}


@router.get("/{prediction_id}")
async def get_prediction(prediction_id: str, user_id: str = Depends(get_user_id)):
    db   = get_db()
    resp = db.table("predictions").select("*").eq("id", prediction_id).eq("user_id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return resp.data


@router.delete("/{prediction_id}", status_code=204)
async def delete_prediction(prediction_id: str, user_id: str = Depends(get_user_id)):
    db = get_db()
    db.table("predictions").delete().eq("id", prediction_id).eq("user_id", user_id).execute()
