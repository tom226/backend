import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';
import { logError } from './errorLogger';

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;
const UPDATE_NOTIFICATION_DATA_TYPE = 'ota-update-ready';

let updateInterval = null;
let notificationReceiveSubscription = null;
let notificationResponseSubscription = null;
let hasQueuedNotification = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function showUpdatePrompt() {
  Alert.alert(
    'Update Ready',
    'A new app update has been downloaded. Restart now to use the latest version.',
    [
      { text: 'Later', style: 'cancel' },
      {
        text: 'Restart Now',
        onPress: () => {
          Updates.reloadAsync().catch(async (error) => {
            await logError({
              source: 'ota-update',
              level: 'error',
              isFatal: false,
              error,
              context: { stage: 'reload-failed' },
            });
          });
        },
      },
    ]
  );
}

async function getNotificationPermissionStatus() {
  const existingPermissions = await Notifications.getPermissionsAsync();
  if (existingPermissions.granted) {
    return 'granted';
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  if (requestedPermissions.granted) {
    return 'granted';
  }

  return 'denied';
}

async function sendUpdateReadyNotification() {
  const permissionStatus = await getNotificationPermissionStatus();
  if (permissionStatus !== 'granted') {
    showUpdatePrompt();
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nursery Green Update Available',
      body: 'New features and fixes are ready. Tap to restart and apply update.',
      data: { type: UPDATE_NOTIFICATION_DATA_TYPE },
    },
    trigger: null,
  });
}

async function checkForOtaUpdateAndNotify() {
  if (__DEV__ || !Updates.isEnabled) {
    return;
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    if (!update.isAvailable) {
      return;
    }

    await Updates.fetchUpdateAsync();

    if (hasQueuedNotification) {
      return;
    }

    hasQueuedNotification = true;
    await sendUpdateReadyNotification();
  } catch (error) {
    await logError({
      source: 'ota-update',
      level: 'error',
      isFatal: false,
      error,
      context: { stage: 'check-or-fetch-failed' },
    });
  }
}

export async function startOtaUpdateManager() {
  if (__DEV__ || !Updates.isEnabled) {
    return () => {};
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  notificationReceiveSubscription = Notifications.addNotificationReceivedListener((notification) => {
    if (notification.request.content.data?.type === UPDATE_NOTIFICATION_DATA_TYPE) {
      showUpdatePrompt();
    }
  });

  notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    if (response.notification.request.content.data?.type === UPDATE_NOTIFICATION_DATA_TYPE) {
      showUpdatePrompt();
    }
  });

  await checkForOtaUpdateAndNotify();

  updateInterval = setInterval(() => {
    checkForOtaUpdateAndNotify();
  }, UPDATE_CHECK_INTERVAL_MS);

  return () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    if (notificationReceiveSubscription) {
      notificationReceiveSubscription.remove();
      notificationReceiveSubscription = null;
    }

    if (notificationResponseSubscription) {
      notificationResponseSubscription.remove();
      notificationResponseSubscription = null;
    }
  };
}
