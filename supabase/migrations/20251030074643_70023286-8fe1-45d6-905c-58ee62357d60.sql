-- Fix recursive/invalid SELECT policy on companies causing 42P17
-- Drop the existing faulty policy if present
DROP POLICY IF EXISTS "Users can view companies they created or are members of" ON public.companies;

-- Recreate with a non-recursive, correct condition
CREATE POLICY "Users can view companies they created or are members of"
ON public.companies
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by
  OR EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.company_id = companies.id
      AND cm.user_id = auth.uid()
  )
);
