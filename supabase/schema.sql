-- ============================================================================
-- SKIPQ / XEROXFLOW — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Users, Staff, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
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
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Access for Xerox Documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for Xerox Documents" ON storage.objects;

-- Users can view their own profile; staff & admin can view profiles for operations
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid()::text = id 
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

-- Users can update only their own profile details
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Students view only their own orders; staff/admin view all orders
CREATE POLICY "Orders select policy"
  ON public.orders FOR SELECT
  USING (
    auth.uid()::text = student_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

-- Students can insert orders for themselves with initial PENDING status
CREATE POLICY "Orders insert policy"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid()::text = student_id 
    AND status = 'PENDING'
  );

-- Only staff and admin can update orders
CREATE POLICY "Orders update policy"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

-- Notifications policies
CREATE POLICY "Notifications select policy"
  ON public.notifications FOR SELECT
  USING (
    auth.uid()::text = student_id 
    OR student_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

CREATE POLICY "Notifications update policy"
  ON public.notifications FOR UPDATE
  USING (auth.uid()::text = student_id);

-- 7. STORAGE BUCKET FOR UPLOADED PRINT DOCUMENTS (PRIVATE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('xerox-documents', 'xerox-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'xerox-documents' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authorized document access"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'xerox-documents' 
    AND auth.role() = 'authenticated'
  );
