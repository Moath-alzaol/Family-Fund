import { Platform } from 'react-native';

let permissionPromise: Promise<boolean> | null = null;

async function prepareNativeNotifications() {
  if (Platform.OS === 'web') return false;
  if (permissionPromise) return permissionPromise;

  permissionPromise = (async () => {
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('family-fund', {
        name: 'Family Fund',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: '#C9A84C',
      });
    }

    const current = await Notifications.getPermissionsAsync();
    const result = current.granted ? current : await Notifications.requestPermissionsAsync();
    return result.granted;
  })().catch(() => false);

  return permissionPromise;
}

export async function initializeNativeNotifications() {
  await prepareNativeNotifications();
}

export async function presentNativeNotification(title: string, body: string, requestId: string) {
  if (!(await prepareNativeNotifications())) return;
  const Notifications = await import('expo-notifications');
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { requestId },
    },
    trigger: null,
  });
}
