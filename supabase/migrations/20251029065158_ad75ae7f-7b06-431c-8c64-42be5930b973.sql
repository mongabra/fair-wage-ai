-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create company_members table
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (company_id, user_id)
);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  credits_remaining INTEGER NOT NULL DEFAULT 3,
  total_credits INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_id TEXT,
  credits_purchased INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create batch_assessments table
CREATE TABLE public.batch_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  employee_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  education TEXT NOT NULL,
  experience INTEGER NOT NULL,
  location TEXT NOT NULL,
  current_wage NUMERIC NOT NULL,
  predicted_wage NUMERIC,
  assessment_status TEXT,
  confidence INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.batch_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view companies they created or are members of"
  ON public.companies FOR SELECT
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM public.company_members 
      WHERE company_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "HR users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = created_by AND public.has_role(auth.uid(), 'hr'));

CREATE POLICY "Company creators can update their companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for company_members
CREATE POLICY "Users can view members of their companies"
  ON public.company_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Company owners can manage members"
  ON public.company_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view subscriptions for their companies"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members 
      WHERE company_id = subscriptions.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their companies"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Company owners can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for batch_assessments
CREATE POLICY "Users can view assessments for their companies"
  ON public.batch_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE id = company_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members 
      WHERE company_id = batch_assessments.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can create assessments"
  ON public.batch_assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_members 
      WHERE company_id = batch_assessments.company_id AND user_id = auth.uid()
    )
  );

-- Trigger for companies updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to assign default user role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger to assign default role on user creation
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();