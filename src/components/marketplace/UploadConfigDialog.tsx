import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const CATEGORIES = ["PvP", "Bypass", "Movement", "HvH", "Utility"];

const configSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be under 50 characters"),
  description: z.string().max(300, "Description must be under 300 characters").optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().int().min(0, "Price cannot be negative").max(10000, "Max price is 10,000"),
});

interface UploadConfigDialogProps {
  onUploaded: () => void;
}

const UploadConfigDialog = ({ onUploaded }: UploadConfigDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("PvP");
  const [price, setPrice] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!user) return;

    const validation = configSchema.safeParse({ name, description, category, price });
    if (!validation.success) {
      toast({ title: "Validation error", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    if (!file) {
      toast({ title: "Missing file", description: "Please select a config file to upload.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Upload file
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("configs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Insert config record
      const { error: insertError } = await supabase
        .from("configs")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          category,
          price,
          file_path: filePath,
        });

      if (insertError) throw insertError;

      toast({ title: "Config uploaded!", description: "Your config is now listed on the marketplace." });
      setOpen(false);
      resetForm();
      onUploaded();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("PvP");
    setPrice(0);
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-hades gap-2">
          <Upload className="h-4 w-4" />
          Upload Config
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/30">
        <DialogHeader>
          <DialogTitle className="font-display">Upload Config</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Config" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this config do?" className="bg-secondary border-border resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price (Hades Coins)</Label>
              <Input type="number" min={0} max={10000} value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} className="bg-secondary border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Config File</Label>
            <Input type="file" accept=".json,.txt,.cfg,.yml,.yaml" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-secondary border-border" />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full gradient-hades">
            {loading ? "Uploading..." : "Upload Config"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadConfigDialog;
