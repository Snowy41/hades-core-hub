import { Crown, Shield, Star, Clock, Flame, Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileBadgesProps {
  roles: string[];
  createdAt: string;
  hasSubscription?: boolean;
}

const badgeConfig: Record<string, { label: string; icon: typeof Crown; className: string }> = {
  owner: { label: "Owner", icon: Crown, className: "bg-primary/20 text-primary border-primary/30" },
  admin: { label: "Admin", icon: Shield, className: "bg-red-500/20 text-red-400 border-red-500/30" },
  moderator: { label: "Moderator", icon: Star, className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const ProfileBadges = ({ roles, createdAt, hasSubscription }: ProfileBadgesProps) => {
  const joinDate = new Date(createdAt);
  const now = new Date();
  const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

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

      {/* Beta Tester badge (joined within first 90 days - early adopter) */}
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
