-- Create a security definer function to check if user has HR/admin role in a company
CREATE OR REPLACE FUNCTION public.is_company_hr_or_admin(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id 
      AND user_id = _user_id
      AND role IN ('owner', 'admin', 'hr')
  );
$$;

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view assessments for their companies" ON public.batch_assessments;

-- Create new restrictive SELECT policy for HR/admin only
CREATE POLICY "Only company owners and HR can view assessments"
ON public.batch_assessments
FOR SELECT
USING (
  public.is_company_owner(company_id, auth.uid()) 
  OR public.is_company_hr_or_admin(company_id, auth.uid())
);

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Company members can create assessments" ON public.batch_assessments;

-- Create new restrictive INSERT policy for HR/admin only
CREATE POLICY "Only company owners and HR can create assessments"
ON public.batch_assessments
FOR INSERT
WITH CHECK (
  public.is_company_owner(company_id, auth.uid())
  OR public.is_company_hr_or_admin(company_id, auth.uid())
);