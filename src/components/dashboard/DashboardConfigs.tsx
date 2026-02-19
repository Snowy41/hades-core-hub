import { useEffect, useState, useCallback } from "react";
import { Package, Trash2, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ConfigRow {
  id: string;
  name: string;
  category: string;
  downloads: number;
  rating: number;
  is_official: boolean;
  user_id: string;
  created_at: string;
  author_name?: string;
}

const DashboardConfigs = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ConfigRow[]>([]);

  const fetchConfigs = useCallback(async () => {
    const { data: configsData } = await supabase
      .from("configs")
      .select("id, name, category, downloads, rating, is_official, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!configsData) { setConfigs([]); return; }

    const userIds = [...new Set(configsData.map((c) => c.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.username]));

    setConfigs(configsData.map((c) => ({ ...c, author_name: profileMap.get(c.user_id) || "Unknown" })));
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const toggleOfficial = async (id: string, current: boolean) => {
    const { error } = await supabase.from("configs").update({ is_official: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: current ? "Removed official status" : "Marked as official" });
      fetchConfigs();
    }
  };

  const deleteConfig = async (id: string) => {
    const { error } = await supabase.from("configs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Config deleted" });
      fetchConfigs();
    }
  };

  return (
    <Card className="glass border-border/30">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Configs ({configs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {configs.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  {c.is_official && <BadgeCheck className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  by {c.author_name} · {c.category} · {c.downloads} downloads · ★ {Number(c.rating).toFixed(1)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggleOfficial(c.id, c.is_official)} className="text-xs">
                  <BadgeCheck className={`h-3.5 w-3.5 ${c.is_official ? "text-primary" : "text-muted-foreground"}`} />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteConfig(c.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {configs.length === 0 && <p className="text-center text-muted-foreground py-8">No configs yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardConfigs;
