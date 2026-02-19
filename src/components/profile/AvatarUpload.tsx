import { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const AvatarUpload = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [canUseGif, setCanUseGif] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const roles = (data || []).map((r) => r.role);
      setCanUseGif(roles.includes("owner") || roles.includes("admin") || roles.includes("moderator"));
    });
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = canUseGif
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: canUseGif ? "Please select an image file (JPEG, PNG, WebP, or GIF)." : "Please select an image file (JPEG, PNG, or WebP).",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      toast({ title: "Avatar updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const acceptTypes = canUseGif ? "image/jpeg,image/png,image/webp,image/gif" : "image/jpeg,image/png,image/webp";

  return (
    <div className="relative group">
      <Avatar className="h-24 w-24 border-2 border-primary/50">
        <AvatarImage src={profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/20 text-primary text-2xl font-display">
          {profile?.username?.slice(0, 2).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
      <div
        className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <div className="h-5 w-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="h-6 w-6 text-foreground" />
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={acceptTypes}
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
};

export default AvatarUpload;
