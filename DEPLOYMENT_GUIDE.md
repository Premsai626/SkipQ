# 🚀 SkipQ Production Deployment Runbook (Vercel + Render + Supabase)

This runbook provides complete, step-by-step instructions to deploy **SkipQ** into production using **Vercel** (Frontend) and **Render** (Backend), backed by your configured **Supabase** instance.

---

## 🏗️ Architecture Overview

```mermaid
graph LR
    User[Student / Staff Browser] -->|HTTPS| Vercel[Vercel Frontend CDN (React + Vite)]
    Vercel -->|REST API Requests| Render[Render Web Service (Express Node.js)]
    Render -->|PostgreSQL & Storage SDK| Supabase[(Supabase Database & Storage)]
    Render -->|Generative AI Requests| Gemini[Google Gemini AI API]
```

- **Frontend URL**: [https://skip-q-theta.vercel.app](https://skip-q-theta.vercel.app) (Vercel Global Edge CDN)
- **Backend API**: [https://skipq-backend-pvl2.onrender.com](https://skipq-backend-pvl2.onrender.com) (Render Web Service)
- **Database & Storage**: [https://tbhtcibeuvgpruyofrck.supabase.co](https://tbhtcibeuvgpruyofrck.supabase.co) (Supabase PostgreSQL + Storage)
- **Source Code**: [https://github.com/Premsai626/SkipQ](https://github.com/Premsai626/SkipQ) (Branch `main`)

---

## 🟢 Live Production Endpoints

| Component | Status | Production URL |
|---|---|---|
| **Frontend Application** | 🟢 **ACTIVE** | [https://skip-q-theta.vercel.app](https://skip-q-theta.vercel.app) |
| **Backend REST API** | 🟢 **ACTIVE** | [https://skipq-backend-pvl2.onrender.com](https://skipq-backend-pvl2.onrender.com) |
| **API Health Check** | 🟢 **200 OK** | [https://skipq-backend-pvl2.onrender.com/health](https://skipq-backend-pvl2.onrender.com/health) |
| **Supabase Diagnostic** | 🟢 **CONNECTED** | [https://skipq-backend-pvl2.onrender.com/api/v1/supabase/status](https://skipq-backend-pvl2.onrender.com/api/v1/supabase/status) |

---

## 📋 Part 1: Deploy Backend to Render

### Method A: Using Render Blueprints (Recommended & Fastest)

Because `render.yaml` is already configured in the repository root, you can deploy using Render's Blueprint feature:

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub repository: `Premsai626/SkipQ`.
4. Render will parse [`render.yaml`](file:///c:/Users/prem%20sai/OneDrive/Desktop/xerox-antigravity/render.yaml) automatically and detect `skipq-backend`.
5. Under **Environment Variables**, fill in the following values (copied from your local `backend/.env`):

| Key | Recommended Value | Source |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `DATABASE_DRIVER` | `supabase` | Uses Supabase PostgreSQL |
| `STORAGE_DRIVER` | `supabase` | Uses Supabase Storage |
| `SUPABASE_STORAGE_BUCKET` | `xerox-documents` | Storage bucket name |
| `SUPABASE_URL` | *Your Supabase Project URL* | Found in `backend/.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | *Your Supabase Service Role Key* | Found in `backend/.env` |
| `SUPABASE_ANON_KEY` | *Your Supabase Anon Key* | Found in `backend/.env` |
| `ALLOW_VERCEL_PREVIEWS` | `true` | Allows all `*.vercel.app` domains through CORS |
| `GEMINI_API_KEY` | *Your Gemini API Key* | Found in `backend/.env` |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Gemini model name |
| `JWT_SECRET` | *(Render will auto-generate a secure random 32+ character key)* | Used to sign auth tokens |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` *(update once Vercel is deployed)* | CORS origin |

6. Click **Apply**.
7. Render will install dependencies, launch the server, and verify the `/health` endpoint.
8. Once deployed, copy your Render service URL:
   `https://skipq-backend.onrender.com` (or your assigned subdomain).

---

### Method B: Manual Web Service Creation on Render

If you prefer setting up manually without the blueprint:

1. Click **New +** -> **Web Service**.
2. Select your GitHub repository: `Premsai626/SkipQ`.
3. Configure the service settings:
   - **Name**: `skipq-backend`
   - **Region**: Closest to your users (e.g., *Singapore* or *Oregon*)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Plan**: `Free`
4. Expand **Advanced**:
   - **Health Check Path**: `/health`
5. Add the Environment Variables listed in the table above.
6. Click **Create Web Service**.

---

## ⚡ Part 2: Deploy Frontend to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Premsai626/SkipQ`.
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add the following 3 variables:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://skipq-backend-pvl2.onrender.com/api/v1` | Live Render backend endpoint |
| `VITE_SUPABASE_URL` | `https://tbhtcibeuvgpruyofrck.supabase.co` | Found in root `.env` |
| `VITE_SUPABASE_ANON_KEY` | *(From your root `.env`)* | Found in root `.env` |

6. Click **Deploy**.
7. Vercel will build the frontend and assign a production URL (e.g. `https://skipq.vercel.app`).

---

## 🔗 Part 3: Connect Frontend URL to Backend CORS

1. Return to your [Render Dashboard](https://dashboard.render.com).
2. Go to your `skipq-backend` service -> **Environment**.
3. Update `FRONTEND_URL` to match your Vercel URL:
   ```env
   FRONTEND_URL=https://skip-q-theta.vercel.app
   ```
   *(Note: Because `ALLOW_VERCEL_PREVIEWS=true` is enabled, all Vercel domains and previews are permitted automatically by CORS).*
4. Click **Save Changes** (Render will redeploy with the updated origin).

---

## ✅ Part 4: Post-Deployment Smoke Tests

Verify that all subsystems are communicating properly:

1. **Backend Health Check**:
   Visit `https://<your-render-url>/health` in your browser.
   Expected response:
   ```json
   {
     "status": "HEALTHY",
     "service": "xerox-flow-api",
     "environment": "production"
   }
   ```

2. **Supabase Diagnostic Route**:
   Visit `https://<your-render-url>/api/v1/supabase/status`.
   Expected response:
   ```json
   {
     "connected": true,
     "databaseDriver": "supabase",
     "storageDriver": "supabase"
   }
   ```

3. **Frontend Application**:
   - Open your Vercel URL.
   - Navigate to `/login` or `/register` to test user authentication.
   - Upload a document on the student upload wizard to test file uploads to Supabase Storage.
   - Place a test order and verify the live queue token generation.
