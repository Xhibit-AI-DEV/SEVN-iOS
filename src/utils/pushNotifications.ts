import { PushNotifications } from '@capacitor/push-notifications';
import { projectId, publicAnonKey } from './supabase/info';

/**
 * Push Notification Service
 * Handles iOS/Android push notification registration and token management
 */

export interface PushNotificationToken {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
}

/**
 * Initialize push notifications
 * Call this when the app starts and user is logged in
 */
export const initializePushNotifications = async (userId: string, accessToken: string) => {
  console.log('📱 Initializing push notifications for user:', userId);

  try {
    // Request permission to use push notifications
    const permResult = await PushNotifications.requestPermissions();
    console.log('📱 Permission result:', permResult.receive);

    if (permResult.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
      console.log('📱 Push notification registration initiated');
    } else {
      console.warn('⚠️ Push notification permission denied');
      return false;
    }

    // Listen for registration success
    await PushNotifications.addListener('registration', async (token) => {
      console.log('📱 Push registration success, token:', token.value);
      
      // Send token to backend
      await registerDeviceToken(userId, token.value, accessToken);
    });

    // Listen for registration errors
    await PushNotifications.addListener('registrationError', (error) => {
      console.error('📱 Error on registration:', error);
    });

    // Listen for push notifications received
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📱 Push notification received:', notification);
      // You can show an in-app notification here if needed
    });

    // Listen for notification tap (when user taps the notification)
    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('📱 Push notification action performed:', notification);
      
      // Handle navigation based on notification data
      const data = notification.notification.data;
      if (data.orderId) {
        // Navigate to the order/message
        window.location.href = `/message-detail/${data.orderId}`;
      }
    });

    return true;
  } catch (error) {
    console.error('📱 Error initializing push notifications:', error);
    return false;
  }
};

/**
 * Register device token with backend
 */
const registerDeviceToken = async (userId: string, token: string, accessToken: string) => {
  try {
    console.log('📱 Registering device token with backend...');
    
    // Detect platform
    const platform = getPlatform();
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/push/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId,
          token,
          platform,
        }),
      }
    );

    if (response.ok) {
      console.log('✅ Device token registered successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to register device token:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error registering device token:', error);
    return false;
  }
};

/**
 * Unregister push notifications (call on logout)
 */
export const unregisterPushNotifications = async (userId: string, accessToken: string) => {
  try {
    console.log('📱 Unregistering push notifications...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/push/unregister`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (response.ok) {
      console.log('✅ Push notifications unregistered');
    }

    // Remove all listeners
    await PushNotifications.removeAllListeners();
  } catch (error) {
    console.error('❌ Error unregistering push notifications:', error);
  }
};

/**
 * Detect platform
 */
const getPlatform = (): 'ios' | 'android' | 'web' => {
  const userAgent = navigator.userAgent || navigator.vendor;
  
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios';
  } else if (/android/i.test(userAgent)) {
    return 'android';
  } else {
    return 'web';
  }
};

/**
 * Check if push notifications are supported
 */
export const isPushNotificationsSupported = (): boolean => {
  return 'PushNotifications' in window;
};
