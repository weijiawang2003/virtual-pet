// Jest setup for the `ui` project. Loads RN-flavored mocks that jest-expo
// preset doesn't supply out of the box.

// Silence Reanimated v3+ warnings in tests (we don't render any animated views).
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

// expo-image is a native module (Nitro/Fabric); shim to a plain View so the
// renderer can compose layouts without booting RN. testID + style pass through.
jest.mock('expo-image', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  return {
    Image: (props: { testID?: string }) => React.createElement(View, props),
    ImageBackground: (props: { testID?: string }) => React.createElement(View, props),
  };
});

// expo-haptics is pure JS but exports types that touch native; stub it so the
// hook tests can verify the call shape without booting RN.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

// expo-router's NativeTabs alpha pulls react-native-screens; we don't render
// it in tests but mock to keep imports cheap.
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    // call once synchronously to mimic mount → focus.
    cb();
  },
  Stack: () => null,
  Tabs: () => null,
  Redirect: () => null,
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// expo-notifications is pure-native; mock the API surface our code touches.
// The fake NotificationProvider (in the providers tree under NODE_ENV=test)
// replaces this for tests that exercise schedule/cancel — but the module
// import itself still runs at file load time, so we need a non-throwing
// shim here too.
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('fake-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      granted: true,
      canAskAgain: true,
      status: 'granted',
      ios: { status: 2 /* AUTHORIZED */ },
    }),
  ),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({
      granted: true,
      canAskAgain: true,
      status: 'granted',
      ios: { status: 2 },
    }),
  ),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    CALENDAR: 'calendar',
    TIME_INTERVAL: 'timeInterval',
  },
  IosAuthorizationStatus: {
    NOT_DETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 3,
    EPHEMERAL: 4,
  },
}));
