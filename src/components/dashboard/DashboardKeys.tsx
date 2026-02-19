import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Copy, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface InviteKey {
  id: string;
  key: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
}

const DashboardKeys = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteKeys, setInviteKeys] = useState<InviteKey[]>([]);
  const [newKeyPrefix, setNewKeyPrefix] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchKeys = useCallback(async () => {
    const { data } = await supabase
      .from("invite_keys")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setInviteKeys(data || []);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const generateKey = async () => {
    if (!user) return;
    setGenerating(true);
    const prefix = newKeyPrefix.trim().toUpperCase() || "HADES";
    const randomPart = crypto.randomUUID().split("-").slice(0, 2).join("").toUpperCase();
    const key = `${prefix}-${randomPart}`;

    const { error } = await supabase.from("invite_keys").insert({ key, created_by: user.id });
    if (error) {
      toast({ title: "Error", description: "Failed to create key.", variant: "destructive" });
    } else {
      toast({ title: "Key Created", description: key });
      setNewKeyPrefix("");
      fetchKeys();
    }
    setGenerating(false);
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("invite_keys").delete().eq("id", id);
    if (!error) { toast({ title: "Key deleted" }); fetchKeys(); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied!", description: key });
  };

  return (
    <Card className="glass border-border/30">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" /> Invite Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Key prefix (default: HADES)" value={newKeyPrefix} onChange={(e) => setNewKeyPrefix(e.target.value)} className="max-w-xs bg-secondary border-border" />
          <Button onClick={generateKey} disabled={generating} className="gradient-hades">
            <Plus className="h-4 w-4 mr-1" /> Generate
          </Button>
        </div>
        <div className="space-y-2">
          {inviteKeys.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <code className="text-sm font-mono text-foreground">{k.key}</code>
                <Badge variant={k.is_used ? "secondary" : "outline"} className={k.is_used ? "text-muted-foreground" : "text-green-400 border-green-500/30"}>
                  {k.is_used ? "Used" : "Available"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => copyKey(k.key)}><Copy className="h-3.5 w-3.5" /></Button>
                {!k.is_used && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteKey(k.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                )}
              </div>
            </div>
          ))}
          {inviteKeys.length === 0 && <p className="text-center text-muted-foreground py-8">No invite keys yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardKeys;
