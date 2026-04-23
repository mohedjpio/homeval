from pydantic import BaseModel
from typing import List


class LocationStat(BaseModel):
    location:    str
    mean_price:  float
    median_price: float
    std_price:   float
    count:       int


class MarketOverview(BaseModel):
    total_listings:   int
    global_mean:      float
    global_median:    float
    global_std:       float
    locations_count:  int
    price_range_low:  float
    price_range_high: float


class PriceHistogramBucket(BaseModel):
    range_low:  float
    range_high: float
    count:      int
