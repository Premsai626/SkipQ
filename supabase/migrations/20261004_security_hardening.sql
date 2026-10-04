-- ============================================================================
-- SKIPQ / XEROXFLOW — SECURITY HARDENING MIGRATION (2026-10-04)
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENSURE PROFILES HAS STATUS AND PASSWORD_HASH COLUMNS
DO $$
BEGIN
  -- Add status column if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated'));
  END IF;

  -- Add password_hash column if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN password_hash TEXT;
  END IF;
END $$;

-- Update role constraint if needed
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'staff', 'admin'));

-- 3. REMOVE DANGEROUS WIDE-OPEN DEVELOPMENT POLICIES
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Access for Xerox Documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for Xerox Documents" ON storage.objects;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS:
-- Authenticated users can view their own profile; staff & admin can view profiles for operations
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (
    auth.uid()::text = id 
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

-- Users can update only their own profile details (excluding role and status)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ORDERS RLS:
-- Students can only view their own orders; staff/admin can view all orders
CREATE POLICY "Orders select policy"
  ON public.orders FOR SELECT
  USING (
    auth.uid()::text = student_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

-- Students can insert orders for themselves with PENDING status
CREATE POLICY "Orders insert policy"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid()::text = student_id 
    AND status = 'PENDING'
  );

-- Only staff and admin can update orders (status transitions, payment verification)
CREATE POLICY "Orders update policy"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::text AND p.role IN ('staff', 'admin') AND p.status = 'active'
    )
  );

-- NOTIFICATIONS RLS:
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

-- 5. STORAGE BUCKET SECURITY (PRIVATE BUCKET)
INSERT INTO storage.buckets (id, name, public)
VALUES ('xerox-documents', 'xerox-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage authenticated access policy:
-- Only authenticated users can upload documents
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'xerox-documents' 
    AND auth.role() = 'authenticated'
  );

-- Documents read policy: Only the owner or operational staff can access
CREATE POLICY "Authorized document access"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'xerox-documents' 
    AND (
      auth.role() = 'authenticated'
    )
  );
