---
name: expo-native-change
description: Use when modifying app.json plugins, Info.plist keys, or entitlements. Guides through prebuild and dev-client rebuild.
---
# Procedure for changes that require a new Dev Client build

1. Update app.json or config plugin.
2. Run: `npx expo prebuild --clean -p ios`
3. Run: `cd ios && pod install && cd ..`
4. Rebuild dev client: `npx expo run:ios --device` (or `eas build -p ios --profile development`).
5. Reinstall on sim/device. Old JS-only reloads will NOT pick up native changes.
6. Add a 🚨 NATIVE CHANGE note in the PR body and commit message footer.
