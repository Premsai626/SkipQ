-- ============================================================================
-- SKIPQ / XEROXFLOW — FINAL ARCHITECTURE REFACTOR & SECURITY HARDENING
-- Migration: 20261005_final_architecture_refactor.sql
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. HARDEN DOCUMENT WRITE ACCESS (Fix direct client metadata injection)
-- Backend service-role is the sole write boundary for document persistence
DROP POLICY IF EXISTS "Documents insert policy" ON public.documents;
DROP POLICY IF EXISTS "Documents delete policy" ON public.documents;

-- 2. PROFILE ATTRIBUTES EXTENSION & STRICT ROLE CONSTRAINT
DO $$
BEGIN
  -- Add institution column if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'institution'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN institution TEXT DEFAULT 'Campus';
  END IF;

  -- Add year_of_study column if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'year_of_study'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN year_of_study TEXT;
  END IF;

  -- Add profile_photo column if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'profile_photo'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN profile_photo TEXT;
  END IF;
END $$;

-- Update role constraint to strictly permit only 'student' and 'staff'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'staff'));

-- 3. PROFILE DATA PRIVACY RLS (Users can only view and update their OWN profile)
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- 4. SHARED STORE CATALOG TABLE (store_items)
CREATE TABLE IF NOT EXISTS public.store_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Stationery',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_store_items_category ON public.store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_is_available ON public.store_items(is_available);
CREATE INDEX IF NOT EXISTS idx_store_items_created_at ON public.store_items(created_at DESC);

ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;

-- Clean up any existing store_items policies
DROP POLICY IF EXISTS "Store items select policy" ON public.store_items;
DROP POLICY IF EXISTS "Store items insert policy" ON public.store_items;
DROP POLICY IF EXISTS "Store items update policy" ON public.store_items;
DROP POLICY IF EXISTS "Store items delete policy" ON public.store_items;

-- Shared visibility: All authenticated students and staff can view store items
CREATE POLICY "Store items select policy"
  ON public.store_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Operational store management: Only active staff can add, edit, or delete items
CREATE POLICY "Store items insert policy"
  ON public.store_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()::text AND p.role = 'staff' AND p.status = 'active'
    )
  );

CREATE POLICY "Store items update policy"
  ON public.store_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()::text AND p.role = 'staff' AND p.status = 'active'
    )
  );

CREATE POLICY "Store items delete policy"
  ON public.store_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()::text AND p.role = 'staff' AND p.status = 'active'
    )
  );

-- 5. ORDERS EXTENSION (Stationery store orders support)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_type TEXT NOT NULL DEFAULT 'PRINT' CHECK (order_type IN ('PRINT', 'STORE'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'items'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update status constraint to include DECLINED
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'PENDING',
    'ACCEPTED',
    'PAYMENT_VERIFIED',
    'PRINTING',
    'READY_FOR_PICKUP',
    'COLLECTED',
    'REJECTED',
    'DECLINED',
    'CANCELLED'
  )
);
