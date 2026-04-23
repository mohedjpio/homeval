from fastapi import APIRouter, Depends
from app.services.ml_service import get_ml_service
from app.services.auth_service import get_user_id
from app.models.analytics import LocationStat, MarketOverview, PriceHistogramBucket
from typing import List

router = APIRouter()


@router.get("/locations", response_model=List[LocationStat])
async def get_locations(_: str = Depends(get_user_id)):
    ml    = get_ml_service()
    stats = ml.get_location_stats()
    return [
        LocationStat(
            location     = loc,
            mean_price   = s["mean"],
            median_price = s["median"],
            std_price    = s["std"],
            count        = s["count"],
        )
        for loc, s in stats.items()
    ]


@router.get("/market", response_model=MarketOverview)
async def get_market(_: str = Depends(get_user_id)):
    ml = get_ml_service()
    g  = ml.get_global_stats()
    ls = ml.get_location_stats()
    total = sum(s["count"] for s in ls.values())
    all_means = [s["mean"] for s in ls.values() if s["mean"] > 0]
    return MarketOverview(
        total_listings   = total,
        global_mean      = g["global_mean"],
        global_median    = g["global_median"],
        global_std       = g["global_std"],
        locations_count  = len(ls),
        price_range_low  = min(all_means) if all_means else 0,
        price_range_high = max(all_means) if all_means else 0,
    )


@router.get("/locations/{location_name}", response_model=LocationStat)
async def get_location(location_name: str, _: str = Depends(get_user_id)):
    ml    = get_ml_service()
    stats = ml.get_location_stats()
    if location_name not in stats:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Location not found")
    s = stats[location_name]
    return LocationStat(
        location=location_name,
        mean_price=s["mean"], median_price=s["median"],
        std_price=s["std"], count=s["count"],
    )
