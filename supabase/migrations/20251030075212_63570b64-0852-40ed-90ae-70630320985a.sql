-- Allow company owners to create a subscription record for their company
DROP POLICY IF EXISTS "Company owners can create subscriptions" ON public.subscriptions;

CREATE POLICY "Company owners can create subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = subscriptions.company_id
      AND c.created_by = auth.uid()
  )
);
