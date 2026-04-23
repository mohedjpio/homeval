"""
HomeVal ML Pipeline
Trains HistGradientBoostingRegressor on Egyptian property data.
"""

import numpy as np
import pandas as pd
import joblib
import logging
from dataclasses import dataclass
from pathlib import Path
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).parent / "model.pkl"
DATA_PATH  = Path(__file__).parent / "training_data" / "egypt_home_pricing_30k.csv"

CONDITION_ORDER  = ["poor", "fair", "good", "very_good", "excellent"]
FINISH_ORDER     = ["unfinished", "semi_finished", "fully_finished", "luxury"]
FURNISH_ORDER    = ["unfurnished", "semi_furnished", "furnished", "fully_furnished"]
VIEW_ORDER       = ["no_view", "garden_view", "city_view", "sea_view", "nile_view"]
PROPERTY_TYPES   = ["apartment", "villa", "duplex", "penthouse", "studio", "townhouse"]
LOCATIONS = [
    "New Cairo","Maadi","Heliopolis","Zamalek","6th October","Sheikh Zayed",
    "Nasr City","Dokki","Mohandessin","Garden City","Rehab City","Tagamoa",
    "Ain Sokhna","North Coast","El Shorouk","Badr City","Obour City",
    "Hadayek El Ahram","Smouha Alexandria","Borg El Arab",
]

LOCATION_BASE_PRICES = {
    "Zamalek":45000,"Maadi":35000,"Garden City":42000,"New Cairo":28000,
    "Sheikh Zayed":26000,"6th October":18000,"Heliopolis":30000,"Dokki":27000,
    "Mohandessin":25000,"Nasr City":20000,"Rehab City":22000,"Tagamoa":24000,
    "Ain Sokhna":32000,"North Coast":35000,"El Shorouk":15000,"Badr City":12000,
    "Obour City":13000,"Hadayek El Ahram":16000,"Smouha Alexandria":22000,"Borg El Arab":14000,
}

USD_RATE = 49.5

@dataclass
class PredictionInput:
    area_sqm: float
    rooms: int
    bathrooms: int
    location: str
    condition: str
    finishing: str
    furnishing: str
    floor: int
    has_elevator: bool
    has_parking: bool
    has_garden: bool
    has_pool: bool
    view_type: str
    property_type: str

@dataclass
class ModelMetrics:
    r2: float
    mae: float
    rmse: float
    cv_mean: float
    cv_std: float

def build_features(df: pd.DataFrame) -> np.ndarray:
    data = df.copy()
    data["condition_enc"]     = pd.Categorical(data["condition"],     categories=CONDITION_ORDER,  ordered=True).codes
    data["finishing_enc"]     = pd.Categorical(data["finishing"],     categories=FINISH_ORDER,     ordered=True).codes
    data["furnishing_enc"]    = pd.Categorical(data["furnishing"],    categories=FURNISH_ORDER,    ordered=True).codes
    data["view_enc"]          = pd.Categorical(data["view_type"],     categories=VIEW_ORDER,       ordered=True).codes
    data["property_type_enc"] = pd.Categorical(data["property_type"], categories=PROPERTY_TYPES,  ordered=False).codes
    data["location_enc"]      = pd.Categorical(data["location"],      categories=LOCATIONS,        ordered=False).codes
    cols = ["area_sqm","rooms","bathrooms","floor","has_elevator","has_parking",
            "has_garden","has_pool","condition_enc","finishing_enc","furnishing_enc",
            "view_enc","property_type_enc","location_enc"]
    return data[cols].values

def compute_location_stats(df: pd.DataFrame) -> dict:
    stats = {}
    for loc in LOCATIONS:
        sub = df[df["location"]==loc]["price_egp"]
        if len(sub):
            stats[loc] = {"mean":float(sub.mean()),"median":float(sub.median()),
                          "std":float(sub.std()),"count":int(len(sub))}
    g = df["price_egp"]
    stats["_global"] = {"mean":float(g.mean()),"median":float(g.median()),
                        "std":float(g.std()),"count":int(len(g))}
    return stats

def generate_synthetic_data(n=30000, seed=42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    locations     = rng.choice(LOCATIONS, n)
    prop_types    = rng.choice(PROPERTY_TYPES, n, p=[0.55,0.12,0.10,0.08,0.08,0.07])
    conditions    = rng.choice(CONDITION_ORDER, n, p=[0.05,0.15,0.35,0.30,0.15])
    finishings    = rng.choice(FINISH_ORDER, n, p=[0.10,0.25,0.45,0.20])
    furnishings   = rng.choice(FURNISH_ORDER, n, p=[0.40,0.20,0.25,0.15])
    views         = rng.choice(VIEW_ORDER, n, p=[0.30,0.25,0.30,0.08,0.07])
    type_area = {"apartment":(80,250),"villa":(300,800),"duplex":(200,450),
                 "penthouse":(200,600),"studio":(40,80),"townhouse":(180,350)}
    areas = np.array([rng.uniform(*type_area.get(pt,(80,250))) for pt in prop_types])
    rooms     = np.clip(rng.integers(1,7,n),1,6)
    bathrooms = np.clip(rng.integers(1,rooms+1,n),1,rooms)
    floors    = rng.integers(0,20,n)
    has_elevator = rng.random(n)>0.35
    has_parking  = rng.random(n)>0.40
    has_garden   = rng.random(n)>0.70
    has_pool     = rng.random(n)>0.85
    cm = {c:1+i*0.12 for i,c in enumerate(CONDITION_ORDER)}
    fm = {f:1+i*0.15 for i,f in enumerate(FINISH_ORDER)}
    nm = {f:1+i*0.08 for i,f in enumerate(FURNISH_ORDER)}
    vm = {v:1+i*0.10 for i,v in enumerate(VIEW_ORDER)}
    tm = {"apartment":1.0,"villa":1.4,"duplex":1.15,"penthouse":1.35,"studio":0.9,"townhouse":1.1}
    prices = []
    for i in range(n):
        p = (areas[i]*LOCATION_BASE_PRICES[locations[i]]
             *cm[conditions[i]]*fm[finishings[i]]*nm[furnishings[i]]
             *vm[views[i]]*tm[prop_types[i]])
        if has_elevator[i]: p*=1.05
        if has_parking[i]:  p*=1.07
        if has_garden[i]:   p*=1.08
        if has_pool[i]:     p*=1.12
        if floors[i]>10:    p*=1.03
        p *= rng.uniform(0.88,1.12)
        prices.append(p)
    return pd.DataFrame({
        "area_sqm":areas,"rooms":rooms,"bathrooms":bathrooms,"location":locations,
        "condition":conditions,"finishing":finishings,"furnishing":furnishings,
        "floor":floors,"has_elevator":has_elevator.astype(int),
        "has_parking":has_parking.astype(int),"has_garden":has_garden.astype(int),
        "has_pool":has_pool.astype(int),"view_type":views,"property_type":prop_types,
        "price_egp":np.array(prices),
    })

def train_and_save():
    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH)
        logger.info(f"Loaded {len(df)} rows from {DATA_PATH}")
    else:
        logger.info("Generating synthetic training data...")
        df = generate_synthetic_data(30000)
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_PATH, index=False)

    X = build_features(df)
    y = np.log1p(df["price_egp"].values)
    X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.15,random_state=42)

    model = HistGradientBoostingRegressor(
        max_iter=300, learning_rate=0.05, max_depth=6,
        min_samples_leaf=20, l2_regularization=0.1, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    yp_prices = np.expm1(y_pred); yt_prices = np.expm1(y_test)
    cv = cross_val_score(model, X, y, cv=5, scoring="r2")
    metrics = ModelMetrics(
        r2=float(r2_score(y_test,y_pred)),
        mae=float(mean_absolute_error(yt_prices,yp_prices)),
        rmse=float(np.sqrt(mean_squared_error(yt_prices,yp_prices))),
        cv_mean=float(cv.mean()), cv_std=float(cv.std()))

    loc_stats = compute_location_stats(df)
    payload = {
        "model":model,"metrics":metrics,"location_stats":loc_stats,
        "locations":LOCATIONS,"condition_order":CONDITION_ORDER,
        "finish_order":FINISH_ORDER,"furnish_order":FURNISH_ORDER,
        "view_order":VIEW_ORDER,"property_types":PROPERTY_TYPES,
    }
    MODEL_PATH.parent.mkdir(parents=True,exist_ok=True)
    joblib.dump(payload, MODEL_PATH)
    logger.info(f"Saved model — R2={metrics.r2:.3f} MAE={metrics.mae:,.0f}")
    return payload

def load_model() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Model not trained yet. Run train_and_save() first.")
    return joblib.load(MODEL_PATH)

def predict_price(payload: dict, inp: PredictionInput) -> dict:
    model = payload["model"]
    loc_stats = payload["location_stats"]
    row = pd.DataFrame([{
        "area_sqm":inp.area_sqm,"rooms":inp.rooms,"bathrooms":inp.bathrooms,
        "location":inp.location,"condition":inp.condition,"finishing":inp.finishing,
        "furnishing":inp.furnishing,"floor":inp.floor,"has_elevator":int(inp.has_elevator),
        "has_parking":int(inp.has_parking),"has_garden":int(inp.has_garden),
        "has_pool":int(inp.has_pool),"view_type":inp.view_type,"property_type":inp.property_type,
    }])
    X   = build_features(row)
    log_p = model.predict(X)[0]
    price = float(np.expm1(log_p))
    lstat = loc_stats.get(inp.location, loc_stats.get("_global",{}))
    gstat = loc_stats.get("_global",{})
    gstd  = gstat.get("std", price*0.3) or price*0.3
    z = (price - gstat.get("mean",price)) / gstd
    from math import erf, sqrt
    pct = int((1+erf(z/sqrt(2)))/2*100)
    return {
        "predicted_price_egp": round(price),
        "predicted_price_usd": round(price/USD_RATE),
        "confidence_low":      round(price*0.92),
        "confidence_high":     round(price*1.08),
        "price_per_sqm":       round(price/inp.area_sqm),
        "location_stats": {
            "area_median":  round(lstat.get("median",price)),
            "area_mean":    round(lstat.get("mean",price)),
            "percentile":   min(99,max(1,pct)),
        },
    }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_and_save()
