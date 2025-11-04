-- Add model version v2.1 calibrated ensemble
INSERT INTO ml_model_versions (model_type, version, is_active, metrics, metadata)
VALUES (
  'ensemble_statistical_v2.1',
  'v2.1-calibrated',
  true,
  '{"target_confidence": 80, "sub_models": ["linear_factor", "regional_market_index", "outlier_correction"], "weights": [0.40, 0.35, 0.25], "confidence_formula": "base + (dataCoverage * 0.25) + (inputCompleteness * 0.35) + (consistencyScore * 0.40)"}'::jsonb,
  '{"description": "Calibrated statistical ensemble with 3 sub-models: Linear Factor (weighted averages), Regional Market Index (cost-of-living), and Outlier Correction (median normalization). Enhanced confidence formula targets 70-95% range with 80%+ average.", "features": ["linear_factor_model", "regional_market_index", "outlier_correction", "input_completeness_scoring", "consistency_validation", "advanced_confidence_calibration"], "education_scale": {"certificate": 0.8, "diploma": 1.0, "bachelor": 1.2, "masters": 1.4, "phd": 1.6}}'::jsonb
);

-- Deactivate v2.0 model
UPDATE ml_model_versions 
SET is_active = false 
WHERE model_type = 'ensemble_statistical_v2';