"""
ML Service — trains and serves a HistGradientBoostingRegressor.
If the bundled .pkl fails to load (e.g. numpy version mismatch),
it retrains automatically using synthetic data and saves a fresh model.
"""
import logging
import math
import numpy as np
from functools import lru_cache
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ── Encoding orders ────────────────────────────────────────────────────────
CONDITION_ORDER = ["Needs Renovation", "Fair", "Good", "New", "Excellent"]
FINISH_ORDER    = ["Core & Shell", "Semi Finished", "Fully Finished"]
FURNISH_ORDER   = ["Unfurnished", "Partially Furnished", "Furnished"]
VIEW_ORDER      = ["Street", "City", "Garden", "Pool", "Sea/Lake"]
PROPERTY_TYPES  = ["Apartment", "Duplex", "Penthouse", "Studio", "Townhouse", "Villa"]

LOCATIONS = [
    "6th of October City", "Ain Sokhna", "Aswan", "Badr City", "Dokki",
    "El Shorouk City", "Heliopolis", "Hurghada", "Ismailia", "Luxor",
    "Maadi", "Mansoura", "Mohandessin", "Mostakbal City", "Nasr City",
    "New Administrative Capital", "New Mansoura", "Obour City", "Port Said",
    "Sheikh Zayed", "Shubra", "Suez", "Tanta", "Zamalek", "Alexandria",
]

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

LOCATION_BASE_PRICES = {
    "Zamalek": 55000, "Maadi": 40000, "Heliopolis": 35000,
    "New Administrative Capital": 30000, "Sheikh Zayed": 28000,
    "6th of October City": 20000, "Mostakbal City": 18000,
    "Badr City": 14000, "El Shorouk City": 16000, "Nasr City": 22000,
    "Alexandria": 25000, "Hurghada": 30000, "Dokki": 27000,
    "Mohandessin": 25000, "Ain Sokhna": 32000, "Aswan": 12000,
    "Luxor": 11000, "Ismailia": 13000, "Port Said": 14000,
    "Suez": 12000, "Tanta": 11000, "Shubra": 15000,
    "Mansoura": 13000, "New Mansoura": 15000, "Obour City": 13000,
}


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


def _generate_training_data(n: int = 20000) -> "tuple":
    """Generate synthetic training data matching the 32-feature schema."""
    import pandas as pd
    rng = np.random.default_rng(42)

    locations    = rng.choice(LOCATIONS, n)
    prop_types   = rng.choice(PROPERTY_TYPES, n, p=[0.50, 0.10, 0.08, 0.10, 0.08, 0.14])
    conditions   = rng.choice(CONDITION_ORDER, n, p=[0.05, 0.15, 0.35, 0.30, 0.15])
    finishings   = rng.choice(FINISH_ORDER,    n, p=[0.15, 0.40, 0.45])
    furnishings  = rng.choice(FURNISH_ORDER,   n, p=[0.40, 0.30, 0.30])
    views        = rng.choice(VIEW_ORDER,      n, p=[0.30, 0.30, 0.25, 0.08, 0.07])

    type_area = {"Apartment": (70, 250), "Villa": (300, 800), "Duplex": (200, 450),
                 "Penthouse": (200, 600), "Studio": (40, 80), "Townhouse": (180, 350)}
    areas    = np.array([rng.uniform(*type_area.get(pt, (80, 250))) for pt in prop_types])
    bedrooms = np.clip(rng.integers(1, 7, n), 1, 6)
    bathrooms = np.clip(rng.integers(1, bedrooms + 1), 1, bedrooms)
    floors   = rng.integers(0, 20, n)
    building_age = rng.uniform(0, 30, n)
    height   = rng.uniform(2.7, 3.5, n)

    has_pool     = (rng.random(n) > 0.85).astype(int)
    has_gym      = (rng.random(n) > 0.75).astype(int)
    has_security = (rng.random(n) > 0.50).astype(int)
    has_elevator = (rng.random(n) > 0.35).astype(int)
    has_balcony  = (rng.random(n) > 0.40).astype(int)
    is_compound  = (rng.random(n) > 0.60).astype(int)
    parking      = rng.integers(0, 3, n)
    garden_sqm   = rng.uniform(0, 200, n) * (rng.random(n) > 0.7)

    # Build feature matrix
    rows = []
    prices = []
    for i in range(n):
        area         = float(areas[i])
        bed          = int(bedrooms[i])
        bath         = int(bathrooms[i])
        cond_enc     = _cat_code(CONDITION_ORDER, conditions[i], 2)
        fin_enc      = _cat_code(FINISH_ORDER,    finishings[i], 1)
        fur_enc      = _cat_code(FURNISH_ORDER,   furnishings[i], 0)
        view_enc     = _cat_code(VIEW_ORDER,       views[i], 1)
        loc_enc      = _cat_code(LOCATIONS,        locations[i], 0)
        title_enc    = _cat_code(PROPERTY_TYPES,   prop_types[i], 0)
        luxury       = int(locations[i] in LUXURY_LOCATIONS or fin_enc == 2)
        age          = float(building_age[i])
        dist_c, dist_m = LOCATION_DISTANCES.get(locations[i], (20, 15))
        amenity      = int(has_pool[i]) + int(has_gym[i]) + int(has_security[i]) + \
                       int(has_elevator[i]) + int(has_balcony[i]) + int(is_compound[i])

        row = [
            area, math.log1p(area), area**2,
            bed, bath, bed*bath, bed+bath, bath/max(bed,1), area/max(bed,1),
            cond_enc, fin_enc, fur_enc, view_enc,
            has_pool[i], has_gym[i], has_security[i], has_elevator[i], has_balcony[i],
            is_compound[i], amenity, int(parking[i]), float(garden_sqm[i]),
            int(floors[i]), age, age**2, int(age <= 2),
            float(height[i]), float(dist_c), float(dist_m),
            luxury, loc_enc, title_enc,
        ]
        rows.append(row)

        # Price formula
        psqm = LOCATION_BASE_PRICES.get(locations[i], 18000)
        p = area * psqm
        p *= (1 + 0.15 * cond_enc)
        p *= (1 + 0.12 * fin_enc)
        p *= (1 + 0.06 * fur_enc)
        p *= (1 + 0.05 * view_enc)
        p *= (1 + 0.03 * amenity)
        p *= rng.uniform(0.90, 1.10)
        prices.append(p)

    X = np.array(rows, dtype=float)
    y = np.log1p(np.array(prices))
    return X, y, locations


def _train_fresh_model(save_path: Path) -> dict:
    """Train a new model from synthetic data and save it."""
    from sklearn.ensemble import HistGradientBoostingRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    import joblib

    logger.info("Training fresh ML model (synthetic data, n=20000)...")
    X, y, locations = _generate_training_data(20000)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.15, random_state=42)

    model = HistGradientBoostingRegressor(
        max_iter=200, learning_rate=0.05, max_depth=6,
        min_samples_leaf=20, l2_regularization=0.1, random_state=42)
    model.fit(X_tr, y_tr)

    y_pred    = model.predict(X_te)
    yp_prices = np.expm1(y_pred)
    yt_prices = np.expm1(y_te)

    r2   = float(r2_score(y_te, y_pred))
    mae  = float(mean_absolute_error(yt_prices, yp_prices))
    rmse = float(np.sqrt(mean_squared_error(yt_prices, yp_prices)))

    # Simple location stats
    all_prices = np.expm1(y)
    loc_stats  = {}
    for i, loc in enumerate(locations):
        if loc not in loc_stats:
            loc_stats[loc] = []
        loc_stats[loc].append(float(all_prices[i]))
    location_stats = {
        loc: {"mean": float(np.mean(v)), "median": float(np.median(v)),
              "std": float(np.std(v)), "count": len(v)}
        for loc, v in loc_stats.items()
    }

    bundle = {"model": model, "location_stats": location_stats,
              "metrics": {"r2": r2, "mae": mae, "rmse": rmse}}

    save_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, save_path)
    logger.info("Fresh model saved — R2=%.4f  MAE=%.0f  (MAE EGP: %s)", r2, mae, f"{mae:,.0f}")
    return bundle


class MLService:
    def __init__(self, model_path: str = "ml/housing_model.pkl"):
        self.model          = None
        self.location_stats: dict = {}
        self.metrics_r2     = 0.0
        self.metrics_mae    = 404_363.0
        self.metrics_rmse   = 600_000.0
        self._load(model_path)

    def _load(self, path: str):
        p = Path(path)

        # Try loading existing pkl first
        if p.exists():
            try:
                import joblib
                bundle = joblib.load(p)
                self.model          = bundle["model"]
                self.location_stats = bundle.get("location_stats", {})
                m = bundle.get("metrics", {})
                self.metrics_r2   = float(m.get("r2",   self.metrics_r2))
                self.metrics_mae  = float(m.get("mae",  self.metrics_mae))
                self.metrics_rmse = float(m.get("rmse", self.metrics_rmse))
                logger.info("ML model loaded — R²=%.4f  features=%d",
                            self.metrics_r2, getattr(self.model, "n_features_in_", 32))
                return
            except Exception as e:
                logger.warning("Existing pkl failed (%s) — retraining...", e)

        # Retrain fresh model
        try:
            bundle = _train_fresh_model(p)
            self.model          = bundle["model"]
            self.location_stats = bundle.get("location_stats", {})
            m = bundle.get("metrics", {})
            self.metrics_r2   = float(m.get("r2",   self.metrics_r2))
            self.metrics_mae  = float(m.get("mae",  self.metrics_mae))
            self.metrics_rmse = float(m.get("rmse", self.metrics_rmse))
        except Exception as e:
            logger.error("Retraining failed: %s — heuristic fallback active", e)

    def _build_features(self, inp) -> np.ndarray:
        area      = float(inp.area_sqm)
        bedrooms  = int(inp.rooms)
        bathrooms = int(inp.bathrooms)
        age       = float(getattr(inp, "building_age_years", 5.0))
        height    = float(getattr(inp, "floor_to_ceiling_height_m", 2.9))

        cond_enc  = _cat_code(CONDITION_ORDER, inp.condition,   default=2)
        fin_enc   = _cat_code(FINISH_ORDER,    inp.finishing,   default=1)
        fur_enc   = _cat_code(FURNISH_ORDER,   inp.furnishing,  default=0)
        view_enc  = _cat_code(VIEW_ORDER,      inp.view,        default=1)
        loc_enc   = _cat_code(LOCATIONS,       inp.location,    default=0)
        title_enc = _cat_code(PROPERTY_TYPES,  inp.property_type, default=0)

        has_pool     = int(inp.has_pool)
        has_gym      = int(getattr(inp, "has_gym",      False))
        has_security = int(getattr(inp, "has_security", False))
        has_elevator = int(inp.has_elevator)
        has_balcony  = int(getattr(inp, "has_balcony",  True))
        is_compound  = int(getattr(inp, "is_compound",  False))
        parking      = int(getattr(inp, "parking_spaces", int(inp.has_parking)))
        garden       = float(getattr(inp, "garden_sqm", 30.0 if inp.has_garden else 0.0))

        amenity = has_pool + has_gym + has_security + has_elevator + has_balcony + is_compound
        luxury  = int(inp.location in LUXURY_LOCATIONS or fin_enc == 2)
        dist_c, dist_m = LOCATION_DISTANCES.get(inp.location, (20, 15))
        dist_c  = float(getattr(inp, "distance_to_center_km", dist_c))
        dist_m  = float(getattr(inp, "distance_to_metro_km",  dist_m))

        return np.array([[
            area, math.log1p(area), area**2,
            bedrooms, bathrooms, bedrooms*bathrooms, bedrooms+bathrooms,
            bathrooms/max(bedrooms, 1), area/max(bedrooms, 1),
            cond_enc, fin_enc, fur_enc, view_enc,
            has_pool, has_gym, has_security, has_elevator, has_balcony,
            is_compound, amenity, parking, garden,
            int(inp.floor), age, age**2, int(age <= 2),
            height, dist_c, dist_m,
            luxury, loc_enc, title_enc,
        ]], dtype=float)

    def _heuristic(self, inp) -> float:
        psqm     = LOCATION_BASE_PRICES.get(inp.location, 20000)
        cond_m   = 1 + 0.15 * _cat_code(CONDITION_ORDER, inp.condition,  2)
        fin_m    = 1 + 0.12 * _cat_code(FINISH_ORDER,    inp.finishing,  1)
        fur_m    = 1 + 0.06 * _cat_code(FURNISH_ORDER,   inp.furnishing, 0)
        amen     = 1 + 0.03 * sum([inp.has_elevator, inp.has_parking, inp.has_garden, inp.has_pool])
        return inp.area_sqm * psqm * cond_m * fin_m * fur_m * amen

    def predict(self, inp) -> MLResult:
        if self.model is not None:
            try:
                features  = self._build_features(inp)
                log_price = float(self.model.predict(features)[0])
                price_egp = float(np.expm1(log_price))
            except Exception as e:
                logger.error("Inference error: %s — heuristic fallback", e)
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
