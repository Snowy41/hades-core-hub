CREATE TABLE public.download_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used boolean NOT NULL DEFAULT false
);

ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.cleanup_download_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.download_tokens
  WHERE created_at < now() - interval '60 seconds' OR used = true;
$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true);

CREATE POLICY "Public read access for website-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'website-assets');

CREATE POLICY "Admins can upload website-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-assets'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
);

CREATE POLICY "Admins can update website-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'website-assets'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
);

CREATE POLICY "Admins can delete website-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-assets'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
);