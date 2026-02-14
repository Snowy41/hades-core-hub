import { useEffect, useState } from "react";
import { BadgeCheck, Download, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UserConfig {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  is_official: boolean;
  downloads: number;
  rating: number;
  created_at: string;
}

const UserConfigsList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<UserConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("configs")
      .select("id, name, description, category, price, is_official, downloads, rating, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setConfigs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchConfigs();
  }, [user]);

  const handleDelete = async (config: UserConfig) => {
    if (!confirm(`Delete "${config.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("configs").delete().eq("id", config.id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete config.", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `"${config.name}" has been removed.` });
      fetchConfigs();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>You haven't uploaded any configs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map((config) => (
        <div
          key={config.id}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{config.name}</p>
                {config.is_official && <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground flex-shrink-0">
                  {config.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {Number(config.rating).toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {config.downloads}
                </span>
                <span>{config.price === 0 ? "Free" : `${config.price} coins`}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={() => handleDelete(config)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default UserConfigsList;
