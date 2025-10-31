-- Phase 1: Create ML prediction infrastructure tables

-- Table 1: Wage Benchmarks (reference data for predictions)
CREATE TABLE public.wage_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_category TEXT NOT NULL,
  location TEXT NOT NULL,
  education TEXT NOT NULL,
  base_wage NUMERIC NOT NULL,
  wage_range_min NUMERIC NOT NULL,
  wage_range_max NUMERIC NOT NULL,
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_category, location, education)
);

-- Enable RLS for wage_benchmarks (public read access)
ALTER TABLE public.wage_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wage benchmarks"
ON public.wage_benchmarks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage wage benchmarks"
ON public.wage_benchmarks
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table 2: ML Model Versions (track model versions and performance)
CREATE TABLE public.ml_model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL,
  metrics JSONB,
  training_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false,
  model_file_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for ml_model_versions
ALTER TABLE public.ml_model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active model versions"
ON public.ml_model_versions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage model versions"
ON public.ml_model_versions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table 3: Wage Training Data (collect feedback for future model improvements)
CREATE TABLE public.wage_training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  job_title TEXT NOT NULL,
  education TEXT NOT NULL,
  experience INTEGER NOT NULL,
  location TEXT NOT NULL,
  actual_wage NUMERIC NOT NULL,
  predicted_wage NUMERIC,
  industry TEXT,
  data_source TEXT DEFAULT 'user_feedback',
  verified BOOLEAN DEFAULT false,
  feedback_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for wage_training_data
ALTER TABLE public.wage_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own training data"
ON public.wage_training_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own training data"
ON public.wage_training_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add ML prediction columns to existing tables
ALTER TABLE public.wage_assessments 
ADD COLUMN IF NOT EXISTS predicted_wage NUMERIC,
ADD COLUMN IF NOT EXISTS model_version TEXT,
ADD COLUMN IF NOT EXISTS prediction_confidence INTEGER;

ALTER TABLE public.batch_assessments 
ADD COLUMN IF NOT EXISTS model_version TEXT;

-- Insert initial model version record
INSERT INTO public.ml_model_versions (version, model_type, metrics, is_active, metadata)
VALUES (
  'v1.0-statistical',
  'weighted_regression',
  '{"estimated_accuracy": 0.77, "benchmark_count": 60, "mae_estimate": 8500}'::jsonb,
  true,
  '{"algorithm": "weighted_regression", "factors": ["job_category", "education", "experience", "location"], "release_date": "2025-10-31", "description": "Statistical regression model using curated Kenya wage benchmarks"}'::jsonb
);

-- Populate wage benchmarks with Kenya-specific data
-- IT Sector
INSERT INTO public.wage_benchmarks (job_category, location, education, base_wage, wage_range_min, wage_range_max) VALUES
('IT_Software_Engineer', 'Nairobi', 'Bachelor', 120000, 80000, 180000),
('IT_Software_Engineer', 'Nairobi', 'Master', 160000, 120000, 240000),
('IT_Software_Engineer', 'Mombasa', 'Bachelor', 100000, 70000, 150000),
('IT_Data_Analyst', 'Nairobi', 'Bachelor', 100000, 70000, 150000),
('IT_Data_Analyst', 'Nairobi', 'Master', 130000, 90000, 180000),
('IT_DevOps_Engineer', 'Nairobi', 'Bachelor', 130000, 90000, 180000),
('IT_UI_UX_Designer', 'Nairobi', 'Bachelor', 90000, 60000, 130000),
('IT_Web_Developer', 'Nairobi', 'Bachelor', 80000, 55000, 120000),
('IT_Network_Administrator', 'Nairobi', 'Bachelor', 85000, 60000, 120000),

-- Healthcare Sector
('Healthcare_Nurse', 'Nairobi', 'Bachelor', 60000, 45000, 85000),
('Healthcare_Nurse', 'Mombasa', 'Bachelor', 55000, 40000, 75000),
('Healthcare_Doctor', 'Nairobi', 'Master', 250000, 180000, 350000),
('Healthcare_Doctor', 'Mombasa', 'Master', 220000, 160000, 300000),
('Healthcare_Medical_Officer', 'Nairobi', 'Bachelor', 150000, 100000, 200000),
('Healthcare_Lab_Technician', 'Nairobi', 'Bachelor', 50000, 35000, 70000),
('Healthcare_Pharmacist', 'Nairobi', 'Bachelor', 80000, 60000, 110000),
('Healthcare_Physiotherapist', 'Nairobi', 'Bachelor', 70000, 50000, 95000),

-- Finance Sector
('Finance_Accountant', 'Nairobi', 'Bachelor', 80000, 60000, 120000),
('Finance_Accountant', 'Nairobi', 'Master', 110000, 80000, 150000),
('Finance_Financial_Analyst', 'Nairobi', 'Bachelor', 95000, 70000, 130000),
('Finance_Auditor', 'Nairobi', 'Bachelor', 90000, 65000, 125000),
('Finance_Bank_Manager', 'Nairobi', 'Master', 180000, 130000, 250000),
('Finance_Credit_Officer', 'Nairobi', 'Bachelor', 70000, 50000, 95000),
('Finance_Investment_Analyst', 'Nairobi', 'Master', 140000, 100000, 190000),

-- Education Sector
('Education_Teacher', 'Nairobi', 'Bachelor', 50000, 35000, 70000),
('Education_Teacher', 'Kisumu', 'Bachelor', 45000, 32000, 62000),
('Education_Lecturer', 'Nairobi', 'Master', 100000, 70000, 140000),
('Education_Lecturer', 'Nairobi', 'PhD', 150000, 110000, 200000),
('Education_School_Administrator', 'Nairobi', 'Master', 90000, 65000, 125000),
('Education_Principal', 'Nairobi', 'Master', 120000, 85000, 160000),

-- Construction & Engineering
('Construction_Civil_Engineer', 'Nairobi', 'Bachelor', 100000, 70000, 140000),
('Construction_Civil_Engineer', 'Mombasa', 'Bachelor', 90000, 65000, 125000),
('Construction_Project_Manager', 'Nairobi', 'Master', 150000, 110000, 200000),
('Construction_Surveyor', 'Nairobi', 'Bachelor', 80000, 55000, 110000),
('Construction_Architect', 'Nairobi', 'Bachelor', 110000, 80000, 150000),
('Construction_Quantity_Surveyor', 'Nairobi', 'Bachelor', 85000, 60000, 120000),

-- Hospitality & Tourism
('Hospitality_Chef', 'Nairobi', 'High School', 45000, 30000, 65000),
('Hospitality_Chef', 'Mombasa', 'High School', 40000, 28000, 58000),
('Hospitality_Hotel_Manager', 'Nairobi', 'Bachelor', 110000, 80000, 150000),
('Hospitality_Tourism_Officer', 'Nairobi', 'Bachelor', 65000, 45000, 90000),
('Hospitality_Restaurant_Manager', 'Nairobi', 'Bachelor', 75000, 55000, 105000),

-- Marketing & Sales
('Marketing_Manager', 'Nairobi', 'Bachelor', 100000, 70000, 140000),
('Marketing_Digital_Marketer', 'Nairobi', 'Bachelor', 70000, 50000, 100000),
('Sales_Manager', 'Nairobi', 'Bachelor', 90000, 65000, 130000),
('Sales_Representative', 'Nairobi', 'Bachelor', 60000, 40000, 85000),

-- Human Resources
('HR_Manager', 'Nairobi', 'Bachelor', 95000, 70000, 130000),
('HR_Officer', 'Nairobi', 'Bachelor', 65000, 45000, 90000),
('HR_Recruitment_Specialist', 'Nairobi', 'Bachelor', 70000, 50000, 95000),

-- Legal
('Legal_Lawyer', 'Nairobi', 'Master', 150000, 100000, 220000),
('Legal_Paralegal', 'Nairobi', 'Bachelor', 60000, 40000, 85000),

-- Customer Service
('Customer_Service_Representative', 'Nairobi', 'High School', 35000, 25000, 50000),
('Customer_Service_Manager', 'Nairobi', 'Bachelor', 70000, 50000, 95000),

-- Administrative
('Administrative_Assistant', 'Nairobi', 'High School', 40000, 28000, 55000),
('Administrative_Office_Manager', 'Nairobi', 'Bachelor', 75000, 55000, 105000),

-- Logistics
('Logistics_Manager', 'Nairobi', 'Bachelor', 85000, 60000, 120000),
('Logistics_Coordinator', 'Nairobi', 'Bachelor', 60000, 42000, 82000),

-- Other locations for key roles
('IT_Software_Engineer', 'Kisumu', 'Bachelor', 90000, 65000, 130000),
('Finance_Accountant', 'Nakuru', 'Bachelor', 70000, 50000, 95000),
('Education_Teacher', 'Nakuru', 'Bachelor', 42000, 30000, 58000),
('Healthcare_Nurse', 'Kisumu', 'Bachelor', 52000, 38000, 72000);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_wage_benchmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wage_benchmarks_updated_at
BEFORE UPDATE ON public.wage_benchmarks
FOR EACH ROW
EXECUTE FUNCTION public.update_wage_benchmarks_updated_at();