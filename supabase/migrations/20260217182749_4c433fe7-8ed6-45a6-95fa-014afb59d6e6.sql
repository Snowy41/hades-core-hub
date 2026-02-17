
-- Invite keys table: admins generate keys, each key allows one registration
CREATE TABLE public.invite_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  used_by uuid,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_used boolean NOT NULL DEFAULT false
);

ALTER TABLE public.invite_keys ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage invite keys"
  ON public.invite_keys FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Users can view their own used key
CREATE POLICY "Users can view own used key"
  ON public.invite_keys FOR SELECT
  USING (used_by = auth.uid());

-- Subscriptions table: tracks active premium subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'inactive',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Only service role / edge functions insert/update subscriptions (no user policies for INSERT/UPDATE)
-- Admins can manage all
CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate invite key during registration (called from edge function)
CREATE OR REPLACE FUNCTION public.validate_and_use_invite_key(p_key text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE invite_keys
  SET is_used = true, used_by = p_user_id, used_at = now()
  WHERE key = p_key AND is_used = false;
  
  RETURN FOUND;
END;
$$;
