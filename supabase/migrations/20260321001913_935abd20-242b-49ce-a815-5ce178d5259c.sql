DROP POLICY "Users can update own configs" ON public.configs;

CREATE POLICY "Users can update own configs"
  ON public.configs FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND is_official = (SELECT c.is_official FROM public.configs c WHERE c.id = configs.id)
    AND downloads = (SELECT c.downloads FROM public.configs c WHERE c.id = configs.id)
    AND rating = (SELECT c.rating FROM public.configs c WHERE c.id = configs.id)
    AND rating_count = (SELECT c.rating_count FROM public.configs c WHERE c.id = configs.id)
  );