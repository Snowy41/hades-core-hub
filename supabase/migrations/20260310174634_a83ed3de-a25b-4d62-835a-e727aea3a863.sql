-- Drop the overly permissive read policy on configs bucket
DROP POLICY IF EXISTS "Authenticated users can read configs" ON storage.objects;

-- Create a restricted read policy: users can only read config files in their own folder (user_id prefix)
-- Client files (client/*) have NO read policy — only accessible via service-role in edge functions
CREATE POLICY "Users can read own config uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'configs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow admins/owners to read all files in configs bucket (needed for dashboard file management)
CREATE POLICY "Admins can read all configs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'configs'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
  );