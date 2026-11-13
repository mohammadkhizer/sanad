# Sanad: Developer Setup (npm only, no pnpm)

## 1. Prerequisites
- Node.js 20 LTS, **npm 10+**
- Git, Android Studio and/or Xcode
- `eas-cli` (`npm i -g eas-cli`), Expo account
- MongoDB (local or Atlas), Redis (local or hosted)

## 2. Rules
- Use `npm install` / `npm ci` / `npx expo install`. **Never use pnpm.**
- Commit `package-lock.json`. Do not commit `pnpm-lock.yaml`.
- Each `package.json` includes `"preinstall": "npx only-allow npm"` so a wrong package manager fails fast.

## 3. Bootstrap
```bash
# Monorepo root
mkdir sanad && cd sanad
npm init -y            # add: "workspaces": ["apps/*", "packages/*"]

# Mobile app
npx create-expo-app@latest apps/mobile --template default
cd apps/mobile
npx expo install expo-secure-store expo-camera expo-video expo-image-picker expo-notifications
npm install zustand @tanstack/react-query zod react-hook-form socket.io-client
npm install @livekit/react-native @livekit/react-native-webrtc livekit-client
npx expo install expo-dev-client
cd ../..

# API
mkdir -p apps/api && cd apps/api
npm init -y
npm install express mongoose zod jose argon2 otplib socket.io ioredis bullmq pino helmet cors express-rate-limit
npm install -D typescript tsx @types/node @types/express eslint prettier vitest supertest
```

## 4. Package.json Guard (each app)
```json
{
  "engines": { "node": ">=20", "npm": ">=10" },
  "scripts": { "preinstall": "npx only-allow npm" }
}
```

## 5. Run
```bash
# API
npm run dev --workspace apps/api

# Mobile (dev build, not Expo Go)
cd apps/mobile
npx expo prebuild
npx expo run:android      # or run:ios
npx expo start --dev-client
```

## 6. Build and CI
```bash
eas build --profile development --platform android
eas build --profile production --platform all
```
- CI uses `npm ci`, then `npm run lint`, `npm run typecheck`, `npm test`, `npm audit --audit-level=high`.
- EAS detects npm automatically from `package-lock.json`.

## 7. Common Pitfalls
- Live/calls crash in Expo Go: use a dev build.
- Mixed lockfiles: delete any `pnpm-lock.yaml` or `yarn.lock`, then run `npm install`.
- Use `npx expo install` (not plain `npm install`) for Expo-managed native packages to keep versions compatible.
