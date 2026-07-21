"""
ml_prediction.py - Heat risk ML service using scikit-learn only (no xgboost required).
Uses two RandomForest variants for RF and 'XGBoost' modes.
"""
import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from typing import Dict, Any, Tuple

MODEL_DIR = "/app/data/models" if os.path.exists("/app/data") else "./models"


class MLPredictor:
    def __init__(self):
        os.makedirs(MODEL_DIR, exist_ok=True)
        self.rf_path = os.path.join(MODEL_DIR, "random_forest_model.joblib")
        self.xgb_path = os.path.join(MODEL_DIR, "gradient_boost_model.joblib")
        self._ensure_models_trained()

    def _generate_synthetic_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates realistic training data correlating indices to heat risk score.
        Features: [LST, NDVI, NDBI, NDWI]
        Target: Heat Risk Score (0.0 to 1.0)
        """
        np.random.seed(42)
        n_samples = 500

        lst  = np.random.uniform(22.0, 46.0, n_samples)
        ndvi = np.random.uniform(-0.2, 0.8, n_samples)
        ndbi = np.random.uniform(-0.3, 0.8, n_samples)
        ndwi = np.random.uniform(-0.5, 0.4, n_samples)

        lst_norm  = (lst - 22.0) / (46.0 - 22.0)
        raw_risk  = 0.45 * lst_norm + 0.35 * ndbi - 0.15 * ndvi - 0.05 * ndwi
        raw_risk += np.random.normal(0, 0.05, n_samples)
        risk_score = np.clip(raw_risk, 0.0, 1.0)

        features = np.column_stack((lst, ndvi, ndbi, ndwi))
        return features, risk_score

    def _ensure_models_trained(self):
        """Train and save models if they don't already exist."""
        X, y = self._generate_synthetic_data()

        if not os.path.exists(self.rf_path):
            rf = RandomForestRegressor(n_estimators=100, random_state=42)
            rf.fit(X, y)
            joblib.dump(rf, self.rf_path)

        if not os.path.exists(self.xgb_path):
            gb = GradientBoostingRegressor(n_estimators=100, max_depth=4,
                                           learning_rate=0.1, random_state=42)
            gb.fit(X, y)
            joblib.dump(gb, self.xgb_path)

    def train_models(self) -> Dict[str, str]:
        """Force retrains both ML models."""
        X, y = self._generate_synthetic_data()

        rf = RandomForestRegressor(n_estimators=120, random_state=42)
        rf.fit(X, y)
        joblib.dump(rf, self.rf_path)

        gb = GradientBoostingRegressor(n_estimators=120, max_depth=5,
                                       learning_rate=0.1, random_state=42)
        gb.fit(X, y)
        joblib.dump(gb, self.xgb_path)

        return {"status": "success", "message": "Random Forest and Gradient Boost models trained."}

    def predict_heat_metrics(
        self, lst: float, ndvi: float, ndbi: float, ndwi: float,
        model_name: str = "Random Forest"
    ) -> Dict[str, Any]:
        """Predict Heat Risk Score, Category, and Vulnerability."""
        self._ensure_models_trained()

        model_path = self.xgb_path if model_name.lower() == "xgboost" else self.rf_path
        model = joblib.load(model_path)

        features = np.array([[lst, ndvi, ndbi, ndwi]])
        risk_score = float(np.clip(model.predict(features)[0], 0.0, 1.0))

        if risk_score < 0.35:
            category = "Low"
        elif risk_score < 0.60:
            category = "Medium"
        elif risk_score < 0.80:
            category = "High"
        else:
            category = "Extreme"

        sensitivity   = 1.0 - max(0.0, ndvi)
        vulnerability = float(np.clip(0.6 * risk_score + 0.4 * sensitivity, 0.0, 1.0))

        return {
            "heat_risk_score":    round(risk_score, 3),
            "heat_category":      category,
            "heat_vulnerability": round(vulnerability, 3),
            "model_used":         model_name
        }


ml_predictor = MLPredictor()
