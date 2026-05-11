"""
housing_model_code.py
=====================
Reconstructed training code for housing_model.pkl

Model: sklearn HistGradientBoostingRegressor
Extracted by inspecting the pickle binary (pickletools) since the
original 'core' module that wrapped the saved dict is unavailable.

All hyperparameters, feature names, monotonic constraints, and
categorical feature flags have been recovered from the serialized
object state.
"""

import numpy as np
import pandas as pd
import pickle
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score


# ─────────────────────────────────────────────
# 1.  RAW INPUT FEATURES (32 total)
# ─────────────────────────────────────────────
# These are the features that must be present in X before calling
# the model. The model was trained with exactly 32 input features
# (n_features_in_ = 32).

RAW_FEATURES = [
    # --- structural ---
    "bedrooms",
    "bathrooms",
    "has_pool",
    "has_gym",
    "has_security",
    "has_elevator",
    "has_balcony",
    "is_compound",
    "parking_spaces",
    "garden_sqm",
    "floor_number",
    "building_age_years",
    "floor_to_ceiling_height_m",
    "distance_to_center_km",
    "distance_to_metro_km",
    # (area-derived and encoded features are engineered below)
]

# Full ordered feature list fed to the model (32 features)
MODEL_FEATURES = [
    # Area features
    "area",
    "log_area",
    "area_sq",
    # Room features
    "bedrooms",
    "bathrooms",
    "bed_bath",          # engineered: bedrooms * bathrooms
    "total_rooms",       # engineered: bedrooms + bathrooms
    "bath_ratio",        # engineered: bathrooms / total_rooms
    "area_per_bed",      # engineered: area / bedrooms
    # Encoded categorical quality features
    "condition_enc",
    "finishing_enc",
    "furnished_enc",
    "view_enc",
    # Boolean amenity flags (0/1)
    "has_pool",
    "has_gym",
    "has_security",
    "has_elevator",
    "has_balcony",
    "is_compound",
    # Composite amenity / continuous physical features
    "amenity_score",
    "parking_spaces",
    "garden_sqm",
    "floor_number",
    "building_age_years",
    "age_sq",            # engineered: building_age_years ** 2
    "new_building",      # engineered: 1 if building_age_years == 0
    "floor_to_ceiling_height_m",
    # Location features
    "distance_to_center_km",
    "distance_to_metro_km",
    "luxury_flag",       # engineered: binary luxury indicator
    "location_enc",      # ordinal/target-encoded location
    "title_enc",         # ordinal/target-encoded listing title
]

# ─────────────────────────────────────────────
# 2.  FEATURE ENGINEERING
# ─────────────────────────────────────────────

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create all derived features from raw columns.
    Input df must contain at minimum: area, bedrooms, bathrooms,
    building_age_years, and the raw flag / encoded columns.
    """
    df = df.copy()

    # Area transforms
    df["log_area"]  = np.log1p(df["area"])
    df["area_sq"]   = df["area"] ** 2

    # Room interactions
    df["bed_bath"]    = df["bedrooms"] * df["bathrooms"]
    df["total_rooms"] = df["bedrooms"] + df["bathrooms"]
    df["bath_ratio"]  = df["bathrooms"] / df["total_rooms"].replace(0, np.nan)
    df["area_per_bed"] = df["area"] / df["bedrooms"].replace(0, np.nan)

    # Age features
    df["age_sq"]       = df["building_age_years"] ** 2
    df["new_building"] = (df["building_age_years"] == 0).astype(int)

    return df[MODEL_FEATURES]


# ─────────────────────────────────────────────
# 3.  MONOTONIC CONSTRAINTS
# ─────────────────────────────────────────────
# Values: 1 = monotone increasing, 0 = unconstrained, -1 = decreasing
# Recovered from monotonic_cst dict in the pickle.

MONOTONIC_CST = {
    "area":                    1,   # bigger → higher price
    "log_area":                1,
    "area_sq":                 1,
    "bedrooms":                1,
    "bathrooms":               1,
    "bed_bath":                1,
    "total_rooms":             1,
    "bath_ratio":              0,   # unconstrained
    "area_per_bed":            0,
    "condition_enc":           1,
    "finishing_enc":           1,
    "furnished_enc":           1,
    "view_enc":                0,
    "has_pool":                0,
    "has_gym":                 0,
    "has_security":            0,
    "has_elevator":            0,
    "has_balcony":             0,
    "is_compound":             0,
    "amenity_score":           1,
    "parking_spaces":          1,
    "garden_sqm":              1,
    "floor_number":            0,
    "building_age_years":      0,
    "age_sq":                  0,
    "new_building":            1,
    "floor_to_ceiling_height_m": 1,
    "distance_to_center_km":   0,
    "distance_to_metro_km":    0,
    "luxury_flag":             1,
    "location_enc":            0,
    "title_enc":               0,
}

# ─────────────────────────────────────────────
# 4.  CATEGORICAL FEATURES
# ─────────────────────────────────────────────
# Passed to HistGradientBoostingRegressor as categorical_features.
# These are treated as unordered categories by the internal binner.

CATEGORICAL_FEATURES = [
    "bedrooms",
    "bathrooms",
    "has_pool",
    "has_gym",
    "has_security",
    "has_elevator",
    "has_balcony",
    "is_compound",
    "parking_spaces",
    "garden_sqm",
    "floor_number",
    "building_age_years",
    "floor_to_ceiling_height_m",
    "distance_to_center_km",
    "distance_to_metro_km",
]


# ─────────────────────────────────────────────
# 5.  MODEL DEFINITION & HYPERPARAMETERS
# ─────────────────────────────────────────────

def build_model() -> HistGradientBoostingRegressor:
    """
    Returns an untrained HistGradientBoostingRegressor configured
    with the exact hyperparameters recovered from the pickle file.
    """
    return HistGradientBoostingRegressor(
        # Loss & objective
        loss               = "squared_error",   # standard MSE regression

        # Boosting parameters
        learning_rate      = 0.03,              # slow learning rate → needs more trees
        max_iter           = 800,               # 800 boosting rounds

        # Tree structure
        max_leaf_nodes     = 127,               # 2^7 - 1 (full depth-7 tree)
        max_depth          = 8,
        min_samples_leaf   = 8,

        # Regularisation
        l2_regularization  = 0.1,

        # Feature sampling
        max_features       = 1.0,              # use all features each split

        # Binning
        max_bins           = 255,

        # Monotonic constraints (per-feature dict)
        monotonic_cst      = MONOTONIC_CST,

        # Categorical features
        categorical_features = CATEGORICAL_FEATURES,

        # Early stopping (auto mode — triggers if a validation set is detected)
        early_stopping     = "auto",
        validation_fraction = 0.1,
        n_iter_no_change   = 10,
        tol                = 1e-7,
        scoring            = None,             # defaults to loss

        # Misc
        warm_start         = False,
        verbose            = 0,
        random_state       = 42,
    )


# ─────────────────────────────────────────────
# 6.  TRAINING PIPELINE
# ─────────────────────────────────────────────

def train(df: pd.DataFrame, target_col: str = "price") -> HistGradientBoostingRegressor:
    """
    Full training pipeline:
      1. Engineer features
      2. Split train / test (80/20)
      3. Build and fit the model
      4. Print evaluation metrics
      5. Return the fitted model

    Parameters
    ----------
    df         : raw DataFrame with all input columns
    target_col : name of the price / label column (default 'price')
    """
    y = df[target_col].values
    X = engineer_features(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = build_model()
    model.fit(X_train, y_train)

    # ── Evaluation ──
    y_pred = model.predict(X_test)
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)
    print(f"Test MAE : {mae:,.0f}")
    print(f"Test R²  : {r2:.4f}")
    print(f"Iterations used: {model.n_iter_}")

    return model


# ─────────────────────────────────────────────
# 7.  SAVE / LOAD HELPERS
# ─────────────────────────────────────────────

def save_model(model: HistGradientBoostingRegressor, path: str = "housing_model.pkl"):
    """Save the fitted model. Mirrors the dict-wrapper found in the original pkl."""
    with open(path, "wb") as f:
        pickle.dump({"model": model}, f)
    print(f"Saved → {path}")


def load_model(path: str = "housing_model.pkl") -> HistGradientBoostingRegressor:
    obj = pickle.load(open(path, "rb"))
    # The original pickle wraps the model in a dict under key "model"
    if isinstance(obj, dict) and "model" in obj:
        return obj["model"]
    return obj          # fallback: bare model


# ─────────────────────────────────────────────
# 8.  INFERENCE HELPER
# ─────────────────────────────────────────────

def predict(model, raw_df: pd.DataFrame) -> np.ndarray:
    """Run end-to-end inference: engineer features then predict."""
    X = engineer_features(raw_df)
    return model.predict(X)


# ─────────────────────────────────────────────
# QUICK SMOKE-TEST  (remove before production)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import os

    pkl_path = "housing_model.pkl"
    if os.path.exists(pkl_path):
        print("Loading existing model …")
        model = load_model(pkl_path)
        print("Model loaded:", model)
        print("n_iter_:", getattr(model, "n_iter_", "N/A"))
    else:
        print("No pkl found. Generate synthetic data and train …")
        np.random.seed(42)
        n = 5000
        synthetic = pd.DataFrame({
            "area":                    np.random.uniform(50, 500, n),
            "bedrooms":                np.random.randint(1, 8, n),
            "bathrooms":               np.random.randint(1, 5, n),
            "condition_enc":           np.random.randint(1, 5, n),
            "finishing_enc":           np.random.randint(1, 4, n),
            "furnished_enc":           np.random.randint(0, 3, n),
            "view_enc":                np.random.randint(0, 4, n),
            "has_pool":                np.random.randint(0, 2, n),
            "has_gym":                 np.random.randint(0, 2, n),
            "has_security":            np.random.randint(0, 2, n),
            "has_elevator":            np.random.randint(0, 2, n),
            "has_balcony":             np.random.randint(0, 2, n),
            "is_compound":             np.random.randint(0, 2, n),
            "amenity_score":           np.random.randint(0, 10, n),
            "parking_spaces":          np.random.randint(0, 4, n),
            "garden_sqm":              np.random.uniform(0, 200, n),
            "floor_number":            np.random.randint(0, 20, n),
            "building_age_years":      np.random.randint(0, 40, n),
            "floor_to_ceiling_height_m": np.random.uniform(2.5, 4.5, n),
            "distance_to_center_km":   np.random.uniform(0.5, 30, n),
            "distance_to_metro_km":    np.random.uniform(0.1, 10, n),
            "luxury_flag":             np.random.randint(0, 2, n),
            "location_enc":            np.random.randint(0, 50, n),
            "title_enc":               np.random.randint(0, 100, n),
            "price":                   np.random.uniform(300_000, 10_000_000, n),
        })
        model = train(synthetic, target_col="price")
        save_model(model)
