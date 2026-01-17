"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCheck } from "lucide-react";
import { useNotificationStore } from "@/features/social/stores/notification-store";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";

import { usePushNotifications } from "@/hooks/use-push-notifications";

export const NotificationList = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { markAllRead: updateStoreCount, decrementUnreadCount } =
    useNotificationStore();
  const { requestPermission, permission } = usePushNotifications();

  const { ref, inView } = useInView();

  const fetchNotifications = async (pageNum: number, isNew: boolean = false) => {
    if (!session?.user) return; // Check for user instead of token

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications?page=${pageNum}&limit=20`,
        {
            credentials: "include"
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length < 20) setHasMore(false);
        setNotifications((prev) => (isNew ? data : [...prev, ...data]));
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, true);
  }, [session]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((p) => p + 1);
      fetchNotifications(page + 1);
    }
  }, [inView]);

  const handleMarkAllRead = async () => {
    if (!session?.user) return; // Check for user instead of token
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: "POST",
        credentials: "include"
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      updateStoreCount();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    decrementUnreadCount();

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {
          method: "POST",
          credentials: "include"
        }
      );
    } catch (error) {
        // Revert on error if critical, but for read status usually fine to ignore
        console.error("Failed to mark read");
    }
  };

  const handleDelete = async (id: string) => {
      // Implement delete logic if needed
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border shadow-sm min-h-[50vh]">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 rounded-t-lg">
        <h2 className="font-semibold text-lg">Notifications</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllRead}
          className="text-muted-foreground hover:text-foreground"
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {permission === "default" && (
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Enable push notifications to stay updated
            </p>
            <Button size="sm" variant="outline" onClick={requestPermission}>
              Enable Notifications
            </Button>
          </div>
        </div>
      )}

      <div className="divide-y">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleRead}
              onDelete={handleDelete}
            />
          ))
        )}
        
        {hasMore && (
          <div ref={ref} className="p-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};
