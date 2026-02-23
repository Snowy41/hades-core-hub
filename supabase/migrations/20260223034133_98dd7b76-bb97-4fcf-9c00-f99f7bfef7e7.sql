
-- Create user_badges table for custom badges assigned by admins
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_name text NOT NULL,
  badge_icon text NOT NULL DEFAULT 'award',
  badge_color text NOT NULL DEFAULT 'purple',
  assigned_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_name)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can read badges
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);

-- Admins and owners can manage badges
CREATE POLICY "Admins can manage badges" ON public.user_badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Owners can manage badges" ON public.user_badges FOR ALL USING (has_role(auth.uid(), 'owner'::app_role));
