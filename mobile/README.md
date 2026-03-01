# TNG Community Mobile (Expo)

Quick start:
1) Install deps: `npm install` (inside `mobile/`).
2) Run dev: `npx expo start` (scan QR with Expo Go on Android).
3) Login opens the existing web login page; it captures `token` and `user` from the redirect query, then uses the same backend API.

Stack:
- Expo + React Navigation
- Auth via in-app WebView (reuse web flow)
- API base: https://backend-production-f128.up.railway.app

Screens:
- Feed: loads `/api/community` every ~20s; like/comment hit API.
- Post: create simple text post (no image upload yet).
- Profile: edit name/city and logout.

Next steps to polish:
- Add image upload (Expo Image Picker + backend storage).
- Improve error handling and offline states.
- Replace polling with push (Pusher/Ably) if desired.
- Ship app icons/splash in `assets/` (placeholders now).
