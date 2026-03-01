# How to push this project to Git (GitHub)

---

## If you don’t have a GitHub repo yet

1. Go to **[github.com](https://github.com)** and sign in.
2. Click **“+”** (top right) → **“New repository”**.
3. **Repository name:** e.g. `nursery-green` or `website-nursery-green`.
4. Choose **Public** (or Private).
5. **Do not** add a README, .gitignore, or license (you already have files).
6. Click **“Create repository”**.
7. On the new repo page you’ll see a URL like:
   - **HTTPS:** `https://github.com/YOUR_USERNAME/nursery-green.git`
   - **SSH:** `git@github.com:YOUR_USERNAME/nursery-green.git`  
   Copy the one you want to use (HTTPS is simpler if you haven’t set up SSH).

---

## Push your code from your computer

Open **PowerShell** or **Command Prompt** in the project folder and run these in order.

### 1. Go to the project folder

```powershell
cd "E:\VS Code Projects\Website Nursery green"
```

### 2. See what will be committed

```powershell
git status
```

You’ll see modified and untracked files. `.env` and `node_modules` are ignored and won’t be pushed.

### 3. Add all files you want to push

```powershell
git add .
```

To add only specific files instead:

```powershell
git add README.md NEXT-STEPS.md
```

### 4. Commit with a message

```powershell
git commit -m "Add deploy docs, README, fix PaymentScreen styles"
```

Use any short message that describes your changes.

### 5. Connect to GitHub (first time only)

Replace `YOUR_USERNAME` and `nursery-green` with your GitHub username and repo name:

**HTTPS:**
```powershell
git remote add origin https://github.com/YOUR_USERNAME/nursery-green.git
```

**SSH:**
```powershell
git remote add origin git@github.com:YOUR_USERNAME/nursery-green.git
```

If it says “remote origin already exists”, your repo is already connected. To change the URL:

```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/nursery-green.git
```

### 6. Push to GitHub

**If your branch is `add-shadows` (or any branch):**
```powershell
git push -u origin add-shadows
```

**If you want to push to `main` instead:**
```powershell
git checkout -b main
git push -u origin main
```

**Later, after the first push:**  
```powershell
git push
```

---

## Summary

| Step | Command |
|------|---------|
| Go to project | `cd "E:\VS Code Projects\Website Nursery green"` |
| Add files | `git add .` |
| Commit | `git commit -m "Your message"` |
| Add remote (once) | `git remote add origin https://github.com/USER/REPO.git` |
| Push | `git push -u origin add-shadows` (or `main`) |

---

## If Git asks for login

- **HTTPS:** GitHub will ask for username and **Personal Access Token** (not your password). Create one: GitHub → Settings → Developer settings → Personal access tokens.
- **SSH:** Use `git@github.com:...` and have an SSH key added to your GitHub account.
