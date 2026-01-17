"use client";

import React, { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useNotificationStore } from "@/features/social/stores/notification-store";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { getMessaging, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { incrementUnreadCount, setUnreadCount } = useNotificationStore();
  const { requestPermission, refreshToken, permission } = usePushNotifications();

  // 1. Fetch initial unread count
  useEffect(() => {
    if (!session?.user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/unread/count`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    fetchUnreadCount();
  }, [session, setUnreadCount]);

  // 2. Connect to SSE stream for real-time badge updates
  useEffect(() => {
    if (!session?.user) return;

    const controller = new AbortController();

    const connectSSE = async () => {
      await fetchEventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/stream`,
        {
          method: "GET",
          headers: {
            "Content-Type": "text/event-stream",
          },
          fetch: (url, init) => fetch(url, { ...init, credentials: "include" }),
          signal: controller.signal,
          onmessage(msg) {
            // Increment badge count for any notification event
            if (msg.data && msg.data !== "undefined") {
               incrementUnreadCount();
            }
          },
          onerror(err) {
            console.error("SSE Error:", err);
          },
        }
      );
    };

    connectSSE();

    return () => controller.abort();
  }, [session, incrementUnreadCount]);

  // 3. Refresh FCM token on every app load (per Firebase best practices)
  useEffect(() => {
    if (!session?.user) return;

    if (permission === "granted") {
      refreshToken();
    }
  }, [session, permission, refreshToken]);

  // 4. Auto-request push permission if not yet asked
  useEffect(() => {
    if (session?.user && permission === "default") {
      requestPermission();
    }
  }, [session, permission, requestPermission]);

  // 5. Handle foreground push notifications
  // Firebase only auto-displays notifications when app is in BACKGROUND
  // For FOREGROUND, we must manually show using Notification API
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (permission !== "granted") return;

    try {
      const messaging = getMessaging(app);
      
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("[Foreground] Push notification received:", payload);
        
        // Must manually show notification when app is in foreground
        if (payload.notification) {
          const { title, body } = payload.notification;
          const notification = new Notification(title || "New Notification", {
            body: body || "",
            icon: "/icon.png",
            data: payload.data,
          });

          // Handle notification click
          notification.onclick = () => {
            window.focus();
            const url = payload.data?.url || payload.fcmOptions?.link || "/feed/notifications";
            window.location.href = url;
            notification.close();
          };
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up foreground message handler:", error);
    }
  }, [permission]);

  return <>{children}</>;
}
