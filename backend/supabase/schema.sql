-- ============================================================================
-- SKIPQ / XEROXFLOW — SUPABASE DATABASE SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Users & Staff)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
  department TEXT,
  college_id TEXT,
  phone TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN (
      'PENDING',
      'ACCEPTED',
      'PAYMENT_VERIFIED',
      'PRINTING',
      'READY_FOR_PICKUP',
      'COLLECTED',
      'REJECTED',
      'CANCELLED'
    )
  ),
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (
    payment_method IN ('UPI', 'CARD', 'CASH')
  ),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    payment_status IN ('PENDING', 'VERIFIED')
  ),
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  queue_position INTEGER NOT NULL DEFAULT 0,
  pickup_counter TEXT DEFAULT 'Counter #2 (Main Desk)',
  otp_code TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  token TEXT,
  student_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. INDEXES FOR PERFORMANCE & QUEUE SCANNING
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_student_id ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_token ON public.orders(token);
CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON public.notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Note: When using SUPABASE_SERVICE_ROLE_KEY in Express backend, RLS is bypassed automatically.
-- For anon key or public access fallback during development:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all orders' AND tablename = 'orders') THEN
    CREATE POLICY "Allow public all orders" ON public.orders FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public all notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Allow public all notifications" ON public.notifications FOR ALL USING (true);
  END IF;
END $$;

-- 7. STORAGE BUCKET FOR UPLOADED PRINT DOCUMENTS
INSERT INTO storage.buckets (id, name, public)
VALUES ('xerox-documents', 'xerox-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage public read policy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Xerox Documents' AND tablename = 'objects') THEN
    CREATE POLICY "Public Access for Xerox Documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'xerox-documents');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload for Xerox Documents' AND tablename = 'objects') THEN
    CREATE POLICY "Public Upload for Xerox Documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'xerox-documents');
  END IF;
END $$;
