# Nursery Green — Step-by-Step Guide

Follow these steps in order to run the project locally.

---

## Prerequisites (one-time)

- **Node.js** (v18+ recommended)
- **MongoDB** running locally, or a connection string (e.g. MongoDB Atlas)
- **Git** (optional, for version control)

---

## Part A: Backend + Website

The backend serves both the API and the static website from the **project root** folder.

### Step 1 — Open project root

```powershell
cd "E:\VS Code Projects\Website Nursery green"
```

### Step 2 — Install backend dependencies

```powershell
npm install
```

*(Use semicolon `;` instead of `&&` if a command fails in PowerShell.)*

### Step 3 — Environment file

- Copy `.env.example` to `.env`
- Fill in at least:
  - `MONGODB_URI` (e.g. `mongodb://localhost:27017/nursery-green`)
  - `JWT_SECRET` (any long random string)
  - Optional: Google/Facebook OAuth, Razorpay, admin token

```powershell
copy .env.example .env
# Then edit .env in your editor
```

### Step 4 — Start MongoDB (if local)

- Start MongoDB service, or
- Use MongoDB Atlas and set `MONGODB_URI` in `.env`

### Step 5 — Start the backend server

```powershell
npm start
```

- Backend API: **http://localhost:5000**
- Website (same server): **http://localhost:5000**
- Health check: **http://localhost:5000/health**

Leave this terminal running.

---

## Part B: Mobile App (NurseryGreenApp)

Use a **second terminal**. The app can use the production API (Railway) or your local backend (see Step 8).

### Step 6 — Go to app folder and install

```powershell
cd "E:\VS Code Projects\Website Nursery green\NurseryGreenApp"
npm install
```

### Step 7 — Start Metro (dev server)

```powershell
npx expo start --dev-client --host lan --port 8081
```

- Press **a** for Android emulator/device  
- Press **i** for iOS simulator (Mac only)  
- Press **w** for web  
- Or scan QR code with Expo Go (if not using dev-client build)

### Step 8 — (Optional) Use local backend in the app

- By default the app uses: `https://backend-production-f128.up.railway.app`
- To use your local backend, in `NurseryGreenApp/src/api/client.js` set:
  - Android emulator: `BASE_URL = 'http://10.0.2.2:5000'`
  - Physical device / same network: `BASE_URL = 'http://YOUR_PC_IP:5000'`
  - Web: `BASE_URL = 'http://localhost:5000'`

### Step 9 — (Optional) Build and run Android natively

If you use a dev-client build (already configured):

```powershell
cd "E:\VS Code Projects\Website Nursery green\NurseryGreenApp"
npx expo run:android
```

---

## Quick reference

| What              | Command / URL |
|-------------------|----------------|
| Backend + site    | `npm start` in project root → http://localhost:5000 |
| Mobile Metro      | `npx expo start --dev-client --host lan --port 8081` in NurseryGreenApp |
| Health check      | http://localhost:5000/health |

---

## After setup — next steps

For production web deploy, Android/iOS builds, and security checklist, see **[NEXT-STEPS.md](./NEXT-STEPS.md)**.

---

## Troubleshooting

- **MongoDB connection error:** Check `MONGODB_URI` in `.env` and that MongoDB is running.
- **App “Network error”:** Ensure backend is running; if using local backend, check Step 8.
- **Blank screen on Android:** Use dev-client and ensure Metro is running (`npx expo start --dev-client`), then run the app.
