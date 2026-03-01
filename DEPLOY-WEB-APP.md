# Deploy the Nursery Green app to a public URL

Use this to put the **Expo web app** online so anyone can open it at **app.nurserygreen.com** (or another URL you choose). Your main site stays at **nurserygreen.com**.

---

## Option A: Vercel (recommended, free)

### 1. Export the app (if you haven’t)

From the project root:

```powershell
cd "E:\VS Code Projects\Website Nursery green\NurseryGreenApp"
npm run export:web
```

Output will be in the `dist` folder.

### 2. Deploy to Vercel

**Option 2a — Deploy from your computer (no Git)**

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub/Google).
2. Install Vercel CLI (one-time):  
   `npm i -g vercel`
3. Deploy the `dist` folder:

   ```powershell
   cd "E:\VS Code Projects\Website Nursery green\NurseryGreenApp"
   vercel dist --prod
   ```

   When asked “Set up and deploy?” choose the same project or create one. You’ll get a URL like `nursery-green-xxx.vercel.app`.

**Option 2b — Deploy from Git (auto deploy on push)**

1. Push your code to GitHub (if not already).
2. In [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project** → Import your repo.
3. Set **Root Directory** to: `NurseryGreenApp`
4. **Build Command:** `npm run export:web`  
   **Output Directory:** `dist`
5. Deploy. Vercel will build and give you a URL.

### 3. Use your domain: app.nurserygreen.com

1. In Vercel: your project → **Settings** → **Domains**.
2. Add: **app.nurserygreen.com**
3. Vercel will show the DNS record you need (e.g. CNAME `app` → `cname.vercel-dns.com`).
4. In your domain DNS (where **nurserygreen.com** is managed — Hostinger, Cloudflare, etc.):
   - Add a **CNAME** record:
     - **Name/host:** `app` (or `app.nurserygreen.com` if the panel uses full name)
     - **Value/target:** the value Vercel shows (e.g. `cname.vercel-dns.com`)
5. Wait a few minutes for DNS to update. Vercel will issue SSL automatically.

After that, **https://app.nurserygreen.com** will serve your app.

---

## Option B: Netlify

1. Export the app:  
   `cd NurseryGreenApp` → `npm run export:web`
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**.
3. Drag the **NurseryGreenApp/dist** folder into the drop zone (or use Netlify CLI).
4. In **Domain settings** add **app.nurserygreen.com** and set the CNAME in your DNS as Netlify instructs.

---

## Option C: Hostinger (same host as nurserygreen.com)

If your main site is on Hostinger:

1. In Hostinger control panel, create a **subdomain**: `app.nurserygreen.com` pointing to a folder (e.g. `public_html/app` or a new subdomain root).
2. Export the app:  
   `cd NurseryGreenApp` → `npm run export:web`
3. Upload **all contents** of `NurseryGreenApp/dist/` into that subdomain’s public folder (so `index.html` is at the root of the subdomain).
4. Ensure the folder is set as the document root for `app.nurserygreen.com`.

---

## Troubleshooting: 404 DEPLOYMENT_NOT_FOUND

If you see **404 NOT_FOUND**, **Code: DEPLOYMENT_NOT_FOUND**:

1. **Redeploy** so a fresh deployment exists:
   - **CLI:** From `NurseryGreenApp` run: `vercel --prod` (deploys current directory) **or** `vercel dist --prod` (deploys the `dist` folder). Use the URL Vercel prints.
   - **Git:** In Vercel Dashboard → your project → **Deployments** → **Redeploy** the latest, or push a new commit to trigger a build.
2. **Use the right URL:** Open the **production** URL from Vercel (e.g. `nursery-green-xxx.vercel.app` or the one under **Domains**). Don’t use old preview URLs or deployment IDs.
3. **Custom domain:** In Vercel → **Settings** → **Domains**, ensure **app.nurserygreen.com** is added and points to this project. After a successful redeploy, the domain will serve the new deployment.

---

## After deployment

- The app already uses your production API: `https://backend-production-f128.up.railway.app` (in `NurseryGreenApp/src/api/client.js`). No change needed for that.
- To redeploy: run `npm run export:web` again and re-upload the new `dist` contents (or push to Git if you use Vercel/Netlify with Git).

---

## Quick reference

| Step              | Command / action |
|------------------|------------------|
| Export app       | `cd NurseryGreenApp` → `npm run export:web` |
| Deploy (Vercel)  | `cd NurseryGreenApp` → `vercel dist --prod` or connect repo with root `NurseryGreenApp`, build `npm run export:web`, output `dist` |
| Custom domain    | In Vercel/Netlify add **app.nurserygreen.com**; in DNS add CNAME `app` → value they give you |
