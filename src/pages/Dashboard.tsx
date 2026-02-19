import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardKeys from "@/components/dashboard/DashboardKeys";
import DashboardUsers from "@/components/dashboard/DashboardUsers";
import DashboardSubs from "@/components/dashboard/DashboardSubs";
import DashboardConfigs from "@/components/dashboard/DashboardConfigs";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold gradient-hades-text">Owner Dashboard</h1>
          </div>

          <Tabs defaultValue="keys">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="keys">Invite Keys</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="configs">Configs</TabsTrigger>
              <TabsTrigger value="subs">Subscriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="keys">
              <DashboardKeys />
            </TabsContent>
            <TabsContent value="users">
              <DashboardUsers />
            </TabsContent>
            <TabsContent value="configs">
              <DashboardConfigs />
            </TabsContent>
            <TabsContent value="subs">
              <DashboardSubs />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
