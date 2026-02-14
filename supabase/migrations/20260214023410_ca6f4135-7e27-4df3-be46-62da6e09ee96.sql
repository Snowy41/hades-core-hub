
-- Fix 1: Restrict profile reads to own profile only (was public)
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Fix 2: Restrict profile updates so hades_coins cannot be manipulated
DROP POLICY "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile metadata"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND hades_coins = (SELECT hades_coins FROM public.profiles WHERE user_id = auth.uid())
  );
