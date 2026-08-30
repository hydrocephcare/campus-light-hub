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

const DISMISSED_KEY = "mkucu_dismissed_notifications";
const REMOVED_KEY = "mkucu_removed_notifications";

const readIds = (key: string): Set<string> => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const writeIds = (key: string, ids: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // localStorage not available
  }
};

// Seen = badge cleared, item still readable in the list
const getDismissedIds = () => readIds(DISMISSED_KEY);
const saveDismissedIds = (ids: Set<string>) => writeIds(DISMISSED_KEY, ids);

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    setDismissedIds(getDismissedIds());
    setRemovedIds(readIds(REMOVED_KEY));
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
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

  // `dismissedIds` = seen (badge cleared). `removedIds` = explicitly cleared from the list.
  const visibleNotifications = notifications.filter(n => !removedIds.has(n.id));
  const unreadCount = notifications.filter(n => !dismissedIds.has(n.id) && !removedIds.has(n.id)).length;

  const dismissNotification = useCallback((id: string) => {
    setRemovedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      writeIds(REMOVED_KEY, next);
      return next;
    });
  }, []);

  const handleNotificationClick = useCallback((notification: Notification, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Remove this notification for this device
    dismissNotification(notification.id);

    // Navigate: use window.open for external links, navigate for internal
    if (notification.link) {
      if (notification.link.startsWith("http://") || notification.link.startsWith("https://")) {
        window.open(notification.link, "_blank", "noopener,noreferrer");
      } else {
        navigate(notification.link);
      }
    }
    setIsOpen(false);
  }, [dismissNotification, navigate]);

  const dismissAll = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id));
    setRemovedIds(prev => {
      const next = new Set([...prev, ...allIds]);
      writeIds(REMOVED_KEY, next);
      return next;
    });
  }, [notifications]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'comment': return 'bg-blue-500';
      case 'event': return 'bg-green-500';
      case 'announcement': return 'bg-orange-500';
      default: return 'bg-primary';
    }
  };

  // When the popover is opened, immediately clear the badge by marking
  // currently-visible notifications as dismissed for this device.
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      const visibleIds = notifications
        .filter((n) => !dismissedIds.has(n.id))
        .map((n) => n.id);
      if (visibleIds.length > 0) {
        // Defer so the user still sees the items inside the popover this session
        setTimeout(() => {
          setDismissedIds((prev) => {
            const next = new Set([...prev, ...visibleIds]);
            saveDismissedIds(next);
            return next;
          });
        }, 100);
      }
    }
  }, [notifications, dismissedIds]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-foreground">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {visibleNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No new notifications
            </div>
          ) : (
            visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={(e) => handleNotificationClick(notification, e)}
                className="w-full p-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 bg-primary/5"
              >
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getTypeColor(notification.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        {visibleNotifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={dismissAll}
            >
              Dismiss all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
