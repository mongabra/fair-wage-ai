-- Add model version for ensemble statistical v2
INSERT INTO ml_model_versions (model_type, version, is_active, metrics, metadata)
VALUES (
  'ensemble_statistical_v2',
  'v2.0-ensemble',
  true,
  '{"target_confidence": 80, "methods": ["multiplicative", "career_indexed", "hybrid_dampened"], "weights": [0.60, 0.25, 0.15]}'::jsonb,
  '{"description": "Enhanced statistical ensemble model with multi-factor weighting, career indexing, location tier analysis, and calibrated confidence scoring", "features": ["job_normalization", "career_index", "location_tiers", "education_weighting", "experience_curve", "ensemble_prediction", "confidence_calibration"]}'::jsonb
);

-- Deactivate old model version
UPDATE ml_model_versions 
SET is_active = false 
WHERE model_type != 'ensemble_statistical_v2';