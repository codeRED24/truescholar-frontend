"use client";

import { useEffect, useState, useCallback } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";
import { getSession } from "@/lib/auth-client";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const registerToken = useCallback(async (token: string) => {
    try {
      const session = await getSession();
      if (!session?.data?.user) return false;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token, deviceType: "web" }),
      });

      return res.ok;
    } catch (error) {
      console.error("Failed to register device token:", error);
      return false;
    }
  }, []);

  // Refresh token on every call (per Firebase best practices)
  // This should be called on every app load
  const refreshToken = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return null;
    if (Notification.permission !== "granted") return null;
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      console.warn("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY");
      return null;
    }

    try {
      setIsRegistering(true);
      const messaging = getMessaging(app);
      
      // getToken() is cached - only makes network call if token changed
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log("FCM Token refreshed");
        await registerToken(token);
        return token;
      }
    } catch (error) {
      console.error("Error refreshing FCM token:", error);
    } finally {
      setIsRegistering(false);
    }

    return null;
  }, [registerToken]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      console.error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY in environment variables");
      return;
    }

    try {
      setIsRegistering(true);
      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      setPermission(permission);
      console.log("Notification permission:", permission);

      if (permission === "granted") {
        const messaging = getMessaging(app);
        console.log("Getting FCM token...");

        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (token) {
            console.log("FCM Token generated");
            await registerToken(token);
          } else {
            console.warn("No FCM token generated");
          }
        } catch (tokenError) {
          console.error("Error getting FCM token:", tokenError);
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRegistering(false);
    }
  }, [registerToken]);

  return { permission, requestPermission, refreshToken, isRegistering };
}
