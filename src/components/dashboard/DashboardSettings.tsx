import { useEffect, useState } from "react";
import { Settings, Activity, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DashboardSettings = () => {
  const [realtimeStats, setRealtimeStats] = useState(false);
  const [betaDays, setBetaDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("site_settings").select("value").eq("key", "realtime_stats").single(),
      supabase.from("site_settings").select("value").eq("key", "beta_duration_days").single(),
    ]).then(([statsRes, betaRes]) => {
      if (statsRes.data?.value && typeof statsRes.data.value === "object" && "enabled" in statsRes.data.value) {
        setRealtimeStats((statsRes.data.value as any).enabled === true);
      }
      if (betaRes.data?.value && typeof betaRes.data.value === "object" && "days" in betaRes.data.value) {
        setBetaDays((betaRes.data.value as any).days);
      }
      setLoading(false);
    });
  }, []);

  const toggleRealtimeStats = async (enabled: boolean) => {
    setRealtimeStats(enabled);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: { enabled } as any, updated_at: new Date().toISOString() })
      .eq("key", "realtime_stats");

    if (error) {
      setRealtimeStats(!enabled);
      toast.error("Failed to update setting");
    } else {
      toast.success(`Realtime stats ${enabled ? "enabled" : "disabled"}`);
    }
  };

  if (loading) return null;

  return (
    <Card className="glass border-border/30">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-foreground font-medium">Realtime Homepage Stats</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Replace static homepage numbers with live database stats that update in realtime.
              </p>
            </div>
          </div>
          <Switch checked={realtimeStats} onCheckedChange={toggleRealtimeStats} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSettings;
