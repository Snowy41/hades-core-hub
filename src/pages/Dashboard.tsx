import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, Key, Plus, Trash2, Copy, Crown, Package, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface InviteKey {
  id: string;
  key: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
}

interface UserRow {
  user_id: string;
  username: string;
  hades_coins: number;
  created_at: string;
}

interface SubRow {
  user_id: string;
  status: string;
  current_period_end: string | null;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState<"keys" | "users" | "subs">("keys");

  // Keys state
  const [inviteKeys, setInviteKeys] = useState<InviteKey[]>([]);
  const [newKeyPrefix, setNewKeyPrefix] = useState("");
  const [generating, setGenerating] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserRow[]>([]);

  // Subs state
  const [subs, setSubs] = useState<SubRow[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const roles = (data || []).map((r) => r.role);
        setIsOwnerOrAdmin(roles.includes("owner") || roles.includes("admin"));
        setCheckingRole(false);
      });
  }, [user]);

  const fetchKeys = useCallback(async () => {
    const { data } = await supabase
      .from("invite_keys")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setInviteKeys(data || []);
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, hades_coins, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setUsers((data as UserRow[]) || []);
  }, []);

  const fetchSubs = useCallback(async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id, status, current_period_end")
      .order("created_at", { ascending: false })
      .limit(100);
    setSubs((data as SubRow[]) || []);
  }, []);

  useEffect(() => {
    if (isOwnerOrAdmin) {
      fetchKeys();
      fetchUsers();
      fetchSubs();
    }
  }, [isOwnerOrAdmin, fetchKeys, fetchUsers, fetchSubs]);

  const generateKey = async () => {
    if (!user) return;
    setGenerating(true);
    const prefix = newKeyPrefix.trim().toUpperCase() || "HADES";
    const randomPart = crypto.randomUUID().split("-").slice(0, 2).join("").toUpperCase();
    const key = `${prefix}-${randomPart}`;

    const { error } = await supabase.from("invite_keys").insert({
      key,
      created_by: user.id,
    });

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
    if (!error) {
      toast({ title: "Key deleted" });
      fetchKeys();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied!", description: key });
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOwnerOrAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 text-center">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: "keys" as const, label: "Invite Keys", icon: Key },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "subs" as const, label: "Subscriptions", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold gradient-hades-text">Owner Dashboard</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                size="sm"
                variant={activeTab === tab.id ? "default" : "outline"}
                className={activeTab === tab.id ? "gradient-hades font-semibold" : "border-border/50"}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4 mr-1.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Invite Keys Tab */}
          {activeTab === "keys" && (
            <Card className="glass border-border/30">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Invite Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Key prefix (default: HADES)"
                    value={newKeyPrefix}
                    onChange={(e) => setNewKeyPrefix(e.target.value)}
                    className="max-w-xs bg-secondary border-border"
                  />
                  <Button onClick={generateKey} disabled={generating} className="gradient-hades">
                    <Plus className="h-4 w-4 mr-1" />
                    Generate
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
                        <Button size="sm" variant="ghost" onClick={() => copyKey(k.key)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        {!k.is_used && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteKey(k.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {inviteKeys.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No invite keys yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <Card className="glass border-border/30">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((u) => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(u.created_at).toLocaleDateString()} · {u.hades_coins} coins
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscriptions Tab */}
          {activeTab === "subs" && (
            <Card className="glass border-border/30">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Subscriptions ({subs.length})
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
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>
                        {s.status}
                      </Badge>
                    </div>
                  ))}
                  {subs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No subscriptions yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
