from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Must match ml_service.py exactly
CONDITION_ORDER = ["Needs Renovation", "Fair", "Good", "New", "Excellent"]
FINISH_ORDER    = ["Core & Shell", "Semi Finished", "Fully Finished"]
FURNISH_ORDER   = ["Unfurnished", "Partially Furnished", "Furnished"]
VIEW_ORDER      = ["Street", "City", "Garden", "Pool", "Sea/Lake"]
PROPERTY_TYPES  = ["Apartment", "Duplex", "Penthouse", "Studio", "Townhouse", "Villa"]


class PredictionInput(BaseModel):
    # ── Core ──────────────────────────────────────────────────────────────
    area_sqm:       float = Field(..., gt=0, le=10000)
    rooms:          int   = Field(..., ge=0, le=20, description="bedrooms")
    bathrooms:      int   = Field(..., ge=0, le=10)
    location:       str   = Field(..., min_length=1)
    property_type:  str   = "Apartment"

    # ── Quality ───────────────────────────────────────────────────────────
    condition:      str   = "Good"
    finishing:      str   = "Fully Finished"
    furnishing:     str   = "Unfurnished"
    view:           str   = "City"

    # ── Amenities (simple booleans, kept for backward compat) ─────────────
    has_elevator:   bool  = False
    has_parking:    bool  = False
    has_garden:     bool  = False
    has_pool:       bool  = False

    # ── Extended amenities ────────────────────────────────────────────────
    has_gym:        bool  = False
    has_security:   bool  = False
    has_balcony:    bool  = True
    is_compound:    bool  = False

    # ── Numeric amenities ─────────────────────────────────────────────────
    parking_spaces: int   = Field(0, ge=0, le=10)
    garden_sqm:     float = Field(0.0, ge=0)

    # ── Building ──────────────────────────────────────────────────────────
    floor:                     int   = Field(0, ge=0, le=60)
    building_age_years:        float = Field(5.0, ge=0, le=100)
    floor_to_ceiling_height_m: float = Field(2.9, ge=2.0, le=6.0)

    # ── Location distances (auto-filled by backend if omitted) ───────────
    distance_to_center_km: Optional[float] = None
    distance_to_metro_km:  Optional[float] = None


class LocationComparison(BaseModel):
    area_median:   float
    area_mean:     float
    percentile:    int
    price_per_sqm: float


class ModelMetrics(BaseModel):
    r2:   float
    mae:  float
    rmse: float


class PredictionResponse(BaseModel):
    prediction_id:        str
    predicted_price_egp:  float
    predicted_price_usd:  float
    confidence_low:       float
    confidence_high:      float
    price_per_sqm:        float
    location_comparison:  Optional[LocationComparison]
    model_metrics:        ModelMetrics
    created_at:           datetime


class PredictionRecord(BaseModel):
    id:                  str
    user_id:             str
    area_sqm:            float
    location:            str
    property_type:       str
    predicted_price_egp: float
    predicted_price_usd: float
    created_at:          datetime
