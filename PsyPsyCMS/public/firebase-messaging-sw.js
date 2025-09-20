/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications for PsyPsy CMS
 *
 * Features:
 * - Background notification handling
 * - Rich notification display
 * - Action button handling
 * - PIPEDA/Quebec Law 25 compliance logging
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration for Quebec Law 25 compliance
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'PsyPsy CMS Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icons/healthcare-icon-192.png',
    badge: '/icons/badge-72.png',
    image: payload.notification?.image,
    tag: payload.data?.id || 'psypsy-notification',
    requireInteraction: payload.data?.priority === 'urgent',
    vibrate: payload.data?.priority === 'urgent' ? [200, 100, 200, 100, 200] : [100, 50, 100],
    data: {
      ...payload.data,
      timestamp: Date.now(),
      url: getNotificationUrl(payload.data)
    },
    actions: getNotificationActions(payload.data)
  };

  // Show notification with enhanced options
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received: ', event);

  const notification = event.notification;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  // Handle action buttons
  if (event.action) {
    handleNotificationAction(event.action, data);
  } else {
    // Handle notification click (no action button)
    handleNotificationClick(data);
  }
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed: ', event);

  const data = event.notification.data || {};

  // Log notification dismissal for compliance
  logComplianceEvent('notification_dismissed', {
    notificationId: data.id,
    category: data.category,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get notification URL based on category and data
 */
function getNotificationUrl(data) {
  const baseUrl = self.location.origin;

  switch (data?.category) {
    case 'appointment':
      return `${baseUrl}/appointments/${data.appointmentId || ''}`;
    case 'reminder':
      return `${baseUrl}/appointments`;
    case 'alert':
    case 'emergency':
      return `${baseUrl}/notifications?alert=${data.id}`;
    case 'system':
      return `${baseUrl}/settings`;
    default:
      return `${baseUrl}/dashboard`;
  }
}

/**
 * Get notification actions based on category and priority
 */
function getNotificationActions(data) {
  const category = data?.category;
  const priority = data?.priority;

  switch (category) {
    case 'appointment':
      return [
        {
          action: 'confirm',
          title: '✓ Confirm',
          icon: '/icons/action-confirm.png'
        },
        {
          action: 'reschedule',
          title: '📅 Reschedule',
          icon: '/icons/action-calendar.png'
        }
      ];

    case 'alert':
    case 'emergency':
      return [
        {
          action: 'acknowledge',
          title: '⚠️ Acknowledge',
          icon: '/icons/action-acknowledge.png'
        },
        {
          action: 'escalate',
          title: '🚨 Escalate',
          icon: '/icons/action-escalate.png'
        }
      ];

    case 'reminder':
      return [
        {
          action: 'view',
          title: '👁️ View',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: '✖️ Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ];

    case 'system':
      return [
        {
          action: 'view',
          title: '📱 Open App',
          icon: '/icons/action-open.png'
        }
      ];

    default:
      return [
        {
          action: 'open',
          title: '📱 Open',
          icon: '/icons/action-open.png'
        }
      ];
  }
}

/**
 * Handle notification action button clicks
 */
function handleNotificationAction(action, data) {
  console.log(`Handling notification action: ${action}`, data);

  // Log action for compliance
  logComplianceEvent('notification_action', {
    action,
    notificationId: data.id,
    category: data.category,
    timestamp: new Date().toISOString()
  });

  switch (action) {
    case 'confirm':
      // Handle appointment confirmation
      handleAppointmentConfirmation(data);
      break;

    case 'reschedule':
      // Open reschedule interface
      openWindow(`/appointments/${data.appointmentId}/reschedule`);
      break;

    case 'acknowledge':
      // Mark alert as acknowledged
      handleAlertAcknowledgment(data);
      break;

    case 'escalate':
      // Escalate urgent notification
      handleNotificationEscalation(data);
      break;

    case 'view':
      // Open relevant page
      openWindow(getNotificationUrl(data));
      break;

    case 'dismiss':
      // Simply dismiss the notification (already closed)
      console.log('Notification dismissed via action');
      break;

    case 'open':
    default:
      // Default action - open app
      openWindow(getNotificationUrl(data));
      break;
  }
}

/**
 * Handle regular notification click (no action button)
 */
function handleNotificationClick(data) {
  console.log('Handling notification click', data);

  // Log click for compliance
  logComplianceEvent('notification_clicked', {
    notificationId: data.id,
    category: data.category,
    timestamp: new Date().toISOString()
  });

  // Open appropriate URL
  const url = getNotificationUrl(data);
  openWindow(url);
}

/**
 * Open window or focus existing one
 */
function openWindow(url) {
  return clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clientList) => {
    // Check if app is already open
    for (const client of clientList) {
      if (client.url.includes(self.location.origin)) {
        // Focus existing window and navigate
        client.focus();
        client.postMessage({
          type: 'NAVIGATE',
          url: url
        });
        return;
      }
    }

    // Open new window if none found
    return clients.openWindow(url);
  });
}

/**
 * Handle appointment confirmation
 */
function handleAppointmentConfirmation(data) {
  // Send message to app to handle confirmation
  return clients.matchAll({ type: 'window' }).then((clientList) => {
    if (clientList.length > 0) {
      clientList[0].postMessage({
        type: 'APPOINTMENT_CONFIRM',
        appointmentId: data.appointmentId,
        notificationId: data.id
      });
    } else {
      // Open app to handle confirmation
      openWindow(`/appointments/${data.appointmentId}?action=confirm`);
    }
  });
}

/**
 * Handle alert acknowledgment
 */
function handleAlertAcknowledgment(data) {
  // Send message to app to handle acknowledgment
  return clients.matchAll({ type: 'window' }).then((clientList) => {
    if (clientList.length > 0) {
      clientList[0].postMessage({
        type: 'ALERT_ACKNOWLEDGE',
        alertId: data.id,
        notificationId: data.id
      });
    } else {
      // Open app to handle acknowledgment
      openWindow(`/notifications?alert=${data.id}&action=acknowledge`);
    }
  });
}

/**
 * Handle notification escalation
 */
function handleNotificationEscalation(data) {
  // Send message to app to handle escalation
  return clients.matchAll({ type: 'window' }).then((clientList) => {
    if (clientList.length > 0) {
      clientList[0].postMessage({
        type: 'NOTIFICATION_ESCALATE',
        notificationId: data.id,
        category: data.category
      });
    } else {
      // Open app to handle escalation
      openWindow(`/notifications?escalate=${data.id}`);
    }
  });
}

/**
 * Log compliance events for PIPEDA/Quebec Law 25
 */
function logComplianceEvent(event, data) {
  // In a real implementation, this would send to your compliance logging endpoint
  console.log(`Compliance Log: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...data
  });

  // Send to main app for proper logging
  clients.matchAll({ type: 'window' }).then((clientList) => {
    if (clientList.length > 0) {
      clientList[0].postMessage({
        type: 'COMPLIANCE_LOG',
        event,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });
    }
  });
}

/**
 * Handle push subscription changes
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed: ', event);

  // Get new subscription
  const newSubscription = self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'your-vapid-public-key'
  });

  // Send new subscription to server
  event.waitUntil(
    newSubscription.then((subscription) => {
      return clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'SUBSCRIPTION_CHANGED',
            subscription: subscription
          });
        }
      });
    })
  );
});

// Handle installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});