// Give the service worker access to Firebase Messaging.
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyDpM80CqP4bwU0jrYXqLo7TaO6J-wxCK4k",
  authDomain: "truescholar-c9c75.firebaseapp.com",
  projectId: "truescholar-c9c75",
  storageBucket: "truescholar-c9c75.firebasestorage.app",
  messagingSenderId: "278551071609",
  appId: "1:278551071609:web:d601fc8a476ba2a06c7da8",
});

// Retrieve an instance of Firebase Messaging so that it can handle
// background messages.
const messaging = firebase.messaging();

console.log("[firebase-messaging-sw.js] Service Worker initialized");

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] onBackgroundMessage received:",
    JSON.stringify(payload, null, 2)
  );

  // Extract notification data
  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: payload.messageId || `notification-${Date.now()}`,
    data: payload.data || {},
    requireInteraction: true,
  };

  console.log("[firebase-messaging-sw.js] Showing notification:", notificationTitle);

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Direct push event listener for debugging
self.addEventListener("push", function (event) {
  console.log("[firebase-messaging-sw.js] RAW push event received");
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log("[firebase-messaging-sw.js] Push payload:", JSON.stringify(payload, null, 2));
      
      // If Firebase SDK doesn't handle it, show notification manually
      // This is a fallback - Firebase SDK should handle it via onBackgroundMessage
    } catch (e) {
      console.log("[firebase-messaging-sw.js] Push data (text):", event.data.text());
    }
  } else {
    console.log("[firebase-messaging-sw.js] Push event has no data");
  }
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification click:", event);

  event.notification.close();

  // Get URL from notification data or default to notifications page
  const urlToOpen = event.notification.data?.url || "/feed/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If a window is already open, focus it
          if ("focus" in client) {
            return client.focus().then((focusedClient) => {
              if (focusedClient && "navigate" in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
            });
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("[firebase-messaging-sw.js] Service Worker installing...");
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw.js] Service Worker activating...");
  event.waitUntil(clients.claim());
});
