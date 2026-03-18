import { useEffect, useState } from "react";
import { Bug, MessageSquare, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  username?: string;
}

interface Reply {
  id: string;
  report_id: string;
  user_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  username?: string;
}

const DashboardBugReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReports = async () => {
    let query = supabase.from("bug_reports").select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    if (data) {
      const withProfiles = await Promise.all(
        data.map(async (r: any) => {
          const { data: p } = await supabase.from("profiles").select("username").eq("user_id", r.user_id).single();
          return { ...r, username: p?.username || "Unknown" };
        })
      );
      setReports(withProfiles);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const fetchReplies = async (reportId: string) => {
    const { data } = await supabase.from("bug_report_replies").select("*").eq("report_id", reportId).order("created_at", { ascending: true });
    if (data) {
      const withProfiles = await Promise.all(
        data.map(async (r: any) => {
          const { data: p } = await supabase.from("profiles").select("username").eq("user_id", r.user_id).single();
          return { ...r, username: p?.username || "Unknown" };
        })
      );
      setReplies((prev) => ({ ...prev, [reportId]: withProfiles }));
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("bug_reports").update({ status }).eq("id", id);
    fetchReports();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("bug_reports").delete().eq("id", id);
    fetchReports();
    toast({ title: "Deleted", description: "Bug report removed." });
  };

  const handleReply = async (reportId: string) => {
    if (!user || !replyText.trim()) return;
    const { error } = await supabase.from("bug_report_replies").insert({
      report_id: reportId,
      user_id: user.id,
      message: replyText.trim(),
      is_admin_reply: true,
    });
    if (!error) {
      setReplyText("");
      fetchReplies(reportId);
    } else {
      toast({ title: "Error", description: "Failed to reply.", variant: "destructive" });
    }
  };

  const handleExpand = (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!replies[id]) fetchReplies(id);
    setReplyText("");
  };

  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    open: "destructive", in_progress: "default", resolved: "secondary", closed: "outline",
  };

  const statusLabels: Record<string, string> = {
    open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed",
  };

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-destructive" />
          <h3 className="font-display text-lg font-semibold text-foreground">Bug Reports</h3>
          {openCount > 0 && (
            <Badge variant="destructive" className="text-xs">{openCount} open</Badge>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-secondary/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bug className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No bug reports found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id} className="glass border-border/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleExpand(report.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-foreground truncate">{report.title}</span>
                      <Badge variant={statusVariant[report.status]}>{statusLabels[report.status] || report.status}</Badge>
                      <span className="text-xs text-muted-foreground capitalize">{report.priority}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      by {report.username} • {new Date(report.created_at).toLocaleDateString()}
                      {replies[report.id] && ` • ${replies[report.id].length} replies`}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {expandedId === report.id && (
                  <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <Button key={key} size="sm" variant={report.status === key ? "default" : "outline"} className={`text-xs h-7 ${report.status === key ? "gradient-hades" : ""}`} onClick={() => handleStatusChange(report.id, key)}>
                          {label}
                        </Button>
                      ))}
                    </div>

                    {(replies[report.id] || []).map((reply) => (
                      <div key={reply.id} className={`p-3 rounded-lg text-sm ${reply.is_admin_reply ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${reply.is_admin_reply ? "text-primary" : "text-foreground"}`}>{reply.username}</span>
                          {reply.is_admin_reply && <Badge className="text-xs h-5 gradient-hades">Staff</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground">{reply.message}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <Input
                        placeholder="Reply as staff..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="bg-secondary/50 border-border"
                        onKeyDown={(e) => { if (e.key === "Enter") handleReply(report.id); }}
                      />
                      <Button size="icon" onClick={() => handleReply(report.id)} className="gradient-hades shrink-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardBugReports;
