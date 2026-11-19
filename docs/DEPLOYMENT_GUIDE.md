# CareGap AI – Production Deployment Guide

This guide provides end-to-end instructions for deploying the **CareGap AI** platform to production environments.

The repository is hosted at:  
🔗 **[https://github.com/shashanks2223/Caregap](https://github.com/shashanks2223/Caregap)**

---

## Deployment Options Overview

| Platform | Best For | Architecture | Free Tier? | Difficulty |
|---|---|---|---|---|
| **Render (Recommended)** | Full-stack deployment in one place | FastAPI Web Service + React Static Site | Yes (Free Web Service & Static Site) | Easiest (1-Click Blueprint) |
| **Vercel + Render/Railway** | High-performance CDN frontend | Vercel (Frontend) + Render (Backend API) | Yes (Both have free tiers) | Easy |
| **Docker Compose (VPS)** | Self-hosted control (AWS, DigitalOcean, GCP) | PostgreSQL 16 + FastAPI + Nginx React | Depends on VPS ($4-6/mo) | Moderate |

---

## Method 1: Deploying to Render (Easiest Full-Stack Option)

Render allows you to deploy both the backend API and frontend React client from the same GitHub repository using the included `render.yaml` Blueprint.

### Step 1: Sign up and Connect GitHub
1. Go to [https://render.com](https://render.com) and create an account (or log in with GitHub).
2. In the Render Dashboard, click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `shashanks2223/Caregap`.

### Step 2: Configure Blueprint
Render will detect `render.yaml` and configure two services:
1. `caregap-backend` (Python 3.12 Web Service)
2. `caregap-frontend` (Static Site with SPA rewrites)

### Step 3: Set Environment Variables
In the Render dashboard for `caregap-backend`, configure:
- `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key from [https://aistudio.google.com/](https://aistudio.google.com/). *(If left blank, CareGap AI automatically uses built-in heuristic decision-support fallbacks)*.
- `JWT_SECRET_KEY`: *(Auto-generated or set any secure 32+ character random string)*.
- `CORS_ORIGINS`: Set to `["*"]` or your Render frontend URL (e.g. `["https://caregap-frontend.onrender.com"]`).

### Step 4: Click Apply
Render will build both services. Once finished:
- Backend will be available at: `https://caregap-backend.onrender.com` (Swagger UI at `/docs`).
- Frontend will be available at: `https://caregap-frontend.onrender.com`.

---

## Method 2: Deploying to Vercel (Frontend) + Render (Backend)

### Step 1: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\to$ **Web Service**.
3. Select `shashanks2223/Caregap`.
4. Configure service settings:
   - **Name:** `caregap-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `APP_ENV`: `production`
   - `JWT_SECRET_KEY`: `<any-strong-random-key>`
   - `CORS_ORIGINS`: `["*"]`
   - `GEMINI_API_KEY`: *(Your key or leave empty for heuristic fallback)*
6. Click **Deploy Web Service** and copy your backend URL (e.g., `https://caregap-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** $\to$ **Project**.
3. Import `shashanks2223/Caregap`.
4. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and choose `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://caregap-backend.onrender.com`).
6. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://caregap.vercel.app`).
*(Note: `frontend/vercel.json` is already configured in the repo with client-side SPA routing rewrites).*

---

## Method 3: Deploying with Docker Compose (Any Cloud VPS)

You can run CareGap AI on any Ubuntu / Debian VPS (DigitalOcean Droplet, AWS EC2, GCP Compute Engine, Hetzner, Linode) using the included `docker-compose.yml`.

### Step 1: SSH into your VPS
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install Docker & Docker Compose
```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### Step 3: Clone the Repository
```bash
git clone https://github.com/shashanks2223/Caregap.git
cd Caregap
```

### Step 4: Configure `.env`
```bash
cp .env.example .env
nano .env
```
Ensure your `JWT_SECRET_KEY` and optional `GEMINI_API_KEY` are specified.

### Step 5: Launch Services
```bash
docker compose up -d --build
```

### Step 6: Verify Containers
```bash
docker compose ps
```
- PostgreSQL 16 will run on internal port `5432`.
- Backend API will run on `http://YOUR_SERVER_IP:8000`.
- Frontend Nginx Web Server will run on `http://YOUR_SERVER_IP:5173` (or port `80` if configured).

---

## Post-Deployment Verification Checklist

1. **Verify Backend Health:**  
   Open `https://<YOUR_BACKEND_URL>/api/plans`. It should return a JSON array containing the 3 seeded illustrative insurance plans (`BASIC`, `PLUS`, `PREMIUM`).
2. **Verify Swagger API Docs:**  
   Open `https://<YOUR_BACKEND_URL>/docs`. All 15 API routers should be listed and interactive.
3. **Verify Demo Login:**  
   Open `https://<YOUR_FRONTEND_URL>/login` and click **Caregiver Demo Login** (`caregiver@caregap.demo` / `CareGap@2026!`). The Caregiver Dashboard with charts and active policies should appear immediately.
4. **Test 15-Day Placement Gap Claim:**  
   Go to `/caregiver/submit-claim`, select the 3rd tab **"15-Day Placement Gap"**, and submit a simulated claim. It will calculate ₹10,000 (15 days salary on ₹20,000 base) and show up in the claim tracking pipeline.
