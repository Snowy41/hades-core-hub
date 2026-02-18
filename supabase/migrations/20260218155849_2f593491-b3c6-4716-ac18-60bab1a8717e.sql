
-- Add description column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description text DEFAULT NULL;

-- Make profiles publicly viewable by all authenticated users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Assign owner role to gaspedal
INSERT INTO public.user_roles (user_id, role)
VALUES ('e6a42b5b-5ddb-4e69-85a0-5e97287bd200', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;
