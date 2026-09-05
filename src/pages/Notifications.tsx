import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useSEO } from "@/hooks/useSEO";
import { mergeSiteNotifications } from "@/data/siteNotifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const READ_KEY = "mkucu_dismissed_notifications";

const readIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem(READ_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids: Set<string>) => {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("notification");

  useSEO({
    title: "Notifications | MKU Christian Union",
    description: "Church notices, announcements and updates from MKU Christian Union.",
    url: "https://mkucuu.lovable.app/notifications",
  });

  useEffect(() => {
    setRead(readIds());

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        setNotifications(mergeSiteNotifications((data as Notification[]) || []) as Notification[]);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications(mergeSiteNotifications([]) as Notification[]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setRead((prev) => {
      const next = new Set(prev);
      next.add(selectedId);
      saveReadIds(next);
      return next;
    });
  }, [selectedId]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !read.has(item.id)).length,
    [notifications, read],
  );

  const markAllRead = () => {
    const next = new Set(notifications.map((item) => item.id));
    setRead(next);
    saveReadIds(next);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <Bell className="h-4 w-4" /> Church updates
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="font-serif text-4xl font-bold md:text-5xl">Notifications</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                    Read complete church announcements and updates. Opening a notification marks it as read; it is not deleted.
                  </p>
                </div>
                {notifications.length > 0 && (
                  <Button variant="outline" onClick={markAllRead} className="gap-2 self-start sm:self-auto">
                    <CheckCheck className="h-4 w-4" /> Mark all as read
                  </Button>
                )}
              </div>
              {!loading && notifications.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          <div className="mx-auto max-w-4xl space-y-4">
            {loading ? (
              <Card className="p-6 text-sm text-muted-foreground">Loading notifications...</Card>
            ) : notifications.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</Card>
            ) : (
              notifications.map((notification) => {
                const isRead = read.has(notification.id);
                const isSelected = notification.id === selectedId;

                return (
                  <Card
                    key={notification.id}
                    id={`notification-${notification.id}`}
                    className={`p-5 transition-shadow ${isSelected ? "ring-2 ring-primary" : ""} ${!isRead ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${!isRead ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="font-semibold text-foreground">{notification.title}</h2>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {!isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRead((prev) => {
                                  const next = new Set(prev);
                                  next.add(notification.id);
                                  saveReadIds(next);
                                  return next;
                                });
                              }}
                            >
                              Mark as read
                            </Button>
                          )}
                          {notification.link && (
                            <Button asChild variant="outline" size="sm" className="gap-2">
                              <a
                                href={notification.link}
                                target={notification.link.startsWith("http") ? "_blank" : undefined}
                                rel={notification.link.startsWith("http") ? "noopener noreferrer" : undefined}
                              >
                                Open related page <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
