export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  expires_at?: string | null;
}

const builtInNotifications: SiteNotification[] = [
  {
    id: "static-sunday-service-2026-09-06",
    title: "Sunday Service — 6 September",
    message:
      "Join us tomorrow at 7:00 AM for Sunday Service at CC Hall with Pastor Muange Kiseku. Come ready to worship, fellowship and serve together.",
    type: "event",
    link: "/schedule",
    is_read: false,
    created_at: "2026-09-05T18:21:00+03:00",
    expires_at: "2026-09-06T23:59:59+03:00",
  },
];

export const getCurrentBuiltInNotifications = () => {
  const now = Date.now();
  return builtInNotifications.filter((notification) => {
    if (!notification.expires_at) return true;
    return new Date(notification.expires_at).getTime() >= now;
  });
};

export const mergeSiteNotifications = <T extends SiteNotification>(remote: T[]) => {
  const merged = new Map<string, SiteNotification>();

  for (const notification of getCurrentBuiltInNotifications()) {
    merged.set(notification.id, notification);
  }

  for (const notification of remote) {
    merged.set(notification.id, notification);
  }

  return [...merged.values()].sort((a, b) =>
    (b.created_at || "").localeCompare(a.created_at || ""),
  );
};
