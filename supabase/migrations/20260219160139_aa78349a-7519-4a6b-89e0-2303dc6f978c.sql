
-- Add banned_at column to profiles for banning users
ALTER TABLE public.profiles ADD COLUMN banned_at timestamp with time zone DEFAULT NULL;

-- Allow owner/admin to read all invite keys (not just their own used key)
CREATE POLICY "Owners can manage invite keys"
ON public.invite_keys
FOR ALL
USING (has_role(auth.uid(), 'owner'::app_role));

-- Allow owner to manage all roles 
CREATE POLICY "Owners can manage roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'owner'::app_role));

-- Allow owner/admin to read all subscriptions
CREATE POLICY "Owners can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (has_role(auth.uid(), 'owner'::app_role));

-- Allow owner/admin to update any profile (for banning)
CREATE POLICY "Owners can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'owner'::app_role));

-- Allow owner/admin to delete any config
CREATE POLICY "Owners can manage all configs"
ON public.configs
FOR ALL
USING (has_role(auth.uid(), 'owner'::app_role));

-- Allow authenticated users to read all roles (needed to show badges on public profiles)
CREATE POLICY "Authenticated users can read roles"
ON public.user_roles
FOR SELECT
USING (true);
