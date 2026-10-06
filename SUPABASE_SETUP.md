# 🚀 Supabase Backend Setup Guide for SkipQ / XeroxFlow

This guide provides instructions to connect SkipQ to your **Supabase PostgreSQL & Storage** backend.

---

## 📋 Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose your organization, project name (e.g. `skipq-xerox`), a secure database password, and your nearest region (e.g. `ap-south-1` for India / Mumbai).
4. Wait ~2 minutes for the database to be provisioned.

---

## 🗄️ Step 2: Run the Database Migration SQL

1. In your Supabase dashboard, click on **SQL Editor** from the left sidebar.
2. Click **New Query**.
3. Open and copy the entire contents of [`supabase/schema.sql`](file:///c:/Users/prem%20sai/OneDrive/Desktop/xerox-antigravity/supabase/schema.sql).
4. Paste it into the SQL Editor and click **Run** (or press `Ctrl+Enter`).

> **What this does:**
> - Creates the `profiles` table (for students and staff operators)
> - Creates the `orders` table (with JSONB support for document lists, print configurations, and price breakdowns)
> - Creates the `notifications` table (for real-time order status notifications)
> - Creates optimized performance indexes for status, student ID, and creation dates
> - Creates the `xerox-documents` public storage bucket for document uploads
> - Sets up Row-Level Security (RLS) policies
> - Seeds initial campus test records so your queues are ready immediately

---

## 🔑 Step 3: Configure Environment Variables

1. In Supabase Dashboard, click on **Project Settings** (gear icon) -> **API**.
2. Note the following values:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / public key**
   - **service_role secret key** (revealed by clicking "Reveal")

3. Open or edit [`backend/.env`](file:///c:/Users/prem%20sai/OneDrive/Desktop/xerox-antigravity/backend/.env):

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=xerox_flow_production_jwt_secret_key_2026

# Set database and storage driver to 'supabase'
DATABASE_DRIVER=supabase
STORAGE_DRIVER=supabase

# Your Supabase Credentials:
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_STORAGE_BUCKET=xerox-documents
```

---

## 🧪 Step 4: Verify Your Connection

Run the automated diagnostic check from your terminal:

```bash
npm run test:supabase
```

You should see:
```text
===========================================================
🚀 SKIPQ SUPABASE CONNECTION & VERIFICATION DIAGNOSTIC
===========================================================
📡 Supabase URL: https://xyz.supabase.co
🔑 Supabase Key: eyJhbGci...
📦 Storage Bucket: xerox-documents
-----------------------------------------------------------
✅ Orders Table: OK (Found 7 records)
   Recent tokens: XR-1044, XR-1043, XR-1042, XR-1041, XR-1040
✅ Profiles Table: OK (Found 5 profiles)
✅ Notifications Table: OK (Found 2 notifications)
✅ Storage Bucket 'xerox-documents': OK (Public: true)
===========================================================
🎉 SUPABASE BACKEND IS FULLY CONNECTED & READY!
===========================================================
```

---

## 🚀 Step 5: Start the Application

Start both the Express backend and the Vite frontend:

```bash
# Terminal 1 - Start the backend:
npm run start:backend

# Terminal 2 - Start the frontend:
npm run dev
```

You can also check the live Supabase diagnostic endpoint at:
`http://localhost:5001/api/v1/supabase/status`
