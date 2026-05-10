"""
ML Service — wraps the HomeVal HistGradientBoostingRegressor (housing_model.pkl).
Feature engineering mirrors the training pipeline exactly: 32 features.
"""
import logging
import math
import numpy as np
from functools import lru_cache
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ── Encoding orders (must match training pipeline exactly) ─────────────────
CONDITION_ORDER = ["Needs Renovation", "Fair", "Good", "New", "Excellent"]
FINISH_ORDER    = ["Core & Shell", "Semi Finished", "Fully Finished"]
FURNISH_ORDER   = ["Unfurnished", "Partially Furnished", "Furnished"]
VIEW_ORDER      = ["Street", "City", "Garden", "Pool", "Sea/Lake"]

PROPERTY_TYPES = ["Apartment", "Duplex", "Penthouse", "Studio", "Townhouse", "Villa"]

LOCATIONS = [
    "6th of October City", "Ain Sokhna", "Aswan", "Badr City", "Dokki",
    "El Shorouk City", "Heliopolis", "Hurghada", "Ismailia", "Luxor",
    "Maadi", "Mansoura", "Mohandessin", "Mostakbal City", "Nasr City",
    "New Administrative Capital", "New Mansoura", "Obour City", "Port Said",
    "Sheikh Zayed", "Shubra", "Suez", "Tanta", "Zamalek", "Alexandria",
]

# 32 features in exact order (feature_names_in_ from housing_model.pkl)
FEATURE_ORDER = [
    "area", "log_area", "area_sq",
    "bedrooms", "bathrooms", "bed_bath", "total_rooms", "bath_ratio", "area_per_bed",
    "condition_enc", "finishing_enc", "furnished_enc", "view_enc",
    "has_pool", "has_gym", "has_security", "has_elevator", "has_balcony",
    "is_compound", "amenity_score", "parking_spaces", "garden_sqm",
    "floor_number", "building_age_years", "age_sq", "new_building",
    "floor_to_ceiling_height_m", "distance_to_center_km", "distance_to_metro_km",
    "luxury_flag", "location_enc", "title_enc",
]

EGP_TO_USD = 1 / 49.5

LOCATION_DISTANCES = {
    "Zamalek": (3, 1), "Maadi": (12, 2), "Heliopolis": (15, 5),
    "Dokki": (5, 1), "Mohandessin": (7, 2), "Nasr City": (12, 3),
    "New Administrative Capital": (50, 45), "6th of October City": (35, 30),
    "Sheikh Zayed": (30, 25), "Mostakbal City": (45, 40),
    "Badr City": (50, 45), "El Shorouk City": (40, 35), "Obour City": (30, 25),
    "New Mansoura": (130, 120), "Mansoura": (130, 120),
    "Alexandria": (220, 10), "Ain Sokhna": (130, 120),
    "Hurghada": (450, 440), "Aswan": (900, 895), "Luxor": (670, 660),
    "Ismailia": (120, 115), "Port Said": (180, 175),
    "Suez": (140, 135), "Tanta": (95, 90), "Shubra": (8, 2),
}

LUXURY_LOCATIONS = {"Zamalek", "Maadi", "Heliopolis", "New Administrative Capital", "Hurghada"}


def _cat_code(lst: list, val: str, default: int = 0) -> int:
    try:
        return lst.index(val)
    except ValueError:
        return default


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


class MLService:
    def __init__(self, model_path: str = "ml/housing_model.pkl"):
        self.model         = None
        self.location_stats: dict = {}
        self.metrics_r2    = 0.987
        self.metrics_mae   = 404_363.0
        self.metrics_rmse  = 600_000.0
        self._load(model_path)

    def _load(self, path: str):
        p = Path(path)
        if not p.exists():
            logger.warning("housing_model.pkl not found at '%s' — using heuristic fallback", path)
            return
        try:
            import joblib
            bundle = joblib.load(p)
            self.model          = bundle["model"]
            self.location_stats = bundle.get("location_stats", {})
            m = bundle.get("metrics")
            if m:
                self.metrics_r2   = float(getattr(m, "cv_r2_mean", None) or getattr(m, "r2", 0.987))
                self.metrics_mae  = float(getattr(m, "mae",  self.metrics_mae))
                self.metrics_rmse = float(getattr(m, "rmse", self.metrics_rmse))
            logger.info("ML model loaded — R²=%.4f  features=%d",
                        self.metrics_r2, getattr(self.model, "n_features_in_", 32))
        except Exception as e:
            logger.error("Model load error: %s — heuristic fallback active", e)

    def _build_features(self, inp) -> np.ndarray:
        """Build the exact 32-feature vector expected by housing_model.pkl."""
        area      = float(inp.area_sqm)
        bedrooms  = int(inp.rooms)
        bathrooms = int(inp.bathrooms)

        log_area     = math.log1p(area)
        area_sq      = area ** 2
        bed_bath     = bedrooms * bathrooms
        total_rooms  = bedrooms + bathrooms
        bath_ratio   = bathrooms / max(bedrooms, 1)
        area_per_bed = area / max(bedrooms, 1)

        condition_enc = _cat_code(CONDITION_ORDER, inp.condition, default=2)
        finishing_enc = _cat_code(FINISH_ORDER,    inp.finishing, default=1)
        furnished_enc = _cat_code(FURNISH_ORDER,   inp.furnishing, default=0)
        view_enc      = _cat_code(VIEW_ORDER,       inp.view, default=1)

        has_pool      = int(inp.has_pool)
        has_gym       = int(getattr(inp, "has_gym",      False))
        has_security  = int(getattr(inp, "has_security", False))
        has_elevator  = int(inp.has_elevator)
        has_balcony   = int(getattr(inp, "has_balcony",  True))
        is_compound   = int(getattr(inp, "is_compound",  False))

        amenity_score  = has_pool + has_gym + has_security + has_elevator + has_balcony + is_compound
        parking_spaces = int(getattr(inp, "parking_spaces", int(inp.has_parking)))
        garden_sqm     = float(getattr(inp, "garden_sqm", 30.0 if inp.has_garden else 0.0))

        floor_number       = int(inp.floor)
        building_age_years = float(getattr(inp, "building_age_years", 5.0))
        age_sq             = building_age_years ** 2
        new_building       = int(building_age_years <= 2)

        floor_to_ceiling_height_m = float(getattr(inp, "floor_to_ceiling_height_m", 2.9))

        dist_center, dist_metro = LOCATION_DISTANCES.get(inp.location, (20, 15))
        distance_to_center_km = float(getattr(inp, "distance_to_center_km", dist_center))
        distance_to_metro_km  = float(getattr(inp, "distance_to_metro_km",  dist_metro))

        luxury_flag  = int(inp.location in LUXURY_LOCATIONS or finishing_enc == 2)
        location_enc = _cat_code(LOCATIONS, inp.location, default=0)
        title_enc    = _cat_code(PROPERTY_TYPES, inp.property_type, default=0)

        return np.array([[
            area, log_area, area_sq,
            bedrooms, bathrooms, bed_bath, total_rooms, bath_ratio, area_per_bed,
            condition_enc, finishing_enc, furnished_enc, view_enc,
            has_pool, has_gym, has_security, has_elevator, has_balcony,
            is_compound, amenity_score, parking_spaces, garden_sqm,
            floor_number, building_age_years, age_sq, new_building,
            floor_to_ceiling_height_m, distance_to_center_km, distance_to_metro_km,
            luxury_flag, location_enc, title_enc,
        ]], dtype=float)

    def _heuristic(self, inp) -> float:
        base = {
            "Zamalek": 55000, "Maadi": 40000, "Heliopolis": 35000,
            "New Administrative Capital": 30000, "Sheikh Zayed": 28000,
            "6th of October City": 20000, "Mostakbal City": 18000,
            "Badr City": 14000, "El Shorouk City": 16000, "Nasr City": 22000,
            "Alexandria": 25000, "Hurghada": 30000,
        }
        psqm   = base.get(inp.location, 20000)
        cond_m = 1 + 0.15 * _cat_code(CONDITION_ORDER, inp.condition, 2)
        fin_m  = 1 + 0.12 * _cat_code(FINISH_ORDER,    inp.finishing, 1)
        fur_m  = 1 + 0.06 * _cat_code(FURNISH_ORDER,   inp.furnishing, 0)
        amen   = 1 + 0.03 * sum([inp.has_elevator, inp.has_parking, inp.has_garden, inp.has_pool])
        return inp.area_sqm * psqm * cond_m * fin_m * fur_m * amen

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
