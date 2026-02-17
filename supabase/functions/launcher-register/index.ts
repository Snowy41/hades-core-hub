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
    const { email, password, username, invite_key } = await req.json();
    if (!email || !password || !username || !invite_key) {
      return new Response(JSON.stringify({ error: "Email, password, username, and invite_key required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check invite key is valid and unused
    const { data: keyData } = await supabaseAdmin
      .from("invite_keys")
      .select("id")
      .eq("key", invite_key)
      .eq("is_used", false)
      .single();

    if (!keyData) {
      return new Response(JSON.stringify({ error: "Invalid or already used invite key" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark invite key as used
    await supabaseAdmin.rpc("validate_and_use_invite_key", {
      p_key: invite_key,
      p_user_id: authData.user.id,
    });

    return new Response(JSON.stringify({
      success: true,
      user_id: authData.user.id,
      message: "Account created successfully",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
