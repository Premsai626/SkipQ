-- ============================================================================
-- SKIPQ / XEROXFLOW — SECURE STAFF DOCUMENT ACCESS & STORAGE ACCESS CONTROL
-- Migration: 20261005_fix_document_access_and_storage_policy.sql
-- Run in Supabase SQL Editor if updating Supabase Storage policies.
-- ============================================================================

-- 1. ENSURE STORAGE BUCKET IS PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('xerox-documents', 'xerox-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. HELPER FUNCTION: ACTIVE STAFF CHECK (STRICT TWO-ROLE MODEL: STUDENT & STAFF)
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

-- 3. STORAGE ACCESS CONTROL HELPER (Secures private Supabase Storage objects)
-- Enforces:
-- 1. Document owner can access their own document
-- 2. Student can access documents referenced in their orders
-- 3. Active staff can ONLY access documents associated with campus print orders
-- 4. Arbitrary private files cannot be accessed
CREATE OR REPLACE FUNCTION public.can_access_storage_document(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
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
        )
    )
    OR
    -- Active staff can access documents associated with an existing campus order
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
        WHERE doc->>'filename' = replace(object_name, 'orders/', '')
           OR doc->>'filename' = object_name
           OR doc->>'storagePath' = object_name
           OR doc->>'storage_path' = object_name
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_access_storage_document(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_storage_document(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_storage_document(TEXT) TO service_role;

-- 4. STORAGE POLICY RE-ATTACHMENT
DROP POLICY IF EXISTS "Strict document storage read policy" ON storage.objects;

CREATE POLICY "Strict document storage read policy"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'xerox-documents'
    AND auth.role() = 'authenticated'
    AND public.can_access_storage_document(name)
  );
