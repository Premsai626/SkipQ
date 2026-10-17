-- ============================================================================
-- SKIPQ / XEROXFLOW — COMPLETE CONSOLIDATED SUPABASE DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ (Supabase)
-- Strict Two-Role Architecture: 'student' and 'staff'
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Students & Staff Operators)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  department TEXT,
  college_id TEXT,
  phone TEXT,
  institution TEXT DEFAULT 'Campus',
  year_of_study TEXT,
  profile_photo TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE (Print & Stationery Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL DEFAULT 'PRINT' CHECK (order_type IN ('PRINT', 'STORE')),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
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
      'DECLINED',
      'CANCELLED'
    )
  ),
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (
    payment_method IN ('UPI', 'CARD', 'CASH', 'ONLINE')
  ),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    payment_status IN ('PENDING', 'VERIFIED', 'FAILED')
  ),
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  queue_position INTEGER NOT NULL DEFAULT 0,
  pickup_counter TEXT DEFAULT 'Counter #2 (Main Desk)',
  otp_code TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DOCUMENTS TABLE (Uploaded documents tracking ownership & metadata)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  filename TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  pages INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STORE ITEMS TABLE (Campus Stationery Catalog)
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

-- 6. NOTIFICATIONS TABLE
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

-- 7. PERFORMANCE & QUEUE INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_student_id ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_token ON public.orders(token);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_filename ON public.documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_items_category ON public.store_items(category);
CREATE INDEX IF NOT EXISTS idx_store_items_is_available ON public.store_items(is_available);
CREATE INDEX IF NOT EXISTS idx_store_items_created_at ON public.store_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON public.notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 8. SECURITY DEFINER HELPER FUNCTIONS (Zero RLS Recursion)
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles
    WHERE id = auth.uid()::text
      AND role = 'staff'
      AND status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO service_role;

-- 9. PRIVILEGE ESCALATION PREVENTION TRIGGER ON PROFILES
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Service role and superusers can freely update
  IF (coalesce(auth.jwt() ->> 'role', '') = 'service_role' OR current_user = 'postgres') THEN
    RETURN NEW;
  END IF;

  -- Regular users cannot self-escalate role or status
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status) THEN
    RAISE EXCEPTION 'Privilege escalation rejected: role and status cannot be modified by user.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 10. STORAGE ACCESS CONTROL HELPER
CREATE OR REPLACE FUNCTION public.can_access_storage_document(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    -- Direct document owner
    EXISTS (
      SELECT 1 
      FROM public.documents d
      WHERE d.owner_id = auth.uid()::text
        AND (
          d.storage_path = object_name
          OR d.filename = object_name
          OR object_name = 'orders/' || d.filename
        )
    )
    OR
    -- Student has an order referencing this document
    EXISTS (
      SELECT 1
      FROM public.orders o,
           jsonb_array_elements(
             CASE 
               WHEN jsonb_typeof(o.documents) = 'array' THEN o.documents 
               ELSE '[]'::jsonb 
             END
           ) AS doc
      WHERE o.student_id = auth.uid()::text
        AND (
          doc->>'filename' = replace(object_name, 'orders/', '')
          OR doc->>'filename' = object_name
          OR doc->>'storagePath' = object_name
          OR doc->>'storage_path' = object_name
          OR (
            doc->>'url' IS NOT NULL 
            AND (
              doc->>'url' LIKE '%/' || replace(object_name, 'orders/', '')
              OR doc->>'url' LIKE '%/' || replace(object_name, 'orders/', '') || '?%'
            )
          )
        )
    )
    OR
    -- Active staff can access documents tied to active campus orders
    (
      public.is_active_staff()
      AND EXISTS (
        SELECT 1
        FROM public.orders o,
             jsonb_array_elements(
               CASE 
                 WHEN jsonb_typeof(o.documents) = 'array' THEN o.documents 
                 ELSE '[]'::jsonb 
               END
             ) AS doc
        WHERE (
          doc->>'filename' = replace(object_name, 'orders/', '')
          OR doc->>'filename' = object_name
          OR doc->>'storagePath' = object_name
          OR doc->>'storage_path' = object_name
          OR (
            doc->>'url' IS NOT NULL 
            AND (
              doc->>'url' LIKE '%/' || replace(object_name, 'orders/', '')
              OR doc->>'url' LIKE '%/' || replace(object_name, 'orders/', '') || '?%'
            )
          )
        )
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_access_storage_document(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_storage_document(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_storage_document(TEXT) TO service_role;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (Users view and update only their own profile)
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid()::text = id OR public.is_active_staff());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Orders Policies
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Orders select policy" ON public.orders;
DROP POLICY IF EXISTS "Orders insert policy" ON public.orders;
DROP POLICY IF EXISTS "Orders update policy" ON public.orders;

CREATE POLICY "Orders select policy"
  ON public.orders FOR SELECT
  USING (
    auth.uid()::text = student_id
    OR public.is_active_staff()
  );

CREATE POLICY "Orders insert policy"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid()::text = student_id 
    AND status = 'PENDING'
  );

CREATE POLICY "Orders update policy"
  ON public.orders FOR UPDATE
  USING (
    public.is_active_staff()
  );

-- Documents Policies
DROP POLICY IF EXISTS "Documents select policy" ON public.documents;
DROP POLICY IF EXISTS "Documents insert policy" ON public.documents;
DROP POLICY IF EXISTS "Documents update policy" ON public.documents;
DROP POLICY IF EXISTS "Documents delete policy" ON public.documents;

CREATE POLICY "Documents select policy"
  ON public.documents FOR SELECT
  USING (
    auth.uid()::text = owner_id
    OR public.is_active_staff()
  );

-- Store Items Policies (Catalog is readable by all authenticated; editable only by staff)
DROP POLICY IF EXISTS "Store items select policy" ON public.store_items;
DROP POLICY IF EXISTS "Store items insert policy" ON public.store_items;
DROP POLICY IF EXISTS "Store items update policy" ON public.store_items;
DROP POLICY IF EXISTS "Store items delete policy" ON public.store_items;

CREATE POLICY "Store items select policy"
  ON public.store_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Store items insert policy"
  ON public.store_items FOR INSERT
  WITH CHECK (public.is_active_staff());

CREATE POLICY "Store items update policy"
  ON public.store_items FOR UPDATE
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

CREATE POLICY "Store items delete policy"
  ON public.store_items FOR DELETE
  USING (public.is_active_staff());

-- Notifications Policies
DROP POLICY IF EXISTS "Allow public all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;

CREATE POLICY "Notifications select policy"
  ON public.notifications FOR SELECT
  USING (
    auth.uid()::text = student_id 
    OR student_id IS NULL
    OR public.is_active_staff()
  );

CREATE POLICY "Notifications update policy"
  ON public.notifications FOR UPDATE
  USING (auth.uid()::text = student_id);

-- 12. STORAGE BUCKET SECURITY (PRIVATE BUCKET & STRICT OBJECT RLS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('xerox-documents', 'xerox-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Public Access for Xerox Documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for Xerox Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authorized document access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Strict document storage read policy" ON storage.objects;
DROP POLICY IF EXISTS "Strict document storage insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Strict document storage delete policy" ON storage.objects;

CREATE POLICY "Strict document storage read policy"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'xerox-documents'
    AND auth.role() = 'authenticated'
    AND public.can_access_storage_document(name)
  );

CREATE POLICY "Strict document storage insert policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'xerox-documents'
    AND auth.role() = 'authenticated'
  );

-- 13. SEED DEFAULT STORE ITEMS
INSERT INTO public.store_items (id, name, description, category, price, stock, image_url, is_available)
VALUES
  ('item_apron_01', 'Campus Lab Apron (White Cotton)', 'Standard laboratory dress code with dual chest pen slots and reinforced side vents.', 'Lab Apparel', 280.00, 50, '/images/apron.png', true),
  ('item_files_02', 'Assignment Stick Files (Pack of 5)', 'Transparent high-clarity front cover with non-slip fluorescent spine locking clips.', 'Filing & Submission', 45.00, 150, '/images/stick_files.png', true),
  ('item_graph_03', 'Engineering Graph Book (60 Pgs)', 'High-precision millimeter grid pages for Physics, Chemistry, and CAD laboratory readings.', 'Notebooks & Records', 35.00, 100, '/images/graph_book.png', true),
  ('item_a3_04', 'A3 Drawing Sheets (Pack of 10)', 'Heavyweight 140 GSM drafting paper tailored for Engineering Drawing boards.', 'Engineering Graphics', 60.00, 80, '/images/a3_sheets.png', true),
  ('item_notebook_05', 'Executive Spiral Notebook (200 Pgs)', '80 GSM smooth bond paper with perforated tear-out sheets and spill-resistant poly cover.', 'Notebooks & Records', 110.00, 75, '/images/notebook.png', true),
  ('item_pilot_06', 'Pilot V5 Hi-Tecpoint Pen (Black/Blue)', '0.5mm stainless steel precision tip with liquid ink feed for examination writing.', 'Writing Instruments', 55.00, 120, '/images/pilot_pen.png', true)
ON CONFLICT (id) DO NOTHING;
