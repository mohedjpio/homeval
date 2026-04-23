from fastapi import APIRouter, Depends
from app.services.auth_service import require_admin
from app.services.ml_service import get_ml_service

router = APIRouter()


@router.get("/model-metrics")
async def model_metrics(_: dict = Depends(require_admin)):
    ml = get_ml_service()
    return ml.get_global_stats()


@router.post("/retrain")
async def retrain(_: dict = Depends(require_admin)):
    # Placeholder — production would trigger a background job
    return {"status": "retrain_scheduled", "message": "Model retraining queued."}
