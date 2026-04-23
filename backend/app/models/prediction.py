from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Match ml/pipeline.py exactly
CONDITION_ORDER = ["poor", "fair", "good", "very_good", "excellent"]
FINISH_ORDER    = ["unfinished", "semi_finished", "fully_finished", "luxury"]
FURNISH_ORDER   = ["unfurnished", "semi_furnished", "furnished", "fully_furnished"]
VIEW_ORDER      = ["no_view", "garden_view", "city_view", "sea_view", "nile_view"]
PROPERTY_TYPES  = ["apartment", "villa", "duplex", "penthouse", "studio", "townhouse"]


class PredictionInput(BaseModel):
    area_sqm:      float = Field(..., gt=0, le=10000)
    rooms:         int   = Field(..., ge=0, le=20)
    bathrooms:     int   = Field(..., ge=0, le=10)
    location:      str   = Field(..., min_length=1)
    condition:     str   = "good"
    finishing:     str   = "fully_finished"
    furnishing:    str   = "unfurnished"
    floor:         int   = Field(0, ge=0, le=60)
    has_elevator:  bool  = False
    has_parking:   bool  = False
    has_garden:    bool  = False
    has_pool:      bool  = False
    view:          str   = "no_view"
    property_type: str   = "apartment"


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
