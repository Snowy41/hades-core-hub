import { useEffect, useState } from "react";
import { Crown, Shield, Star, Clock, Flame, Bug, Award, Zap, Heart, Gem, Trophy, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ProfileBadgesProps {
  roles: string[];
  createdAt: string;
  hasSubscription?: boolean;
  userId?: string;
}

interface CustomBadge {
  badge_name: string;
  badge_icon: string;
  badge_color: string;
}

const iconMap: Record<string, typeof Award> = {
  award: Award, star: Star, zap: Zap, flame: Flame,
  heart: Heart, gem: Gem, trophy: Trophy, target: Target,
};

const colorMap: Record<string, string> = {
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const badgeConfig: Record<string, { label: string; icon: typeof Crown; className: string }> = {
  owner: { label: "Owner", icon: Crown, className: "bg-primary/20 text-primary border-primary/30" },
  admin: { label: "Admin", icon: Shield, className: "bg-red-500/20 text-red-400 border-red-500/30" },
  moderator: { label: "Moderator", icon: Star, className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const ProfileBadges = ({ roles, createdAt, hasSubscription, userId }: ProfileBadgesProps) => {
  const [customBadges, setCustomBadges] = useState<CustomBadge[]>([]);
  const joinDate = new Date(createdAt);
  const now = new Date();
  const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("user_badges")
      .select("badge_name, badge_icon, badge_color")
      .eq("user_id", userId)
      .then(({ data }) => setCustomBadges((data as CustomBadge[]) || []));
  }, [userId]);

  return (
    <div className="flex flex-wrap gap-2">
      {/* Role badges */}
      {roles.map((role) => {
        const config = badgeConfig[role];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <Badge key={role} variant="outline" className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      })}

      {/* Subscription badge */}
      {hasSubscription && (
        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
          <Flame className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      )}

      {/* Custom badges */}
      {customBadges.map((cb) => {
        const Icon = iconMap[cb.badge_icon] || Award;
        return (
          <Badge key={cb.badge_name} variant="outline" className={colorMap[cb.badge_color] || colorMap.purple}>
            <Icon className="h-3 w-3 mr-1" />
            {cb.badge_name}
          </Badge>
        );
      })}

      {/* Beta Tester badge */}
      {daysSinceJoin <= 90 && (
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          <Bug className="h-3 w-3 mr-1" />
          Beta Tester
        </Badge>
      )}

      {/* Tenure badges */}
      {daysSinceJoin >= 365 && (
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Veteran
        </Badge>
      )}
      {daysSinceJoin >= 30 && daysSinceJoin < 365 && (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          <Clock className="h-3 w-3 mr-1" />
          Member
        </Badge>
      )}
    </div>
  );
};

export default ProfileBadges;
