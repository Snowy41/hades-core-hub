
-- Configs table for marketplace listings
CREATE TABLE public.configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'PvP',
  price INTEGER NOT NULL DEFAULT 0,
  is_official BOOLEAN NOT NULL DEFAULT false,
  file_path TEXT,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse configs
CREATE POLICY "Authenticated users can view configs"
  ON public.configs FOR SELECT
  TO authenticated
  USING (true);

-- Users can upload their own configs
CREATE POLICY "Users can insert own configs"
  ON public.configs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own configs
CREATE POLICY "Users can update own configs"
  ON public.configs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own configs
CREATE POLICY "Users can delete own configs"
  ON public.configs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all configs (for official ones)
CREATE POLICY "Admins can manage all configs"
  ON public.configs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Purchases table
CREATE TABLE public.config_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_id UUID NOT NULL REFERENCES public.configs(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, config_id)
);

ALTER TABLE public.config_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.config_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchases"
  ON public.config_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Config ratings table
CREATE TABLE public.config_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  config_id UUID NOT NULL REFERENCES public.configs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, config_id)
);

ALTER TABLE public.config_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings"
  ON public.config_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rate configs"
  ON public.config_ratings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ratings"
  ON public.config_ratings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at on configs
CREATE TRIGGER update_configs_updated_at
  BEFORE UPDATE ON public.configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for config files
INSERT INTO storage.buckets (id, name, public) VALUES ('configs', 'configs', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload configs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'configs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can read configs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'configs');

CREATE POLICY "Users can delete own config files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'configs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to purchase a config (handles coin transfer + transaction logging)
CREATE OR REPLACE FUNCTION public.purchase_config(p_config_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _config configs%ROWTYPE;
  _already_purchased BOOLEAN;
BEGIN
  -- Get config details
  SELECT * INTO _config FROM configs WHERE id = p_config_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Config not found';
  END IF;

  -- Can't buy own config
  IF _config.user_id = _user_id THEN
    RAISE EXCEPTION 'Cannot purchase your own config';
  END IF;

  -- Check if already purchased
  SELECT EXISTS(SELECT 1 FROM config_purchases WHERE user_id = _user_id AND config_id = p_config_id) INTO _already_purchased;
  IF _already_purchased THEN
    RAISE EXCEPTION 'Already purchased';
  END IF;

  -- Free configs: just record purchase
  IF _config.price = 0 THEN
    INSERT INTO config_purchases (user_id, config_id, price_paid) VALUES (_user_id, p_config_id, 0);
    UPDATE configs SET downloads = downloads + 1 WHERE id = p_config_id;
    RETURN;
  END IF;

  -- Check buyer has enough coins
  IF (SELECT hades_coins FROM profiles WHERE user_id = _user_id) < _config.price THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Deduct from buyer
  UPDATE profiles SET hades_coins = hades_coins - _config.price WHERE user_id = _user_id;

  -- Credit seller
  UPDATE profiles SET hades_coins = hades_coins + _config.price WHERE user_id = _config.user_id;

  -- Record purchase
  INSERT INTO config_purchases (user_id, config_id, price_paid) VALUES (_user_id, p_config_id, _config.price);

  -- Log transactions
  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (_user_id, 'config_buy', -_config.price, 'Purchased: ' || _config.name);

  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (_config.user_id, 'config_sale', _config.price, 'Sold: ' || _config.name);

  -- Increment downloads
  UPDATE configs SET downloads = downloads + 1 WHERE id = p_config_id;
END;
$$;
