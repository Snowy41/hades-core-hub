import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's purchased config IDs + own configs
    const [purchasesRes, ownRes] = await Promise.all([
      supabase.from("config_purchases").select("config_id").eq("user_id", user.id),
      supabase.from("configs").select("id, name, description, category, file_path, is_official, downloads, rating").eq("user_id", user.id),
    ]);

    const purchasedIds = (purchasesRes.data || []).map((p: any) => p.config_id);
    const ownConfigs = ownRes.data || [];

    let purchasedConfigs: any[] = [];
    if (purchasedIds.length > 0) {
      const { data } = await supabase
        .from("configs")
        .select("id, name, description, category, file_path, is_official, downloads, rating")
        .in("id", purchasedIds);
      purchasedConfigs = data || [];
    }

    // Merge and deduplicate
    const allConfigs = new Map();
    for (const c of [...ownConfigs, ...purchasedConfigs]) {
      allConfigs.set(c.id, c);
    }

    return new Response(JSON.stringify({ configs: Array.from(allConfigs.values()) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
