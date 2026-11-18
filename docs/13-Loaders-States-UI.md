# Sanad: Pre-loaders, Skeletons and State Screens

Code lives in `ui-kit/`. It was type-checked with strict TypeScript against React Native 0.88 (the Expo SDK 58 version). Expo module types (router, network, icons) were stubbed in that check, so run `npx tsc --noEmit` once inside your real project.

## 1. What Is Included

| Piece | File | Used for |
|---|---|---|
| Brand mark (SVG) | `src/components/brand/SanadMark.tsx` | Logo everywhere; arch + chain of links, gold top link = verified scholar |
| **Brand loader** | `loaders/BrandLoader.tsx` | App launch: breathing logo, gold pulse ring, status text, Try again |
| Cold-start messages | `loaders/useColdStartStatus.ts` | Escalating text while a sleeping free API host wakes (4 s, 12 s, 45 s) |
| Chain dots | `loaders/ChainDots.tsx` | Buttons, load-more footers, video buffering, "processing" state |
| Skeleton + group | `loaders/Skeleton.tsx` | Shared shimmer, reduced-motion safe, one "Loading" announcement for screen readers |
| Skeleton screens | `loaders/Skeletons.tsx` | Feed, Reel, Profile, Grid (profile/saved), Chat list, Notifications, Comments |
| Upload progress | `loaders/UploadProgress.tsx` | Uploading / processing / done / error, cancel and retry |
| **404 screen** | `states/StatusScreen.tsx` (`NotFoundScreen`) + `app/+not-found.tsx` | Unknown routes and broken share links; "4 [logo] 4" |
| Status screens | `states/StatusScreen.tsx` | 403 scholars-only, verification pending, suspended, offline, 500, maintenance, uploads paused, post unavailable, empty feed/saved/notifications |
| Offline banner | `states/OfflineBanner.tsx` | Thin banner while there is no connection |
| Route error boundary | `states/RouteErrorBoundary.tsx` | Catches render errors; hides raw error text in production |
| No-flicker hook | `hooks/useSkeletonVisible.ts` | Skeleton only after 250 ms, kept at least 400 ms |
| Tokens | `theme/tokens.ts` | 60:30:10 colours (light and dark), spacing, radii |
| Brand files | `assets/brand/` | `icon.png`, `adaptive-foreground.png`, `splash-mark(.dark).png`, SVG sources |
| Wiring example | `app/_layout.tsx`, `app.json.snippet.json` | Splash hand-off, offline banner, error boundary |

## 2. Install (npm only, SDK 58)

```bash
cd apps/mobile
npx expo install react-native-svg expo-linear-gradient expo-splash-screen expo-network @expo/vector-icons react-native-safe-area-context expo-status-bar
```
- Copy `ui-kit/src` into your app and `ui-kit/app/+not-found.tsx` into your routes folder.
- Merge `app.json.snippet.json` into `app.json` and copy `assets/brand/` into `assets/`.
- If your template keeps routes in `src/app`, fix the relative import paths.
- The splash plugin and icons are native config, so **make a new EAS development build** after merging.
- No Reanimated needed: everything uses React Native's built-in `Animated` (native driver), which keeps SDK 58 compatibility risk low.

## 3. Launch Sequence

1. **Native splash** (static logo on ivory, or on dark in dark mode). Image width 112 pt.
2. `SplashScreen.hide()` as soon as React renders, with a short fade.
3. **BrandLoader** appears with the same logo size and position, so the hand-off looks like one continuous screen.
4. Bootstrap runs (restore session, call API, fonts). On a free host this can take up to a minute.
5. `useColdStartStatus` escalates the message: nothing, then "Connecting…" (4 s), "Starting up. The first launch can take up to a minute." (12 s), then "This is taking longer than usual." with **Try again** (45 s).
6. App shows. The offline banner and error boundary are already mounted.

## 4. Which Loader Where

| Situation | Use |
|---|---|
| App start | Native splash, then `BrandLoader` |
| List or screen with a known layout | Skeleton (`FeedSkeleton`, `ProfileSkeleton`, ...) |
| Reels while the first video loads | `ReelSkeleton`, then poster image, then video |
| Video buffering | Poster stays visible, `ChainDots` overlay |
| Load more at the end of a list | `ChainDots` in the list footer |
| Pull to refresh | `RefreshControl` with `tintColor` / `colors` set to the gold accent |
| Button action (follow, apply, send) | `ChainDots` inside the button, button disabled |
| File upload | `UploadProgress` with real progress |
| Image not loaded yet | Skeleton-colour background, then `expo-image` with a short transition |

## 5. Which State Screen Where

| Trigger | Screen |
|---|---|
| URL matches no route | `+not-found` (404) |
| API returns 404 for a valid route (post deleted) | `postUnavailable` |
| API returns 403 on a scholar-only action | `forbidden` ("Scholars only") |
| Application status is pending | `verificationPending` |
| Account suspended | `suspended` (links to Code of Conduct and support) |
| No connection | `OfflineBanner` over cached content; `offline` full screen if there is no cache |
| API 5xx or render error | `serverError` / `RouteErrorBoundary` with retry |
| Maintenance flag from the API | `maintenance` |
| Quota Guardian blocks uploads | `uploadsPaused` (draft saved, no technical detail shown) |
| Empty lists | `emptyFeed`, `emptySaved`, `emptyNotifications` |

## 6. Rules
- **Skeleton, not spinner,** wherever the layout is known. Spinners only for actions.
- **No flicker:** wrap with `useSkeletonVisible` (250 ms delay, 400 ms minimum).
- **Reduced motion:** every animation checks the OS setting and renders static.
- **Accessibility:** one "Loading" announcement per skeleton group, status text in a polite live region, touch targets at least 44 pt (buttons 48 pt), icons hidden from screen readers.
- **Colour:** gold buttons use dark text (`#1F2933`), because white on gold fails contrast. Dark mode uses a lighter emerald for the logo so it stays visible.
- **Copy:** calm and short; never show stack traces or internal limits (for example "free tier") to users.
- **Performance:** one shared shimmer clock for all skeletons on screen; no per-block loops.
- **RTL:** layouts use flex and `marginStart`-style spacing, so Arabic and Urdu mirror correctly (verify on device).

## 7. Brand Notes
- The mark: an arch holding a chain of three links. The top link is gold, echoing the verified badge.
- Light: emerald `#0F4C45` on ivory `#F8F5EE`. Dark: mint `#6FC2B2` on `#0E1512`. Gold `#C9A227` in both.
- Icon: mark centred on ivory (1024 px). Android adaptive foreground keeps the mark inside the safe zone.
- These are first-draft brand assets for the zero-budget phase. Replace them if you commission a designer later; only the files in `assets/brand/` and `SanadMark.tsx` change.
