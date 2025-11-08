-- Add UPDATE policy for payments table - only company owners can update
CREATE POLICY "Only company owners can update payments"
ON public.payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = payments.company_id 
      AND companies.created_by = auth.uid()
  )
);

-- Add DELETE policy for payments table - only company owners can delete
CREATE POLICY "Only company owners can delete payments"
ON public.payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = payments.company_id 
      AND companies.created_by = auth.uid()
  )
);