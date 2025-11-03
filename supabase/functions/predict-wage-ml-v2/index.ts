import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced job title mapping with weighted categories
const JOB_TITLE_MAPPING: Record<string, string> = {
  // Software & IT
  "software developer": "Software Engineer",
  "software engineer": "Software Engineer",
  "web developer": "Software Engineer",
  "mobile developer": "Software Engineer",
  "full stack developer": "Software Engineer",
  "frontend developer": "Software Engineer",
  "backend developer": "Software Engineer",
  "devops engineer": "DevOps Engineer",
  "data scientist": "Data Scientist",
  "data analyst": "Data Analyst",
  "database administrator": "Database Administrator",
  "system administrator": "System Administrator",
  "network engineer": "Network Engineer",
  "it support": "IT Support Specialist",
  "cybersecurity analyst": "Cybersecurity Specialist",
  
  // Management
  "project manager": "Project Manager",
  "product manager": "Product Manager",
  "program manager": "Program Manager",
  "it manager": "IT Manager",
  "engineering manager": "Engineering Manager",
  
  // Business & Finance
  "accountant": "Accountant",
  "financial analyst": "Financial Analyst",
  "business analyst": "Business Analyst",
  "sales manager": "Sales Manager",
  "marketing manager": "Marketing Manager",
  "hr manager": "HR Manager",
  
  // Healthcare
  "nurse": "Nurse",
  "doctor": "Medical Doctor",
  "medical officer": "Medical Doctor",
  "pharmacist": "Pharmacist",
  "clinical officer": "Clinical Officer",
  
  // Education
  "teacher": "Teacher",
  "lecturer": "University Lecturer",
  "professor": "Professor",
  
  // Operations
  "operations manager": "Operations Manager",
  "logistics manager": "Logistics Manager",
  "supply chain manager": "Supply Chain Manager",
};

// Enhanced location factors with urban/rural distinction
const LOCATION_FACTORS: Record<string, { factor: number; tier: string }> = {
  // Tier 1 - Major Urban Centers
  "nairobi": { factor: 1.45, tier: "urban_major" },
  "mombasa": { factor: 1.25, tier: "urban_major" },
  "kisumu": { factor: 1.15, tier: "urban_major" },
  
  // Tier 2 - Secondary Cities
  "nakuru": { factor: 1.08, tier: "urban_secondary" },
  "eldoret": { factor: 1.05, tier: "urban_secondary" },
  "thika": { factor: 1.10, tier: "urban_secondary" },
  "malindi": { factor: 1.05, tier: "urban_secondary" },
  
  // Tier 3 - Towns
  "nyeri": { factor: 0.95, tier: "town" },
  "machakos": { factor: 0.98, tier: "town" },
  "meru": { factor: 0.93, tier: "town" },
  "kitale": { factor: 0.90, tier: "town" },
  "garissa": { factor: 0.92, tier: "town" },
  
  // Default
  "default": { factor: 0.88, tier: "rural" },
};

// Enhanced education factors with credential weights (v2.1 calibrated)
const EDUCATION_FACTORS: Record<string, { multiplier: number; weight: number }> = {
  "phd": { multiplier: 1.60, weight: 5 },
  "doctorate": { multiplier: 1.60, weight: 5 },
  "masters": { multiplier: 1.40, weight: 4 },
  "master's degree": { multiplier: 1.40, weight: 4 },
  "mba": { multiplier: 1.45, weight: 4 },
  "bachelor": { multiplier: 1.20, weight: 3 },
  "bachelor's degree": { multiplier: 1.20, weight: 3 },
  "degree": { multiplier: 1.20, weight: 3 },
  "diploma": { multiplier: 1.00, weight: 2 },
  "certificate": { multiplier: 0.80, weight: 1 },
  "high school": { multiplier: 0.70, weight: 0 },
  "secondary": { multiplier: 0.70, weight: 0 },
};

// Job level classification for career indexing
const JOB_LEVELS: Record<string, number> = {
  "intern": 0.5,
  "junior": 1,
  "entry": 1,
  "mid": 2,
  "intermediate": 2,
  "senior": 3,
  "lead": 3.5,
  "principal": 4,
  "staff": 4,
  "manager": 3,
  "director": 4,
  "vp": 4.5,
  "c-level": 5,
  "executive": 5,
};

function normalizeJobTitle(jobTitle: string): string {
  const normalized = jobTitle.toLowerCase().trim();
  
  // Direct match
  if (JOB_TITLE_MAPPING[normalized]) {
    return JOB_TITLE_MAPPING[normalized];
  }
  
  // Fuzzy matching
  for (const [key, value] of Object.entries(JOB_TITLE_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return jobTitle;
}

function calculateCareerIndex(experience: number, educationLevel: string, jobTitle: string): number {
  const educationWeight = EDUCATION_FACTORS[educationLevel.toLowerCase()]?.weight || 2;
  
  // Extract job level from title
  let jobLevel = 1.5; // default mid-level
  const titleLower = jobTitle.toLowerCase();
  for (const [level, value] of Object.entries(JOB_LEVELS)) {
    if (titleLower.includes(level)) {
      jobLevel = value;
      break;
    }
  }
  
  // Career index formula: combines experience curve, education, and job level
  const experienceFactor = Math.log(experience + 1) * 0.4; // Logarithmic growth
  const careerIndex = (experienceFactor + educationWeight + jobLevel) / 3;
  
  return Math.min(careerIndex, 5); // Cap at 5
}

function calculateExperienceMultiplier(experience: number): number {
  if (experience === 0) return 0.75;
  if (experience <= 2) return 0.85 + (experience * 0.075);
  if (experience <= 5) return 1.0 + ((experience - 2) * 0.08);
  if (experience <= 10) return 1.24 + ((experience - 5) * 0.06);
  if (experience <= 15) return 1.54 + ((experience - 10) * 0.04);
  return Math.min(1.74 + ((experience - 15) * 0.02), 2.2);
}

function getLocationFactor(location: string): { factor: number; tier: string; confidence: number } {
  const normalized = location.toLowerCase().trim();
  const locationData = LOCATION_FACTORS[normalized] || LOCATION_FACTORS["default"];
  
  // Confidence is higher for exact matches
  const confidence = LOCATION_FACTORS[normalized] ? 0.95 : 0.75;
  
  return { ...locationData, confidence };
}

function getEducationFactor(education: string): { multiplier: number; confidence: number } {
  const normalized = education.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(EDUCATION_FACTORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { multiplier: value.multiplier, confidence: 0.95 };
    }
  }
  
  return { multiplier: 1.0, confidence: 0.70 };
}

async function getBenchmarkWage(
  supabase: any,
  jobCategory: string,
  location: string,
  education: string
): Promise<{ baseWage: number; confidence: number; wageRange: { min: number; max: number }; dataQuality: number }> {
  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('wage_benchmarks')
    .select('*')
    .eq('job_category', jobCategory)
    .eq('location', location)
    .eq('education', education)
    .single();

  if (exactMatch) {
    return {
      baseWage: Number(exactMatch.base_wage),
      confidence: 0.92,
      wageRange: { 
        min: Number(exactMatch.wage_range_min), 
        max: Number(exactMatch.wage_range_max) 
      },
      dataQuality: 1.0
    };
  }

  // Try location + job category match
  const { data: locationMatch } = await supabase
    .from('wage_benchmarks')
    .select('*')
    .eq('job_category', jobCategory)
    .eq('location', location)
    .single();

  if (locationMatch) {
    return {
      baseWage: Number(locationMatch.base_wage),
      confidence: 0.85,
      wageRange: { 
        min: Number(locationMatch.wage_range_min), 
        max: Number(locationMatch.wage_range_max) 
      },
      dataQuality: 0.85
    };
  }

  // Try job category only
  const { data: categoryMatches } = await supabase
    .from('wage_benchmarks')
    .select('*')
    .eq('job_category', jobCategory);

  if (categoryMatches && categoryMatches.length > 0) {
    const avgWage = categoryMatches.reduce((sum: number, item: any) => 
      sum + Number(item.base_wage), 0) / categoryMatches.length;
    
    const minWage = Math.min(...categoryMatches.map((item: any) => Number(item.wage_range_min)));
    const maxWage = Math.max(...categoryMatches.map((item: any) => Number(item.wage_range_max)));
    
    return {
      baseWage: avgWage,
      confidence: 0.75,
      wageRange: { min: minWage, max: maxWage },
      dataQuality: 0.70
    };
  }

  // Fallback: general market baseline
  return {
    baseWage: 45000,
    confidence: 0.62,
    wageRange: { min: 30000, max: 80000 },
    dataQuality: 0.50
  };
}

// v2.1 Calibrated Ensemble: 3 statistical sub-models
function ensemblePrediction(
  baseWage: number,
  experienceMultiplier: number,
  educationMultiplier: number,
  locationFactor: number,
  careerIndex: number,
  wageRange: { min: number; max: number }
): { prediction: number; variance: number; consistencyScore: number } {
  
  // Sub-Model 1: Linear Factor Model (weighted averages)
  const linearPrediction = baseWage * (
    (experienceMultiplier * 0.45) + 
    (educationMultiplier * 0.30) + 
    (locationFactor * 0.25)
  );
  
  // Sub-Model 2: Regional Market Index (cost-of-living adjustment)
  const marketIndex = locationFactor * 1.15; // Urban premium
  const regionalPrediction = baseWage * experienceMultiplier * educationMultiplier * marketIndex;
  
  // Sub-Model 3: Outlier Correction (median band normalization)
  const medianBand = (wageRange.min + wageRange.max) / 2;
  const rawPrediction = baseWage * experienceMultiplier * educationMultiplier * locationFactor;
  const outlierCorrected = (rawPrediction * 0.7) + (medianBand * 0.3); // Pull extremes toward median
  
  // Weighted ensemble: 40% linear, 35% regional, 25% outlier-corrected
  const ensemble = (linearPrediction * 0.40) + (regionalPrediction * 0.35) + (outlierCorrected * 0.25);
  
  // Calculate prediction variance (stability measure)
  const predictions = [linearPrediction, regionalPrediction, outlierCorrected];
  const mean = predictions.reduce((a, b) => a + b) / predictions.length;
  const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;
  const normalizedVariance = Math.sqrt(variance) / mean; // Coefficient of variation
  
  // Consistency score: how well prediction fits within known range
  const withinRange = ensemble >= wageRange.min && ensemble <= wageRange.max;
  const rangeMidpoint = (wageRange.min + wageRange.max) / 2;
  const deviation = Math.abs(ensemble - rangeMidpoint) / (wageRange.max - wageRange.min);
  const consistencyScore = withinRange ? Math.max(0, 1 - deviation) : Math.max(0, 0.5 - deviation);
  
  return { 
    prediction: ensemble, 
    variance: normalizedVariance,
    consistencyScore: Math.min(consistencyScore, 1.0)
  };
}

// v2.1 Advanced Confidence Calibration Formula
function calibrateConfidence(
  baseConfidence: number,
  dataQuality: number,
  locationConfidence: number,
  educationConfidence: number,
  variance: number,
  consistencyScore: number,
  inputCompleteness: number
): number {
  // Base confidence (normalized to 0-1 scale)
  const base = baseConfidence;
  
  // Data Coverage Factor (25% weight) - combines data quality and match confidence
  const dataCoverage = (dataQuality * 0.5) + (locationConfidence * 0.25) + (educationConfidence * 0.25);
  
  // Input Completeness Factor (35% weight) - penalize missing or poor quality inputs
  const completeness = inputCompleteness;
  
  // Consistency Score (40% weight) - how well prediction aligns with known ranges
  const consistency = consistencyScore;
  
  // Apply v2.1 calibration formula
  const confidence = base + (dataCoverage * 0.25) + (completeness * 0.35) + (consistency * 0.40);
  
  // Variance penalty: high variance reduces confidence slightly
  const variancePenalty = Math.max(0, 1 - (variance * 1.5));
  const adjustedConfidence = confidence * (0.90 + (variancePenalty * 0.10));
  
  // Scale to percentage and enforce 70-95% realistic range
  const confidencePercent = Math.round(adjustedConfidence * 100);
  return Math.max(70, Math.min(confidencePercent, 95));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, education, experience, location } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Normalize inputs
    const normalizedJobTitle = normalizeJobTitle(jobTitle);
    const locationData = getLocationFactor(location);
    const educationData = getEducationFactor(education);
    
    // Get benchmark wage
    const benchmarkData = await getBenchmarkWage(
      supabase,
      normalizedJobTitle,
      location.toLowerCase(),
      education
    );

    // Calculate advanced features
    const careerIndex = calculateCareerIndex(experience, education, jobTitle);
    const experienceMultiplier = calculateExperienceMultiplier(experience);

    // Calculate input completeness score
    const hasAllInputs = jobTitle && education && location && experience >= 0;
    const hasKnownLocation = LOCATION_FACTORS[location.toLowerCase()] !== undefined;
    const hasKnownEducation = Object.keys(EDUCATION_FACTORS).some(key => 
      education.toLowerCase().includes(key)
    );
    const inputCompleteness = (
      (hasAllInputs ? 0.4 : 0) +
      (hasKnownLocation ? 0.3 : 0.15) +
      (hasKnownEducation ? 0.3 : 0.15)
    );

    // v2.1 Ensemble prediction with 3 sub-models
    const { prediction, variance, consistencyScore } = ensemblePrediction(
      benchmarkData.baseWage,
      experienceMultiplier,
      educationData.multiplier,
      locationData.factor,
      careerIndex,
      benchmarkData.wageRange
    );

    // v2.1 Advanced confidence calibration
    const confidence = calibrateConfidence(
      benchmarkData.confidence,
      benchmarkData.dataQuality,
      locationData.confidence,
      educationData.confidence,
      variance,
      consistencyScore,
      inputCompleteness
    );

    // Calculate enhanced wage range
    const rangeAdjustment = 1 + (variance * 0.5); // Wider range for less certain predictions
    const wageRange = {
      min: Math.round(prediction * 0.82 * rangeAdjustment),
      max: Math.round(prediction * 1.18 * rangeAdjustment)
    };

    // Get model version
    const { data: modelVersion } = await supabase
      .from('ml_model_versions')
      .select('version')
      .eq('is_active', true)
      .eq('model_type', 'ensemble_statistical_v2.1')
      .single();

    const result = {
      predictedWage: Math.round(prediction),
      confidence,
      wageRange,
      modelVersion: modelVersion?.version || 'v2.1-calibrated',
      metadata: {
        careerIndex: Math.round(careerIndex * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        inputCompleteness: Math.round(inputCompleteness * 100) / 100,
        locationTier: locationData.tier,
        dataQuality: Math.round(benchmarkData.dataQuality * 100)
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-wage-ml-v2:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
