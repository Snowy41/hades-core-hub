-- Site settings table for admin-controlled features
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.site_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage settings" ON public.site_settings
  FOR ALL TO public USING (public.has_role(auth.uid(), 'owner'::app_role));

INSERT INTO public.site_settings (key, value) VALUES ('realtime_stats', '{"enabled": false}'::jsonb);

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.configs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
