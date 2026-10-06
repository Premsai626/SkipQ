-- ============================================================================
-- SKIPQ / XEROXFLOW — DATABASE-BACKED DOCUMENT OWNERSHIP & NON-RECURSIVE RLS
-- Migration: 20261004_add_documents_table.sql
-- 
-- Run this ONCE in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SECURITY DEFINER HELPER FUNCTIONS (Zero RLS Recursion)
-- These execute with elevated table-owner privileges to inspect profiles without
-- triggering profiles RLS policies recursively. search_path is strictly pinned.

CREATE OR REPLACE FUNCTION public.is_active_staff_or_admin()
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
      AND role IN ('staff', 'admin')
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin()
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
      AND role = 'admin'
      AND status = 'active'
  );
$$;

-- Secure grants for helper functions
REVOKE ALL ON FUNCTION public.is_active_staff_or_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_staff_or_admin() TO service_role;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO service_role;

-- 3. PRIVILEGE ESCALATION PREVENTION TRIGGER ON PROFILES
-- Prevents authenticated students from self-assigning staff/admin roles or altering account status
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Backend service_role key or superuser may manage roles/statuses during provisioning
  IF (coalesce(auth.jwt() ->> 'role', '') = 'service_role' OR current_user = 'postgres') THEN
    RETURN NEW;
  END IF;

  -- Block unauthorized modification of role or status
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status) THEN
    IF NOT public.is_active_admin() THEN
      RAISE EXCEPTION 'Privilege escalation rejected: only administrators can alter role or status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 4. DOCUMENTS TABLE (Database-backed ownership & metadata)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filename TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  pages INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appropriate indexes for fast lookup and owner queries
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_filename ON public.documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- 5. STORAGE ACCESS CONTROL HELPER (Secures private Supabase Storage objects)
CREATE OR REPLACE FUNCTION public.can_access_storage_document(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    -- Active staff and admin have operational access
    public.is_active_staff_or_admin()
    OR
    -- Direct document owner in public.documents
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
    -- Student has an order referencing this document via structured JSONB check
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
          -- Exact structural equality on filename
          doc->>'filename' = replace(object_name, 'orders/', '')
          OR doc->>'filename' = object_name
          -- Exact structural equality on storagePath / storage_path
          OR doc->>'storagePath' = object_name
          OR doc->>'storage_path' = object_name
          -- Exact path segment match in document url
          OR (
            doc->>'url' IS NOT NULL 
            AND (
              doc->>'url' LIKE '%/' || replace(object_name, 'orders/', '')
              OR doc->>'url' LIKE '%/' || replace(object_name, 'orders/', '') || '?%'
            )
          )
        )
    );
$$;

REVOKE ALL ON FUNCTION public.can_access_storage_document(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_storage_document(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_storage_document(TEXT) TO service_role;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES — NON-RECURSIVE

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- PROFILES RLS
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

-- Students view own profile; active staff/admin can view profiles for operations (Non-recursive)
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  USING (
    auth.uid()::text = id 
    OR public.is_active_staff_or_admin()
  );

-- Users update their own profile; active admin can update any profile
CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid()::text = id
    OR public.is_active_admin()
  )
  WITH CHECK (
    auth.uid()::text = id
    OR public.is_active_admin()
  );

-- -------------------------------------------------------------
-- ORDERS RLS
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Orders select policy" ON public.orders;
DROP POLICY IF EXISTS "Orders insert policy" ON public.orders;
DROP POLICY IF EXISTS "Orders update policy" ON public.orders;

-- Students view only their own orders; active staff/admin view all orders
CREATE POLICY "Orders select policy"
  ON public.orders FOR SELECT
  USING (
    auth.uid()::text = student_id
    OR public.is_active_staff_or_admin()
  );

-- Students can insert orders for themselves with initial PENDING status
CREATE POLICY "Orders insert policy"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid()::text = student_id 
    AND status = 'PENDING'
  );

-- Only active staff and admin can update orders
CREATE POLICY "Orders update policy"
  ON public.orders FOR UPDATE
  USING (
    public.is_active_staff_or_admin()
  );

-- -------------------------------------------------------------
-- NOTIFICATIONS RLS
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Notifications select policy" ON public.notifications;
DROP POLICY IF EXISTS "Notifications update policy" ON public.notifications;

-- Students view their own notifications or broadcasts; active staff/admin view operational notifications
CREATE POLICY "Notifications select policy"
  ON public.notifications FOR SELECT
  USING (
    auth.uid()::text = student_id 
    OR student_id IS NULL
    OR public.is_active_staff_or_admin()
  );

-- Students can update only their own notifications (e.g. marking read)
CREATE POLICY "Notifications update policy"
  ON public.notifications FOR UPDATE
  USING (
    auth.uid()::text = student_id
  );

-- -------------------------------------------------------------
-- DOCUMENTS RLS
-- -------------------------------------------------------------
DROP POLICY IF EXISTS "Documents select policy" ON public.documents;
DROP POLICY IF EXISTS "Documents insert policy" ON public.documents;
DROP POLICY IF EXISTS "Documents update policy" ON public.documents;
DROP POLICY IF EXISTS "Documents delete policy" ON public.documents;

-- Students view only their own documents; active staff/admin can view all documents for printing/operations
CREATE POLICY "Documents select policy"
  ON public.documents FOR SELECT
  USING (
    auth.uid()::text = owner_id
    OR public.is_active_staff_or_admin()
  );

-- Authenticated students/users can insert documents they own
CREATE POLICY "Documents insert policy"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid()::text = owner_id
  );

-- Students can delete their own documents; active staff/admin can manage operational documents
CREATE POLICY "Documents delete policy"
  ON public.documents FOR DELETE
  USING (
    auth.uid()::text = owner_id
    OR public.is_active_staff_or_admin()
  );

-- -------------------------------------------------------------
-- 7. STORAGE BUCKET SECURITY (PRIVATE BUCKET & STRICT OBJECT RLS)
-- -------------------------------------------------------------
-- Keep xerox-documents private
INSERT INTO storage.buckets (id, name, public)
VALUES ('xerox-documents', 'xerox-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Clean up legacy or wide-open storage policies
DROP POLICY IF EXISTS "Public Access for Xerox Documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload for Xerox Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authorized document access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Strict document storage read policy" ON storage.objects;
DROP POLICY IF EXISTS "Strict document storage insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Strict document storage delete policy" ON storage.objects;

-- Strict Storage SELECT policy: Only the document owner, order owner, or operational staff/admin
CREATE POLICY "Strict document storage read policy"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'xerox-documents'
    AND auth.role() = 'authenticated'
    AND public.can_access_storage_document(name)
  );
