import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Job title normalization mapping
const JOB_TITLE_MAPPING: Record<string, string> = {
  // IT & Tech
  'software engineer': 'IT_Software_Engineer',
  'developer': 'IT_Software_Engineer',
  'programmer': 'IT_Software_Engineer',
  'web developer': 'IT_Web_Developer',
  'data analyst': 'IT_Data_Analyst',
  'data scientist': 'IT_Data_Analyst',
  'devops': 'IT_DevOps_Engineer',
  'ui designer': 'IT_UI_UX_Designer',
  'ux designer': 'IT_UI_UX_Designer',
  'network admin': 'IT_Network_Administrator',
  
  // Healthcare
  'nurse': 'Healthcare_Nurse',
  'doctor': 'Healthcare_Doctor',
  'physician': 'Healthcare_Doctor',
  'medical officer': 'Healthcare_Medical_Officer',
  'lab tech': 'Healthcare_Lab_Technician',
  'pharmacist': 'Healthcare_Pharmacist',
  'physiotherapist': 'Healthcare_Physiotherapist',
  
  // Finance
  'accountant': 'Finance_Accountant',
  'financial analyst': 'Finance_Financial_Analyst',
  'auditor': 'Finance_Auditor',
  'bank manager': 'Finance_Bank_Manager',
  'credit officer': 'Finance_Credit_Officer',
  
  // Education
  'teacher': 'Education_Teacher',
  'lecturer': 'Education_Lecturer',
  'professor': 'Education_Lecturer',
  'administrator': 'Education_School_Administrator',
  'principal': 'Education_Principal',
  
  // Construction
  'civil engineer': 'Construction_Civil_Engineer',
  'project manager': 'Construction_Project_Manager',
  'surveyor': 'Construction_Surveyor',
  'architect': 'Construction_Architect',
  
  // Hospitality
  'chef': 'Hospitality_Chef',
  'hotel manager': 'Hospitality_Hotel_Manager',
  'tourism officer': 'Hospitality_Tourism_Officer',
  'restaurant manager': 'Hospitality_Restaurant_Manager',
  
  // Marketing & Sales
  'marketing manager': 'Marketing_Manager',
  'digital marketer': 'Marketing_Digital_Marketer',
  'sales manager': 'Sales_Manager',
  'sales rep': 'Sales_Representative',
  
  // HR
  'hr manager': 'HR_Manager',
  'hr officer': 'HR_Officer',
  'recruiter': 'HR_Recruitment_Specialist',
  
  // Legal
  'lawyer': 'Legal_Lawyer',
  'paralegal': 'Legal_Paralegal',
  
  // Customer Service
  'customer service': 'Customer_Service_Representative',
  'customer service manager': 'Customer_Service_Manager',
  
  // Administrative
  'admin assistant': 'Administrative_Assistant',
  'office manager': 'Administrative_Office_Manager',
  
  // Logistics
  'logistics manager': 'Logistics_Manager',
  'logistics coordinator': 'Logistics_Coordinator',
};

// Location cost-of-living factors
const LOCATION_FACTORS: Record<string, number> = {
  'Nairobi': 1.0,
  'Mombasa': 0.85,
  'Kisumu': 0.75,
  'Nakuru': 0.75,
  'Other': 0.70,
};

// Education multipliers
const EDUCATION_FACTORS: Record<string, number> = {
  'High School': 1.0,
  'Bachelor': 1.3,
  'Master': 1.6,
  'PhD': 2.0,
};

/**
 * Normalize job title to standard category
 */
function normalizeJobTitle(jobTitle: string): string {
  const normalized = jobTitle.toLowerCase().trim();
  
  // Direct match
  if (JOB_TITLE_MAPPING[normalized]) {
    return JOB_TITLE_MAPPING[normalized];
  }
  
  // Fuzzy match - find the first keyword that matches
  for (const [keyword, category] of Object.entries(JOB_TITLE_MAPPING)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return category;
    }
  }
  
  // Fallback - try to extract sector
  if (normalized.includes('tech') || normalized.includes('it')) return 'IT_Software_Engineer';
  if (normalized.includes('medical') || normalized.includes('health')) return 'Healthcare_Nurse';
  if (normalized.includes('finance') || normalized.includes('account')) return 'Finance_Accountant';
  if (normalized.includes('teach') || normalized.includes('education')) return 'Education_Teacher';
  if (normalized.includes('engineer')) return 'Construction_Civil_Engineer';
  
  // Default fallback
  return 'Administrative_Assistant';
}

/**
 * Get benchmark wage from database
 */
async function getBenchmarkWage(
  supabase: any,
  jobCategory: string,
  location: string,
  education: string
): Promise<{ baseWage: number; confidence: number; wageRange: { min: number; max: number } }> {
  // Try exact match first
  const { data: exactMatch, error: exactError } = await supabase
    .from('wage_benchmarks')
    .select('*')
    .eq('job_category', jobCategory)
    .eq('location', location)
    .eq('education', education)
    .single();
  
  if (exactMatch && !exactError) {
    console.log('Exact match found:', exactMatch);
    return {
      baseWage: Number(exactMatch.base_wage),
      confidence: 90,
      wageRange: {
        min: Number(exactMatch.wage_range_min),
        max: Number(exactMatch.wage_range_max),
      },
    };
  }
  
  // Try category + location match (any education)
  const { data: categoryMatch } = await supabase
    .from('wage_benchmarks')
    .select('*')
    .eq('job_category', jobCategory)
    .eq('location', location)
    .order('base_wage', { ascending: false })
    .limit(1)
    .single();
  
  if (categoryMatch) {
    console.log('Category + location match found:', categoryMatch);
    return {
      baseWage: Number(categoryMatch.base_wage),
      confidence: 75,
      wageRange: {
        min: Number(categoryMatch.wage_range_min),
        max: Number(categoryMatch.wage_range_max),
      },
    };
  }
  
  // Try category match (Nairobi as default location)
  const { data: categoryOnly } = await supabase
    .from('wage_benchmarks')
    .select('*')
    .eq('job_category', jobCategory)
    .eq('location', 'Nairobi')
    .order('base_wage', { ascending: false })
    .limit(1)
    .single();
  
  if (categoryOnly) {
    console.log('Category-only match (Nairobi fallback):', categoryOnly);
    return {
      baseWage: Number(categoryOnly.base_wage),
      confidence: 65,
      wageRange: {
        min: Number(categoryOnly.wage_range_min),
        max: Number(categoryOnly.wage_range_max),
      },
    };
  }
  
  // Final fallback - average wage
  console.log('No match found, using fallback wage');
  return {
    baseWage: 50000,
    confidence: 50,
    wageRange: { min: 35000, max: 70000 },
  };
}

/**
 * Calculate experience multiplier
 */
function calculateExperienceMultiplier(experience: number): number {
  // 3% increase per year, capped at 20 years
  const cappedExperience = Math.min(experience, 20);
  return 1 + (cappedExperience * 0.03);
}

/**
 * Get location adjustment factor
 */
function getLocationFactor(location: string): number {
  return LOCATION_FACTORS[location] || LOCATION_FACTORS['Other'];
}

/**
 * Get education multiplier
 */
function getEducationFactor(education: string): number {
  return EDUCATION_FACTORS[education] || EDUCATION_FACTORS['High School'];
}

/**
 * Main prediction function
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, education, experience, location } = await req.json();
    
    console.log('Prediction request:', { jobTitle, education, experience, location });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Normalize job title
    const jobCategory = normalizeJobTitle(jobTitle);
    console.log('Normalized job category:', jobCategory);

    // 2. Get base wage from benchmarks
    const { baseWage, confidence: baseConfidence, wageRange } = await getBenchmarkWage(
      supabase,
      jobCategory,
      location,
      education
    );

    // 3. Calculate multipliers
    const experienceMultiplier = calculateExperienceMultiplier(Number(experience));
    const educationFactor = getEducationFactor(education);
    const locationFactor = getLocationFactor(location);

    // 4. Calculate predicted wage
    const predictedWage = Math.round(
      baseWage * experienceMultiplier * educationFactor * locationFactor
    );

    // 5. Calculate final confidence score
    const confidence = Math.min(
      95,
      Math.round(baseConfidence * (1 - Math.abs(experienceMultiplier - 1.3) / 2))
    );

    // 6. Get active model version
    const { data: modelVersion } = await supabase
      .from('ml_model_versions')
      .select('version')
      .eq('is_active', true)
      .single();

    const result = {
      predictedWage,
      confidence,
      modelVersion: modelVersion?.version || 'v1.0-statistical',
      metadata: {
        jobCategory,
        baseWage,
        wageRange,
        factors: {
          experience: experienceMultiplier,
          education: educationFactor,
          location: locationFactor,
        },
      },
    };

    console.log('Prediction result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-wage-ml function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      predictedWage: 50000,
      confidence: 50,
      modelVersion: 'v1.0-statistical',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
