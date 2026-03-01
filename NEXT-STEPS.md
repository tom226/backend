# Nursery Green — Next Steps

The app is working on web and mobile. Use this checklist to move toward production and distribution.

---

## 1. Production web app (deploy at app.nurserygreen.com)

- [ ] **Export static web build**  
  From `NurseryGreenApp` run:  
  `npm run export:web`  
  Output goes to `NurseryGreenApp/dist/`.

- [ ] **Deploy** using the step-by-step guide: **[DEPLOY-WEB-APP.md](./DEPLOY-WEB-APP.md)**  
  Options: **Vercel** (recommended), **Netlify**, or **Hostinger** (same host as nurserygreen.com). Add custom domain **app.nurserygreen.com** in your host’s dashboard and set the CNAME in DNS.

- [ ] **API:** The app already points to your Railway backend in `client.js`. No change needed unless you use a different API URL.

---

## 2. Android app (APK / Play Store)

- [ ] **Preview APK (internal testing):**  
  `cd NurseryGreenApp` then  
  `eas build --profile preview --platform android`  
  Download the APK from the EAS link and share with testers.

- [ ] **Production AAB (Play Store):**  
  `eas build --profile production --platform android`  
  Then upload the `.aab` in Google Play Console.

- [ ] **EAS credentials:** First time you run `eas build`, log in with Expo account and accept prompts to create credentials.

---

## 3. iOS app (TestFlight / App Store)

- [ ] **Apple Developer account** ($99/year) and App Store Connect app created.

- [ ] **Fill EAS submit config** in `NurseryGreenApp/eas.json`:  
  `appleId`, `ascAppId`, `appleTeamId` under `submit.production.ios`.

- [ ] **Build:**  
  `eas build --profile production --platform ios`  
  Then submit to TestFlight/App Store via EAS or manually.

---

## 4. Security & maintenance

- [ ] **Backend:** Run `npm audit` in project root; run `npm audit fix` (or fix manually if there are breaking changes).
- [ ] **App:** Run `npm audit` in `NurseryGreenApp`; fix as needed.
- [ ] **Secrets:** Ensure production `.env` (or host env vars) use strong `JWT_SECRET`, `ADMIN_TOKEN`, `KNOWLEDGE_ADMIN_TOKEN`; never commit `.env`.

---

## 5. Optional improvements

- **PWA:** Add a web manifest and service worker so the web app can be “installed” on phones.
- **Analytics:** Use the existing `/api/analytics` routes and wire events from the app.
- **Error tracking:** e.g. Sentry for backend and/or Expo (optional).

---

## Quick reference

| Goal              | Command / action |
|-------------------|------------------|
| Export web build  | `cd NurseryGreenApp` → `npm run export:web` |
| Android preview   | `cd NurseryGreenApp` → `eas build --profile preview --platform android` |
| Android production| `eas build --profile production --platform android` |
| iOS production   | `eas build --profile production --platform ios` |
| Local web dev     | `cd NurseryGreenApp` → `npx expo start --web --port 8082` |
| Mobile test URL   | `http://YOUR_PC_IP:8082` (same Wi‑Fi) |
