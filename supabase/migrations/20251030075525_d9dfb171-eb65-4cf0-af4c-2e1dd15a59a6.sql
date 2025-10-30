-- Create SECURITY DEFINER helpers to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies
    WHERE id = _company_id AND created_by = _user_id
  );
$$;

-- Fix companies SELECT policy to use helper function (remove mutual refs)
DROP POLICY IF EXISTS "Users can view companies they created or are members of" ON public.companies;
CREATE POLICY "Users can view their companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR public.is_company_member(id, auth.uid())
);

-- Rebuild company_members policies without referencing companies directly
DROP POLICY IF EXISTS "Users can view members of their companies" ON public.company_members;
DROP POLICY IF EXISTS "Company owners can manage members" ON public.company_members;

CREATE POLICY "Company owners can manage members"
ON public.company_members
FOR ALL
TO authenticated
USING (public.is_company_owner(company_members.company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_members.company_id, auth.uid()));

CREATE POLICY "Users can view members of their companies"
ON public.company_members
FOR SELECT
TO authenticated
USING (public.is_company_owner(company_members.company_id, auth.uid()) OR user_id = auth.uid());
