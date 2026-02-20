"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { NotificationItem } from "./NotificationItem";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCheck } from "lucide-react";
import { useNotificationStore } from "@/features/social/stores/notification-store";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import { fetchJson } from "@/lib/api-fetch";
import type { Notification as SocialNotification } from "../../types";

import { usePushNotifications } from "@/hooks/use-push-notifications";

export const NotificationList = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { markAllRead: updateStoreCount, decrementUnreadCount } =
    useNotificationStore();
  const { requestPermission, permission } = usePushNotifications();

  const { ref, inView } = useInView();

  const fetchNotifications = useCallback(
    async (pageNum: number, isNew: boolean = false) => {
      if (!session?.user) return;

      setLoading(true);
      try {
        const result = await fetchJson<SocialNotification[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications?page=${pageNum}&limit=20`,
        );
        if (result.error) {
          console.error("Failed to fetch notifications", result.error);
          return;
        }

        const data = result.data ?? [];
        if (data.length < 20) setHasMore(false);
        setNotifications((prev) => (isNew ? data : [...prev, ...data]));
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    },
    [session?.user],
  );

  useEffect(() => {
    if (!session?.user) {
      setNotifications([]);
      setHasMore(true);
      setLoading(false);
      return;
    }

    setPage(1);
    setHasMore(true);
    fetchNotifications(1, true);
  }, [fetchNotifications, session?.user]);

  useEffect(() => {
    if (inView && hasMore && !loading && session?.user) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  }, [fetchNotifications, hasMore, inView, loading, page, session?.user]);

  const handleMarkAllRead = async () => {
    if (!session?.user) return; // Check for user instead of token
    try {
      const result = await fetchJson<{ success: boolean }>(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
        {
        method: "POST",
        },
      );

      if (result.error) {
        toast.error("Failed to mark all as read");
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      updateStoreCount();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
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
      const result = await fetchJson<{ success: boolean }>(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {
          method: "POST",
        },
      );

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
        // Revert on error if critical, but for read status usually fine to ignore
        console.error("Failed to mark read", error);
    }
  };

  const handleDelete = async (id: string) => {
      void id;
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
