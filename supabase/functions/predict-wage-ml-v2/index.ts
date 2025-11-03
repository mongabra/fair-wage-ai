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

// Enhanced education factors with credential weights
const EDUCATION_FACTORS: Record<string, { multiplier: number; weight: number }> = {
  "phd": { multiplier: 1.45, weight: 5 },
  "doctorate": { multiplier: 1.45, weight: 5 },
  "masters": { multiplier: 1.28, weight: 4 },
  "master's degree": { multiplier: 1.28, weight: 4 },
  "mba": { multiplier: 1.32, weight: 4 },
  "bachelor": { multiplier: 1.12, weight: 3 },
  "bachelor's degree": { multiplier: 1.12, weight: 3 },
  "degree": { multiplier: 1.12, weight: 3 },
  "diploma": { multiplier: 0.95, weight: 2 },
  "certificate": { multiplier: 0.85, weight: 1 },
  "high school": { multiplier: 0.72, weight: 0 },
  "secondary": { multiplier: 0.72, weight: 0 },
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

// Ensemble prediction: combines multiple estimation methods
function ensemblePrediction(
  baseWage: number,
  experienceMultiplier: number,
  educationMultiplier: number,
  locationFactor: number,
  careerIndex: number
): { prediction: number; variance: number } {
  // Method 1: Traditional multiplicative
  const method1 = baseWage * experienceMultiplier * educationMultiplier * locationFactor;
  
  // Method 2: Career-indexed scaling
  const method2 = baseWage * (1 + (careerIndex * 0.25)) * locationFactor;
  
  // Method 3: Hybrid with dampening
  const method3 = baseWage * Math.sqrt(experienceMultiplier * educationMultiplier) * locationFactor * 1.15;
  
  // Weighted ensemble (60% method1, 25% method2, 15% method3)
  const ensemble = (method1 * 0.60) + (method2 * 0.25) + (method3 * 0.15);
  
  // Calculate variance (measure of prediction stability)
  const predictions = [method1, method2, method3];
  const mean = predictions.reduce((a, b) => a + b) / predictions.length;
  const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;
  const normalizedVariance = Math.sqrt(variance) / mean; // Coefficient of variation
  
  return { prediction: ensemble, variance: normalizedVariance };
}

// Confidence calibration based on multiple factors
function calibrateConfidence(
  baseConfidence: number,
  dataQuality: number,
  locationConfidence: number,
  educationConfidence: number,
  variance: number,
  experience: number
): number {
  // Start with base confidence from benchmark match
  let confidence = baseConfidence;
  
  // Adjust for data quality (weight: 15%)
  confidence = confidence * (0.85 + (dataQuality * 0.15));
  
  // Adjust for location match quality (weight: 10%)
  confidence = confidence * (0.90 + (locationConfidence * 0.10));
  
  // Adjust for education match quality (weight: 8%)
  confidence = confidence * (0.92 + (educationConfidence * 0.08));
  
  // Penalize high variance (unstable predictions)
  const variancePenalty = Math.max(0, 1 - (variance * 2));
  confidence = confidence * (0.85 + (variancePenalty * 0.15));
  
  // Boost confidence for typical experience ranges (3-10 years)
  if (experience >= 3 && experience <= 10) {
    confidence = confidence * 1.05;
  }
  
  // Cap at realistic maximum
  return Math.min(Math.round(confidence * 100), 95);
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

    // Ensemble prediction
    const { prediction, variance } = ensemblePrediction(
      benchmarkData.baseWage,
      experienceMultiplier,
      educationData.multiplier,
      locationData.factor,
      careerIndex
    );

    // Calibrate confidence
    const confidence = calibrateConfidence(
      benchmarkData.confidence,
      benchmarkData.dataQuality,
      locationData.confidence,
      educationData.confidence,
      variance,
      experience
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
      .eq('model_type', 'ensemble_statistical_v2')
      .single();

    const result = {
      predictedWage: Math.round(prediction),
      confidence,
      wageRange,
      modelVersion: modelVersion?.version || 'v2.0-ensemble',
      metadata: {
        careerIndex: Math.round(careerIndex * 100) / 100,
        variance: Math.round(variance * 100) / 100,
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
