import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { MessageCircleHeart, Trash2, User, Clock, Loader2, Eye, EyeOff } from "lucide-react";

interface PrayerRequest {
  id: string;
  name: string | null;
  email: string | null;
  request: string;
  is_anonymous: boolean | null;
  created_at: string;
}

export const PrayerRequestsManager = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedRequests, setRevealedRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching prayer requests:", error);
      toast.error("Failed to load prayer requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prayer request?")) return;

    try {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Prayer request deleted");
      fetchRequests();
    } catch (error) {
      console.error("Error deleting prayer request:", error);
      toast.error("Failed to delete prayer request");
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskText = (text: string) => {
    if (text.length <= 20) return "•".repeat(text.length);
    return text.substring(0, 20) + "•".repeat(Math.min(text.length - 20, 30)) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircleHeart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Prayer Requests</h2>
          <Badge variant="secondary" className="text-xs">{requests.length}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Click 👁 to reveal prayer content
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-8 text-center">
            <MessageCircleHeart className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No prayer requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {requests.map((request) => (
            <Card key={request.id} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {request.is_anonymous ? (
                      <Badge variant="outline" className="text-xs">Anonymous</Badge>
                    ) : request.name && (
                      <div className="flex items-center gap-1 text-foreground">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{request.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleReveal(request.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      {revealedRequests.has(request.id) ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(request.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className={`text-sm leading-relaxed ${revealedRequests.has(request.id) ? 'text-foreground' : 'text-muted-foreground/60 font-mono'}`}>
                  {revealedRequests.has(request.id) ? request.request : maskText(request.request)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
