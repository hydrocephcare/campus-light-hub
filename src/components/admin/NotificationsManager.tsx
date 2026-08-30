import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Plus, Trash2, Eye, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  recipient_email: string | null;
}

interface RecentActivity {
  type: string;
  title: string;
  created_at: string;
  details?: string;
}

export const NotificationsManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "announcement",
    link: "",
  });

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime notifications
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
        const comment = payload.new as any;
        setRecentActivity(prev => [{
          type: 'comment',
          title: `New comment on ${comment.post_slug}`,
          created_at: comment.created_at,
          details: comment.content?.slice(0, 50) + '...'
        }, ...prev.slice(0, 9)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayer_requests' }, (payload) => {
        setRecentActivity(prev => [{
          type: 'prayer',
          title: 'New prayer request received',
          created_at: (payload.new as any).created_at,
        }, ...prev.slice(0, 9)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subscribers' }, (payload) => {
        setRecentActivity(prev => [{
          type: 'subscriber',
          title: `New subscriber: ${(payload.new as any).email}`,
          created_at: (payload.new as any).subscribed_at,
        }, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [notifRes, commentsRes, prayersRes, subscribersRes] = await Promise.all([
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("comments").select("post_slug, content, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("prayer_requests").select("created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("subscribers").select("email, subscribed_at").order("subscribed_at", { ascending: false }).limit(5),
      ]);

      if (notifRes.data) setNotifications(notifRes.data as Notification[]);
      
      // Build recent activity from various sources
      const activities: RecentActivity[] = [];
      
      commentsRes.data?.forEach(c => {
        activities.push({
          type: 'comment',
          title: `Comment on ${c.post_slug}`,
          created_at: c.created_at,
          details: c.content?.slice(0, 50) + '...'
        });
      });
      
      prayersRes.data?.forEach(p => {
        activities.push({
          type: 'prayer',
          title: 'Prayer request received',
          created_at: p.created_at,
        });
      });
      
      subscribersRes.data?.forEach(s => {
        activities.push({
          type: 'subscriber',
          title: `Subscriber: ${s.email}`,
          created_at: s.subscribed_at || '',
        });
      });
      
      // Sort by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 10));
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("notifications").insert({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        link: formData.link || null,
        is_read: false,
      });

      if (error) throw error;

      toast.success("Notification sent to all users!");
      setIsDialogOpen(false);
      setFormData({ title: "", message: "", type: "announcement", link: "" });
      fetchData();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
      toast.success("Notification deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'comment': return 'bg-blue-500';
      case 'event': return 'bg-green-500';
      case 'announcement': return 'bg-orange-500';
      case 'prayer': return 'bg-purple-500';
      case 'subscriber': return 'bg-teal-500';
      default: return 'bg-primary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Notifications & Activity</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label>Message *</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Notification message..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link (optional)</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/events or https://..."
                />
              </div>
              <Button onClick={handleSendNotification} disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to All Users
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(activity.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sent Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No notifications sent yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.slice(0, 20).map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{notif.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{notif.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive"
                          onClick={() => handleDelete(notif.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
