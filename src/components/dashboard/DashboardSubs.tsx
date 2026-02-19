import { useEffect, useState, useCallback } from "react";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubRow {
  user_id: string;
  status: string;
  current_period_end: string | null;
}

const DashboardSubs = () => {
  const [subs, setSubs] = useState<SubRow[]>([]);

  const fetchSubs = useCallback(async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id, status, current_period_end")
      .order("created_at", { ascending: false })
      .limit(100);
    setSubs((data as SubRow[]) || []);
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  return (
    <Card className="glass border-border/30">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> Subscriptions ({subs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.user_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{s.user_id}</p>
                <p className="text-xs text-muted-foreground">
                  Expires: {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
            </div>
          ))}
          {subs.length === 0 && <p className="text-center text-muted-foreground py-8">No subscriptions yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSubs;
