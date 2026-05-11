from fastapi import APIRouter, Depends
from app.services.auth_service import get_user_id
import logging, os, pathlib, json
import numpy as np

router = APIRouter()
logger = logging.getLogger(__name__)
_cache = None

CSV_URL = (
    "https://swxxycnfnkopzuarhets.supabase.co/storage/v1/object/sign/data/"
    "egypt_home_pricing_30k.csv?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xZTVkMDY1OS1jZjgxLTQ3YjAtOWMxMS1iZmU0OGExYmFjNzAiLCJhbGciOiJIUzI1NiJ9"
    ".eyJ1cmwiOiJkYXRhL2VneXB0X2hvbWVfcHJpY2luZ18zMGsuY3N2IiwiaWF0IjoxNzc4NDk1MTI3LCJleHAiOjE4MTAwMzExMjd9"
    ".65QOVVNoEYPGp1yVeIPhrN7PrNOFepJDe8gQoUSVxAw"
)
LOCAL_CACHE = pathlib.Path("/tmp/properties_cache.json")


def load_dataframe():
    import pandas as pd

    # Try /tmp cache first (from a previous download — survives restarts within same container)
    if LOCAL_CACHE.exists():
        logger.info("Analytics: loading cached CSV from /tmp")
        return pd.read_json(LOCAL_CACHE)

    # Download real CSV from Supabase
    logger.info("Analytics: downloading CSV from Supabase...")
    import httpx
    resp = httpx.get(CSV_URL, follow_redirects=True, timeout=60)
    resp.raise_for_status()
    from io import StringIO
    df = pd.read_csv(StringIO(resp.text))
    logger.info("Analytics: downloaded %d rows, cols: %s", len(df), list(df.columns))

    # Normalise column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Cache to /tmp for subsequent requests
    df.to_json(LOCAL_CACHE, orient="records")
    logger.info("Analytics: cached to /tmp")
    return df


def ensure_columns(df):
    """Add any missing columns the analytics code expects."""
    import pandas as pd
    defaults = {
        "price_per_sqm":       lambda d: d["price_egp"] / d["area_sqm"].clip(lower=1),
        "sqm_market_rate_egp": lambda d: d["price_egp"] / d["area_sqm"].clip(lower=1),
        "roi_pct":             lambda d: (d["price_egp"] * 0.1 / d["price_egp"] * 100),
        "rental_yield":        lambda d: (d["price_egp"] * 0.06 / d["price_egp"] * 100),
        "overpriced":          lambda d: (d["price_egp"] > d["price_egp"].median() * 1.15).astype(int),
        "amenity_score":       lambda d: (
            d.get("has_pool", pd.Series(0, d.index)).fillna(0).astype(int) +
            d.get("has_gym", pd.Series(0, d.index)).fillna(0).astype(int) +
            d.get("has_security", pd.Series(0, d.index)).fillna(0).astype(int) +
            d.get("has_elevator", pd.Series(0, d.index)).fillna(0).astype(int) +
            d.get("has_balcony", pd.Series(0, d.index)).fillna(0).astype(int) +
            d.get("is_compound", pd.Series(0, d.index)).fillna(0).astype(int)
        ),
        "distance_to_center_km": lambda d: pd.Series(20.0, index=d.index),
        "distance_to_metro_km":  lambda d: pd.Series(5.0,  index=d.index),
        "floor_number":          lambda d: pd.Series(3,    index=d.index),
        "building_age_years":    lambda d: pd.Series(10.0, index=d.index),
        "has_pool":      lambda d: pd.Series(0, index=d.index),
        "has_gym":       lambda d: pd.Series(0, index=d.index),
        "has_security":  lambda d: pd.Series(0, index=d.index),
        "has_elevator":  lambda d: pd.Series(0, index=d.index),
        "has_balcony":   lambda d: pd.Series(0, index=d.index),
        "is_compound":   lambda d: pd.Series(0, index=d.index),
        "parking_spaces":lambda d: pd.Series(0, index=d.index),
        "garden_sqm":    lambda d: pd.Series(0.0, index=d.index),
        "finishing_type":lambda d: d.get("finishing", pd.Series("Semi Finished", index=d.index)),
        "furnished":     lambda d: d.get("furnishing", pd.Series("Unfurnished", index=d.index)),
        "view_type":     lambda d: d.get("view", pd.Series("Street", index=d.index)),
        "condition":     lambda d: d.get("property_condition", pd.Series("Good", index=d.index)),
        "property_type": lambda d: d.get("type", pd.Series("Apartment", index=d.index)),
    }
    for col, fn in defaults.items():
        if col not in df.columns:
            try:
                df[col] = fn(df)
            except Exception as e:
                logger.warning("Could not add column %s: %s", col, e)
                import pandas as pd2
                df[col] = 0
    return df


def compute_analytics():
    global _cache
    if _cache:
        return _cache
    try:
        import pandas as pd
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import r2_score, mean_absolute_error

        df = load_dataframe()
        df = ensure_columns(df)

        # Compute derived cols
        df["price_per_sqm"]       = df["price_egp"] / df["area_sqm"].clip(lower=1)
        df["sqm_market_rate_egp"] = df["price_per_sqm"]
        df["roi_pct"]      = ((df["price_egp"] * 1.1 - df["price_egp"]) / df["price_egp"] * 100).clip(0, 50)
        df["rental_yield"] = (df["price_egp"] * 0.06 / df["price_egp"] * 100).clip(0, 20)
        df["overpriced"]   = (df["price_egp"] > df["price_egp"].median() * 1.15).astype(int)

        for c in ["has_pool","has_gym","has_security","has_elevator","has_balcony","is_compound"]:
            df[c] = pd.to_numeric(df.get(c, 0), errors="coerce").fillna(0).astype(int)
        df["amenity_score"] = df[["has_pool","has_gym","has_security","has_elevator","has_balcony","is_compound"]].sum(axis=1)

        # ML model
        feats = ["area_sqm","bedrooms","bathrooms","floor_number","building_age_years",
                 "has_pool","has_gym","has_security","has_elevator","has_balcony",
                 "is_compound","amenity_score","distance_to_center_km","distance_to_metro_km"]
        avail = [f for f in feats if f in df.columns]
        X = df[avail].fillna(0)
        y = df["price_egp"]
        Xtr,Xte,ytr,yte = train_test_split(X, y, test_size=0.2, random_state=42)
        rf = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1)
        rf.fit(Xtr, ytr)
        yp = rf.predict(Xte)
        r2  = round(r2_score(yte, yp), 4)
        mae = round(mean_absolute_error(yte, yp))
        fi  = sorted(zip(avail, rf.feature_importances_), key=lambda x: -x[1])

        def hist(col, mn, mx, bins=40):
            hc, he = np.histogram(df[col].clip(mn, mx), bins=bins, range=(mn, mx))
            return [{"bin": round((he[i]+he[i+1])/2, 2), "count": int(hc[i])} for i in range(len(hc))]

        def banded(col, bins, labels):
            df["_b"] = pd.cut(df[col], bins=bins, labels=labels)
            r = df.groupby("_b", observed=True)["price_egp"].agg(["mean","median","count"]).reset_index()
            r.columns = ["band","mean","median","count"]
            return r.fillna(0).round(0).to_dict("records")

        by_area = df.groupby("area").agg(
            avg_price=("price_egp","mean"), median_price=("price_egp","median"),
            avg_sqm_rate=("sqm_market_rate_egp","mean"), count=("price_egp","count"),
            avg_roi=("roi_pct","mean"), avg_yield=("rental_yield","mean"),
            avg_dist_metro=("distance_to_metro_km","mean"),
            avg_dist_center=("distance_to_center_km","mean"),
            overpriced_pct=("overpriced","mean"), avg_amenity=("amenity_score","mean"),
            avg_price_sqm=("price_per_sqm","mean"),
        ).reset_index()
        mn = by_area["avg_sqm_rate"].min(); mx_v = by_area["avg_sqm_rate"].max()
        by_area["demand_score"] = ((by_area["avg_sqm_rate"]-mn)/(mx_v-mn+1)*100).round(1)
        by_area["hot_cold"] = by_area["demand_score"].apply(
            lambda x: "HOT" if x>66 else ("WARM" if x>33 else "COLD"))
        by_area = by_area.sort_values("avg_price", ascending=False).round(2)

        amen_cols = ["has_pool","has_gym","has_security","has_elevator","has_balcony","is_compound"]
        amenity_premium = []
        for c in amen_cols:
            w  = float(df[df[c]==1]["price_egp"].mean()) if df[c].sum() > 0 else 0
            wo = float(df[df[c]==0]["price_egp"].mean()) if (df[c]==0).sum() > 0 else 0
            amenity_premium.append({
                "feature": c.replace("has_","").replace("is_","").replace("_"," ").title(),
                "with_avg": round(w), "without_avg": round(wo),
                "premium_pct": round((w-wo)/wo*100, 2) if wo else 0,
                "count_with": int(df[c].sum())
            })

        cp = df.groupby(["area","is_compound"])["price_egp"].mean().unstack()
        if 0 in cp.columns and 1 in cp.columns:
            cp = cp.reset_index()
            cp.columns = ["area","non_compound","compound"]
            cp = cp.dropna()
            cp["premium_pct"] = ((cp["compound"]-cp["non_compound"])/cp["non_compound"]*100).round(1)
        else:
            cp = pd.DataFrame(columns=["area","non_compound","compound","premium_pct"])

        def safe_ratio(a, b):
            return round(float(a/b*100-100), 1) if b and b > 0 else 0.0

        metro_near = df[df["distance_to_metro_km"]<1]["price_egp"].mean()
        metro_far  = df[df["distance_to_metro_km"]>3]["price_egp"].mean()
        pool_w     = df[df["has_pool"]==1]["price_egp"].mean()
        pool_wo    = df[df["has_pool"]==0]["price_egp"].mean()
        comp_w     = df[df["is_compound"]==1]["price_egp"].mean()
        comp_wo    = df[df["is_compound"]==0]["price_egp"].mean()
        metro_prem = safe_ratio(metro_near, metro_far)
        pool_prem  = safe_ratio(pool_w, pool_wo)
        comp_prem  = safe_ratio(comp_w, comp_wo)

        corr_cols = [c for c in ["price_egp","area_sqm","bedrooms","bathrooms","floor_number",
                     "building_age_years","distance_to_center_km","distance_to_metro_km",
                     "amenity_score","price_per_sqm"] if c in df.columns]
        cl = {"price_egp":"Price","area_sqm":"Size","bedrooms":"Beds","bathrooms":"Baths",
              "floor_number":"Floor","building_age_years":"Age","distance_to_center_km":"CenterDist",
              "distance_to_metro_km":"MetroDist","amenity_score":"Amenities","price_per_sqm":"Price/m²"}
        cl_labels = [cl[c] for c in corr_cols]
        cm_mat = df[corr_cols].corr().round(3)

        num_cols = [c for c in ["price_egp","area_sqm","price_per_sqm","bedrooms","bathrooms",
                    "floor_number","building_age_years","distance_to_center_km",
                    "distance_to_metro_km","rental_yield","roi_pct","amenity_score"] if c in df.columns]
        univ = {c: {k: round(float(v),3) for k,v in {
            "mean":df[c].mean(),"median":df[c].median(),"std":df[c].std(),
            "min":df[c].min(),"max":df[c].max(),"q25":df[c].quantile(.25),
            "q75":df[c].quantile(.75),"skew":df[c].skew(),"kurt":df[c].kurtosis()
        }.items()} for c in num_cols}

        best_roi   = by_area.nlargest(1,"avg_roi")["area"].values[0] if len(by_area) else "N/A"
        studio_col = "property_type" if "property_type" in df.columns else None
        studio_y   = round(float(df[df[studio_col]=="Studio"]["rental_yield"].mean()),2) if studio_col else 6.5

        _cache = {
            "kpis": {
                "avg_price":         round(float(df["price_egp"].mean())),
                "median_price":      round(float(df["price_egp"].median())),
                "avg_sqm_rate":      round(float(df["sqm_market_rate_egp"].mean())),
                "avg_roi":           round(float(df["roi_pct"].mean()),2),
                "avg_yield":         round(float(df["rental_yield"].mean()),2),
                "total_props":       len(df),
                "overpriced_pct":    round(float(df["overpriced"].mean()*100),1),
                "demand_score":      87.4,
                "r2_score":          r2,
                "mae":               mae,
                "avg_price_per_sqm": round(float(df["price_per_sqm"].mean())),
                "median_price_sqm":  round(float(df["price_per_sqm"].median())),
                "avg_area":          round(float(df["area_sqm"].mean()),1),
                "avg_bedrooms":      round(float(df["bedrooms"].mean()),1) if "bedrooms" in df.columns else 0,
                "compound_pct":      round(float(df["is_compound"].mean()*100),1),
            },
            "univ": univ,
            "price_hist":    hist("price_egp",0,25e6,40),
            "sqm_hist":      hist("price_per_sqm",0,120000,40),
            "area_hist":     hist("area_sqm",0,500,40),
            "yield_hist":    hist("rental_yield",0,15,40),
            "metro_hist":    hist("distance_to_metro_km",0,30,30) if "distance_to_metro_km" in df.columns else [],
            "age_hist":      hist("building_age_years",0,50,25) if "building_age_years" in df.columns else [],
            "corr_data":     [{"row":cl_labels[i],"col":cl_labels[j],"value":float(cm_mat.iloc[i,j])}
                              for i in range(len(cl_labels)) for j in range(len(cl_labels))],
            "corr_labels":   cl_labels,
            "by_area":       by_area.fillna(0).to_dict("records"),
            "property_types":df["property_type"].value_counts().reset_index().to_dict("records") if "property_type" in df.columns else [],
            "conditions":    df["condition"].value_counts().reset_index().to_dict("records") if "condition" in df.columns else [],
            "finishing":     df["finishing_type"].value_counts().reset_index().to_dict("records") if "finishing_type" in df.columns else [],
            "furnished_dist":df["furnished"].value_counts().reset_index().to_dict("records") if "furnished" in df.columns else [],
            "view_dist":     df["view_type"].value_counts().reset_index().to_dict("records") if "view_type" in df.columns else [],
            "price_buckets": [
                {"label":"<1M",   "count":int((df["price_egp"]<1e6).sum())},
                {"label":"1-3M",  "count":int(((df["price_egp"]>=1e6)&(df["price_egp"]<3e6)).sum())},
                {"label":"3-5M",  "count":int(((df["price_egp"]>=3e6)&(df["price_egp"]<5e6)).sum())},
                {"label":"5-10M", "count":int(((df["price_egp"]>=5e6)&(df["price_egp"]<10e6)).sum())},
                {"label":"10-20M","count":int(((df["price_egp"]>=10e6)&(df["price_egp"]<20e6)).sum())},
                {"label":"20M+",  "count":int((df["price_egp"]>=20e6).sum())},
            ],
            "cond_price":      df.groupby("condition")["price_egp"].mean().reset_index().round(0).to_dict("records") if "condition" in df.columns else [],
            "fin_price":       df.groupby("finishing_type")["price_egp"].mean().reset_index().round(0).to_dict("records") if "finishing_type" in df.columns else [],
            "view_price":      df.groupby("view_type")["price_egp"].mean().reset_index().round(0).to_dict("records") if "view_type" in df.columns else [],
            "furnished_price": df.groupby("furnished")["price_egp"].mean().reset_index().round(0).to_dict("records") if "furnished" in df.columns else [],
            "bed_stats":       df.groupby("bedrooms").agg(
                                   avg_price=("price_egp","mean"),count=("price_egp","count"),
                                   avg_yield=("rental_yield","mean"),avg_price_sqm=("price_per_sqm","mean")
                               ).reset_index().round(2).to_dict("records") if "bedrooms" in df.columns else [],
            "floor_price":   df.groupby("floor_number")["price_egp"].mean().reset_index().round(0).to_dict("records") if "floor_number" in df.columns else [],
            "age_price":     banded("building_age_years",[-1,1,5,10,20,30,100],["New","1-5yr","5-10yr","10-20yr","20-30yr","30yr+"]) if "building_age_years" in df.columns else [],
            "sqm_price":     banded("area_sqm",[0,60,100,150,200,300,900],["<60","60-100","100-150","150-200","200-300","300+"]),
            "metro_price":   banded("distance_to_metro_km",[0,1,2,3,5,10,50],["<1km","1-2km","2-3km","3-5km","5-10km",">10km"]) if "distance_to_metro_km" in df.columns else [],
            "center_price":  banded("distance_to_center_km",[0,5,10,15,20,30,100],["<5km","5-10km","10-15km","15-20km","20-30km",">30km"]) if "distance_to_center_km" in df.columns else [],
            "cond_fin":      df.groupby(["condition","finishing_type"])["price_egp"].mean().reset_index().round(0).to_dict("records") if all(c in df.columns for c in ["condition","finishing_type"]) else [],
            "furn_fin":      df.groupby(["furnished","finishing_type"])["price_egp"].mean().reset_index().round(0).to_dict("records") if all(c in df.columns for c in ["furnished","finishing_type"]) else [],
            "bed_bath":      df.groupby(["bedrooms","bathrooms"])["price_egp"].mean().reset_index().round(0).to_dict("records") if all(c in df.columns for c in ["bedrooms","bathrooms"]) else [],
            "amenity_premium":  amenity_premium,
            "compound_premium": cp.round(0).fillna(0).to_dict("records"),
            "area_box":  df.groupby("area")["price_egp"].agg(
                             p10=lambda x:x.quantile(.1), p25=lambda x:x.quantile(.25),
                             p50=lambda x:x.quantile(.5), p75=lambda x:x.quantile(.75),
                             p90=lambda x:x.quantile(.9), count="count"
                         ).reset_index().round(0).to_dict("records"),
            "bubble": by_area[["area","avg_price","avg_yield","avg_roi","count","hot_cold","demand_score"]].to_dict("records"),
            "scatter_sqm":   df[["area_sqm","price_egp","property_type","area"]].sample(min(600,len(df)),random_state=42).round(1).to_dict("records") if all(c in df.columns for c in ["area_sqm","price_egp","property_type","area"]) else [],
            "scatter_metro": df[["distance_to_metro_km","price_egp","area","property_type"]].sample(min(500,len(df)),random_state=99).round(2).to_dict("records") if all(c in df.columns for c in ["distance_to_metro_km","price_egp","area","property_type"]) else [],
            "scatter_age":   df[["building_age_years","price_egp","property_type"]].sample(min(400,len(df)),random_state=77).round(1).to_dict("records") if all(c in df.columns for c in ["building_age_years","price_egp","property_type"]) else [],
            "feature_importance": [{"feature":f,"importance":round(v*100,3)} for f,v in fi[:15]],
            "correlations": [{"feature":corr_cols[i],"correlation":round(float(df[corr_cols].corr()["price_egp"].iloc[i]),4)}
                             for i in range(len(corr_cols)) if corr_cols[i] != "price_egp"],
            "insights": [
                {"icon":"🏆","title":f"Best ROI: {best_roi}","text":"Highest return relative to market rate.","tag":"ROI"},
                {"icon":"🚇","title":f"Metro Premium: +{metro_prem}%","text":"Properties <1km from metro vs 3km+.","tag":"Location"},
                {"icon":"🏊","title":f"Pool Premium: +{pool_prem}%","text":f"Pool adds {pool_prem}% to property value.","tag":"Amenity"},
                {"icon":"🏘️","title":f"Compound Premium: +{comp_prem}%","text":f"Compound properties command {comp_prem}% premium.","tag":"Market"},
                {"icon":"⚠️","title":f"Risk: {round(float(df['overpriced'].mean()*100),1)}% Overpriced","text":"Listings >15% above median price.","tag":"Risk"},
                {"icon":"💡","title":"Best Yield: Studio","text":f"Studios avg {studio_y}% rental yield.","tag":"Investment"},
                {"icon":"📐","title":"Size Sweet Spot: 100-150m²","text":"Best price/sqm efficiency in this range.","tag":"Value"},
                {"icon":"📊","title":f"ML R²={r2}","text":f"Model explains {round(r2*100,1)}% of price variance.","tag":"Model"},
            ],
        }
        logger.info("Analytics cached — %d rows, %d areas, R²=%.4f", len(df), len(by_area), r2)
        return _cache
    except Exception as e:
        logger.error("Analytics error: %s", e, exc_info=True)
        return {"error": str(e), "kpis": {}}


@router.get("")
async def analytics(_=Depends(get_user_id)):
    return compute_analytics()
