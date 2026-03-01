# The Nursery Green

Plant care e‑commerce and community: shop, plant scanner, energy insights, and community posts.

---

## What’s in this repo

| Part | Description |
|------|-------------|
| **Root (this folder)** | Node/Express backend + static marketing site (HTML/CSS/JS). Run `npm start` → API + site at http://localhost:5000 |
| **NurseryGreenApp/** | React Native (Expo) app for Android, iOS, and Web. Shared API with backend. |

- **Backend:** Auth (Google/Facebook), orders, payments (Razorpay), community, plant knowledge, chatbot, analytics.
- **Website:** thenurserygreen.com (marketing, contact, plant scanner, community).
- **App:** Shop, cart, checkout, scanner, energy, community, profile, orders.

---

## Quick start

1. **Backend + site:**  
   `npm install` → copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET` → `npm start` (port 5000).

2. **Mobile app (web):**  
   `cd NurseryGreenApp` → `npm install` → `npx expo start --web --port 8082` → open http://localhost:8082.

3. **Test on phone (same Wi‑Fi):**  
   Run the app as above, then on your phone open `http://YOUR_PC_IP:8082` (e.g. http://192.168.1.19:8082).

---

## Docs in this repo

- **[STEP-BY-STEP.md](./STEP-BY-STEP.md)** — Full setup and run instructions.
- **[NEXT-STEPS.md](./NEXT-STEPS.md)** — Production: web deploy, Android/iOS builds, security.
- **[NurseryGreenApp/PROGRESS.md](./NurseryGreenApp/PROGRESS.md)** — App audit and build status.

---

## Deploy the app to a public URL

To put the app online at **app.nurserygreen.com** (or another URL), see **[DEPLOY-WEB-APP.md](./DEPLOY-WEB-APP.md)**. Options: Vercel, Netlify, or Hostinger.

## Deployed

- **Site:** https://nurserygreen.com (or thenurserygreen.com)  
- **App (after deploy):** https://app.nurserygreen.com  
- **Backend API:** Railway (used by the app and site as configured).
