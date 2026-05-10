from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
from app.services.auth_service import get_user_id
from app.services.ml_service import get_ml_service
from app.services.db_service import get_db
from app.models.prediction import PredictionInput, PredictionResponse, LocationComparison, ModelMetrics

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict(inp: PredictionInput, user_id: str = Depends(get_user_id)):
    ml     = get_ml_service()
    result = ml.predict(inp)
    now    = datetime.now(timezone.utc)
    pid    = str(uuid.uuid4())

    loc_stats = ml.get_location_stats()
    loc_cmp   = None
    if inp.location in loc_stats:
        s   = loc_stats[inp.location]
        pct = int(min(99, max(1, 50 + 50 * (result.predicted_price_egp - s["median"]) / max(s["std"], 1))))
        loc_cmp = LocationComparison(
            area_median=s["median"], area_mean=s["mean"],
            percentile=pct, price_per_sqm=result.price_per_sqm
        )

    try:
        get_db().table("predictions").insert({
            "id": pid, "user_id": user_id,
            "area_sqm": inp.area_sqm, "rooms": inp.rooms, "bathrooms": inp.bathrooms,
            "location": inp.location, "condition": inp.condition,
            "finishing": inp.finishing, "furnishing": inp.furnishing,
            "floor": inp.floor, "has_elevator": inp.has_elevator,
            "has_parking": inp.has_parking, "has_garden": inp.has_garden,
            "has_pool": inp.has_pool, "view_type": inp.view,
            "property_type": inp.property_type,
            "predicted_price_egp": result.predicted_price_egp,
            "predicted_price_usd": result.predicted_price_usd,
            "confidence_low": result.confidence_low,
            "confidence_high": result.confidence_high,
            "price_per_sqm": result.price_per_sqm,
            "location_percentile": loc_cmp.percentile if loc_cmp else None,
            "created_at": now.isoformat(),
        }).execute()
    except Exception as e:
        pass  # non-fatal

    return PredictionResponse(
        prediction_id=pid,
        predicted_price_egp=result.predicted_price_egp,
        predicted_price_usd=result.predicted_price_usd,
        confidence_low=result.confidence_low,
        confidence_high=result.confidence_high,
        price_per_sqm=result.price_per_sqm,
        location_comparison=loc_cmp,
        model_metrics=ModelMetrics(r2=result.r2, mae=result.mae, rmse=result.rmse),
        created_at=now,
    )
