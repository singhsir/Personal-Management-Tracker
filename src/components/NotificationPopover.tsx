import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  X,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: "warning" | "insight" | "income" | "bill";
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Budget Alert: Dining Out",
    message: "You have used 85% of your ₹10,000 Food & Dining budget for September.",
    time: "10m ago",
    unread: true,
    type: "warning",
  },
  {
    id: "notif-2",
    title: "AI Savings Milestone",
    message: "Great job! Your savings rate reached 35.8%, up 4.2% from last month.",
    time: "2h ago",
    unread: true,
    type: "insight",
  },
  {
    id: "notif-3",
    title: "Upcoming Subscription",
    message: "Netflix Premium (₹649) is scheduled for renewal in 3 days.",
    time: "1d ago",
    unread: true,
    type: "bill",
  },
  {
    id: "notif-4",
    title: "Salary Credited",
    message: "Monthly salary ₹85,000 was successfully categorized and added to income.",
    time: "3d ago",
    unread: false,
    type: "income",
  },
];

export default function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
    try {
      const saved = localStorage.getItem("finwise_notifications");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("finwise_notifications", JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "insight":
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      case "bill":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "income":
        return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Notifications"
        aria-label="Notifications"
        className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all shadow-sm ${
          open
            ? "bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700 border"
            : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 dark:bg-[#082226] dark:border-[#0f383e] dark:text-slate-300 dark:hover:bg-[#0c2c31]"
        }`}
      >
        <Bell className="w-5 h-5" />

        {/* RED DOT: ONLY shown when there is an active (unread) notification */}
        {unreadCount > 0 && (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-[#082226] animate-pulse" />
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#08262a] border border-slate-200 dark:border-[#103e45] rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-[#103e45] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} active
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 dark:bg-[#0c3137] dark:text-slate-400 text-[11px] font-medium px-2 py-0.5 rounded-full">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#0f383e]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-[#0b2f34] ${
                    item.unread
                      ? "bg-teal-50/30 dark:bg-teal-950/20"
                      : "opacity-80"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#0d343a] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs font-semibold truncate ${
                          item.unread
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Actions & Unread Indicator */}
                  <div className="flex flex-col items-center gap-1.5 self-center">
                    {item.unread ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Active notification" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                    )}
                    <button
                      onClick={(e) => deleteNotification(item.id, e)}
                      title="Dismiss"
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 dark:bg-[#061e22] border-t border-slate-100 dark:border-[#103e45] text-center">
              <button
                onClick={() => setNotifications([])}
                className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
