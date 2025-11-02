-- Fix security warning: Set search_path for the function
DROP TRIGGER IF EXISTS update_wage_benchmarks_updated_at ON public.wage_benchmarks;
DROP FUNCTION IF EXISTS public.update_wage_benchmarks_updated_at();

CREATE OR REPLACE FUNCTION public.update_wage_benchmarks_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_wage_benchmarks_updated_at
BEFORE UPDATE ON public.wage_benchmarks
FOR EACH ROW
EXECUTE FUNCTION public.update_wage_benchmarks_updated_at();