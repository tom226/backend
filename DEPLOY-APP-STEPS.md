# Deploy the app and add app.nurserygreen.com

Follow these steps in order.

---

## Part 1: Build the app (create the `dist` folder)

1. Open **PowerShell** or **Command Prompt**.
2. Go to the app folder and build:

```powershell
cd "E:\VS Code Projects\Website Nursery green\NurseryGreenApp"
npm run export:web
```

3. When it finishes, you’ll have a **`dist`** folder inside `NurseryGreenApp`.  
   The folder contains `index.html` and other files. Don’t rename it.

---

## Part 2: Deploy to Vercel

### Method A — Deploy with Vercel website (no CLI)

1. Go to **[vercel.com](https://vercel.com)** and sign in (GitHub, Google, or email).
2. Click **“Add New…”** → **“Project”**.
3. You’ll see “Import Git Repository”.  
   - If your code is **on GitHub**: import that repo, then in project settings set **Root Directory** to `NurseryGreenApp`, **Build Command** to `npm run export:web`, **Output Directory** to `dist`, and deploy.  
   - If your code is **not on GitHub**, use Method B (CLI) below.
4. After the first deploy, skip to **Part 3** to add **app.nurserygreen.com**.

### Method B — Deploy with Vercel CLI (using the `dist` folder)

1. Install Vercel CLI (one-time):

```powershell
npm i -g vercel
```

2. Deploy the **contents** of `dist` (so the site root is where `index.html` is):

```powershell
cd "E:\VS Code Projects\Website Nursery green\NurseryGreenApp\dist"
vercel --prod
```

3. When asked:
   - **“Set up and deploy?”** → Yes.
   - **“Which scope?”** → Your account.
   - **“Link to existing project?”** → Yes if you already have a Vercel project for this app; otherwise No and give a project name (e.g. `nursery-green-app`).
4. At the end you’ll see a URL like **`https://nursery-green-app-xxx.vercel.app`**. Open it to confirm the app loads.

---

## Part 3: Add app.nurserygreen.com in Vercel

1. In **[Vercel Dashboard](https://vercel.com/dashboard)**, open your **project** (the one you just deployed).
2. Go to **Settings** → **Domains**.
3. Under “Add domain”, type: **`app.nurserygreen.com`** and click **Add**.
4. Vercel will show something like:
   - **Name:** `app` (or `app.nurserygreen.com`)
   - **Value / Target:** `cname.vercel-dns.com`  
   Copy or note this **target** (each project can show a slightly different value).

---

## Part 4: Add the domain in your DNS

Your domain **nurserygreen.com** is managed somewhere (e.g. **Hostinger**, **Cloudflare**, **GoDaddy**, **Namecheap**). There you add a **CNAME** so that **app.nurserygreen.com** points to Vercel.

1. Log in to the place where **nurserygreen.com** DNS is managed.
2. Open **DNS** / **DNS Management** / **Records** for **nurserygreen.com**.
3. **Add a new record:**
   - **Type:** CNAME  
   - **Name / Host:** `app`  
     (Some panels want only `app`, others want `app.nurserygreen.com`. Use what your panel asks for subdomains.)
   - **Value / Target / Points to:** the value from Vercel (e.g. **`cname.vercel-dns.com`**)  
   - **TTL:** default (e.g. 3600 or Auto).
4. Save.

---

## Part 5: Wait and test

- DNS can take **5–30 minutes** (sometimes up to 48 hours).
- In Vercel → **Domains**, the domain will show as “Valid” when it’s ready.
- Then open **https://app.nurserygreen.com** in the browser. It should show your app.

---

## If you use Netlify instead of Vercel

1. Build the app (same as **Part 1**).
2. Go to **[app.netlify.com](https://app.netlify.com)** → **Add new site** → **Deploy manually**.
3. Drag the **entire `dist` folder** (or all files inside `dist`) into the drop zone. Deploy.
4. In the site **Domain settings**, add **app.nurserygreen.com** and follow Netlify’s instructions to add the CNAME in your DNS (same idea as Part 4: type CNAME, name `app`, target the one Netlify gives you).

---

## Quick checklist

- [ ] Ran `npm run export:web` in `NurseryGreenApp` and have a `dist` folder.
- [ ] Deployed `dist` to Vercel (or Netlify) and the default URL works.
- [ ] In Vercel (or Netlify), added **app.nurserygreen.com** in Domains.
- [ ] In your DNS, added CNAME **app** → **cname.vercel-dns.com** (or Netlify’s target).
- [ ] Waited a few minutes and opened **https://app.nurserygreen.com**.
