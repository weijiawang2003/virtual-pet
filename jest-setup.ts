// Jest setup for the `ui` project. Loads RN-flavored mocks that jest-expo
// preset doesn't supply out of the box.

// Silence Reanimated v3+ warnings in tests (we don't render any animated views).
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));

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
