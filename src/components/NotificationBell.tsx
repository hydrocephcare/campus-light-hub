import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

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
    // localStorage not available
  }
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setReadNotificationIds(readIds());
  }, []);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev.filter((item) => item.id !== newNotification.id)].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications((data as Notification[]) || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const unreadCount = notifications.filter((notification) => !readNotificationIds.has(notification.id)).length;

  const markAsRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const handleNotificationClick = useCallback((notification: Notification, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    markAsRead(notification.id);
    setIsOpen(false);
    navigate(`/notifications?notification=${encodeURIComponent(notification.id)}`);
  }, [markAsRead, navigate]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "comment": return "bg-blue-500";
      case "event": return "bg-green-500";
      case "announcement": return "bg-orange-500";
      default: return "bg-primary";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between gap-3 border-b border-border p-3">
          <div>
            <h4 className="font-semibold text-foreground">Notifications</h4>
            <p className="text-[11px] text-muted-foreground">{unreadCount} unread</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
          >
            View all
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => {
              const isRead = readNotificationIds.has(notification.id);
              return (
                <button
                  key={notification.id}
                  onClick={(e) => handleNotificationClick(notification, e)}
                  className={`w-full border-b border-border p-3 text-left transition-colors last:border-b-0 hover:bg-muted/50 ${!isRead ? "bg-primary/5" : "bg-background"}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${getTypeColor(notification.type)} ${isRead ? "opacity-35" : ""}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-3">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
