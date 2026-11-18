# Sanad: Expo SDK 58 Notes

Verified against the Expo changelog and upgrade guide (SDK 58 released 15 Oct 2026). Re-check docs.expo.dev before each release.

## 1. Versions
- **Expo SDK 58**, **React Native 0.88**, built for the **iOS 27 SDK**.
- Strict TypeScript API is the default.

## 2. Setup Commands (npm only)
```bash
npx expo install expo@^58.0.0 --fix
npx expo-doctor@latest
npx expo install <package>      # always, for Expo/RN libraries
```
Never use pnpm, yarn, or bun. Keep `package-lock.json`.

## 3. Expo Go
- The store version of Expo Go moves to SDK 58 only, and the rollout lags the release.
- Sanad needs native modules (LiveKit, WebRTC) anyway, so **always use EAS development builds**.

## 4. iOS 27
- Scene-based UIKit life cycle is required and handled by `npx expo prebuild`.
- If you enabled `ios.enableSceneSupport` in `expo-build-properties` on SDK 57, **remove it**.
- Apps become resizable on iPhone: test layouts for varied sizes (including iPhone Duo).
- Use Expo Router `Stack` / `NativeTabs` for navigation.
- Review header appearance changes in the Router migration guide.

## 5. Android
- R8 is **on by default** for release builds.
- Test release builds early (LiveKit/WebRTC, Mux, Socket.io). If R8 breaks a library, add keep rules; as a last resort set `android.enableMinifyInReleaseBuilds` to `false` via `expo-build-properties`.

## 6. Expo Router
- Read the SDK 57 to 58 Router migration guide fully (static export metadata, custom routers, removed `expo-router/react-navigation` exports).
- Do not import from `expo-router/react-navigation`.

## 7. EAS
- The `sdk-58` and `latest` iOS image aliases point to the Xcode 27.1 image.
- If `eas.json` pins a specific image, change it to one of those, or remove it.
- Fingerprint defaults to the `balanced` preset (fewer needless native rebuilds).

## 8. Platform Limits
- macOS is not supported on SDK 58. Sanad targets iOS and Android only, so no impact.

## 9. Upgrade Policy
- Stay on SDK 58 for the whole MVP. Upgrade only after launch, using the official upgrade guide.
