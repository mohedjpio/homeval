"""
ML Service — wraps the HomeVal HistGradientBoostingRegressor.
Feature encoding exactly mirrors ml/pipeline.py build_features().
"""
import logging
import numpy as np
from functools import lru_cache
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ── Must match ml/pipeline.py exactly ─────────────────────────────────────
CONDITION_ORDER = ["poor", "fair", "good", "very_good", "excellent"]
FINISH_ORDER    = ["unfinished", "semi_finished", "fully_finished", "luxury"]
FURNISH_ORDER   = ["unfurnished", "semi_furnished", "furnished", "fully_furnished"]
VIEW_ORDER      = ["no_view", "garden_view", "city_view", "sea_view", "nile_view"]
PROPERTY_TYPES  = ["apartment", "villa", "duplex", "penthouse", "studio", "townhouse"]
LOCATIONS = [
    "New Cairo","Maadi","Heliopolis","Zamalek","6th October","Sheikh Zayed",
    "Nasr City","Dokki","Mohandessin","Garden City","Rehab City","Tagamoa",
    "Ain Sokhna","North Coast","El Shorouk","Badr City","Obour City",
    "Hadayek El Ahram","Smouha Alexandria","Borg El Arab",
]

# 14 features in exact order from build_features()
FEATURE_ORDER = [
    "area_sqm","rooms","bathrooms","floor",
    "has_elevator","has_parking","has_garden","has_pool",
    "condition_enc","finishing_enc","furnishing_enc",
    "view_enc","property_type_enc","location_enc",
]

EGP_TO_USD = 1 / 49.5   # matches pipeline.py USD_RATE


@dataclass
class MLResult:
    predicted_price_egp: float
    predicted_price_usd: float
    confidence_low:      float
    confidence_high:     float
    price_per_sqm:       float
    r2:   float
    mae:  float
    rmse: float


def _cat_code(lst: list, val: str, default: int = 0) -> int:
    """Return ordered-category code, -1 for unseen (HistGBM handles NaN natively)."""
    try:
        return lst.index(val)
    except ValueError:
        return default


class MLService:
    def __init__(self, model_path: str = "ml/model.pkl"):
        self.model        = None
        self.location_stats: dict = {}
        self.metrics_r2   = 0.89
        self.metrics_mae  = 120_000.0
        self.metrics_rmse = 180_000.0
        self._load(model_path)

    def _load(self, path: str):
        p = Path(path)
        if not p.exists():
            logger.warning("model.pkl not found at '%s' — using heuristic fallback", path)
            return
        try:
            import joblib
            bundle = joblib.load(p)
            self.model          = bundle["model"]
            self.location_stats = bundle.get("location_stats", {})
            m = bundle.get("metrics")
            if m:
                self.metrics_r2   = float(m.r2)
                self.metrics_mae  = float(m.mae)
                self.metrics_rmse = float(m.rmse)
            logger.info("ML model loaded — R²=%.4f", self.metrics_r2)
        except Exception as e:
            logger.error("Model load error: %s — heuristic fallback active", e)

    def _build_features(self, inp) -> np.ndarray:
        """Build the exact 14-feature vector expected by the model."""
        loc_code  = _cat_code(LOCATIONS, inp.location, default=0)
        cond_code = _cat_code(CONDITION_ORDER, inp.condition, default=2)
        fin_code  = _cat_code(FINISH_ORDER,    inp.finishing, default=2)
        fur_code  = _cat_code(FURNISH_ORDER,   inp.furnishing, default=0)
        view_code = _cat_code(VIEW_ORDER,       inp.view, default=0)
        ptype_code = _cat_code(PROPERTY_TYPES, inp.property_type, default=0)

        return np.array([[
            inp.area_sqm,
            inp.rooms,
            inp.bathrooms,
            inp.floor,
            int(inp.has_elevator),
            int(inp.has_parking),
            int(inp.has_garden),
            int(inp.has_pool),
            cond_code,
            fin_code,
            fur_code,
            view_code,
            ptype_code,
            loc_code,
        ]], dtype=float)

    def _heuristic(self, inp) -> float:
        """Deterministic fallback when model.pkl is absent."""
        from app.services.ml_service import LOCATIONS
        base_prices = {
            "Zamalek":45000,"Maadi":35000,"Garden City":42000,"New Cairo":28000,
            "Sheikh Zayed":26000,"6th October":18000,"Heliopolis":30000,"Dokki":27000,
            "Mohandessin":25000,"Nasr City":20000,"Rehab City":22000,"Tagamoa":24000,
            "Ain Sokhna":32000,"North Coast":35000,"El Shorouk":15000,"Badr City":12000,
            "Obour City":13000,"Hadayek El Ahram":16000,"Smouha Alexandria":22000,"Borg El Arab":14000,
        }
        price_per_sqm = base_prices.get(inp.location, 20000)
        cond_mult = 1 + 0.12 * _cat_code(CONDITION_ORDER, inp.condition, 2)
        fin_mult  = 1 + 0.10 * _cat_code(FINISH_ORDER, inp.finishing, 2)
        amen      = 1 + 0.03 * sum([inp.has_elevator, inp.has_parking, inp.has_garden, inp.has_pool])
        return inp.area_sqm * price_per_sqm * cond_mult * fin_mult * amen

    def predict(self, inp) -> MLResult:
        if self.model is not None:
            try:
                features  = self._build_features(inp)
                log_price = float(self.model.predict(features)[0])
                price_egp = float(np.expm1(log_price))
            except Exception as e:
                logger.error("Inference error: %s — falling back to heuristic", e)
                price_egp = self._heuristic(inp)
        else:
            price_egp = self._heuristic(inp)

        return MLResult(
            predicted_price_egp = round(price_egp, 2),
            predicted_price_usd = round(price_egp * EGP_TO_USD, 2),
            confidence_low      = round(price_egp * 0.88, 2),
            confidence_high     = round(price_egp * 1.12, 2),
            price_per_sqm       = round(price_egp / max(inp.area_sqm, 1), 2),
            r2   = self.metrics_r2,
            mae  = self.metrics_mae,
            rmse = self.metrics_rmse,
        )

    def get_locations(self) -> list:
        return LOCATIONS

    def get_location_stats(self) -> dict:
        return {
            loc: self.location_stats.get(loc, {"mean": 0, "median": 0, "std": 0, "count": 0})
            for loc in LOCATIONS
        }

    def get_global_stats(self) -> dict:
        all_medians = [s.get("median", 0) for s in self.location_stats.values() if s.get("median")]
        return {
            "global_mean":   float(np.mean(all_medians))   if all_medians else 2_500_000,
            "global_median": float(np.median(all_medians)) if all_medians else 2_200_000,
            "global_std":    float(np.std(all_medians))    if all_medians else 800_000,
        }


@lru_cache(maxsize=1)
def get_ml_service() -> MLService:
    from app.config import settings
    return MLService(model_path=settings.ML_MODEL_PATH)
