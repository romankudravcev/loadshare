-- Rebuild circles RLS from scratch to fix "new row violates row-level security" error.
--
-- Root cause 1: SELECT policy (is_circle_member) fires on RETURNING * in the
--   INSERT query before the after-insert trigger has added the owner to
--   circle_members — so the new owner fails the member check.
-- Root cause 2: Multiple conflicting INSERT policies left from earlier iterations.

-- ── Wipe the slate ─────────────────────────────────────────────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'circles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.circles', r.policyname);
  END LOOP;
END $$;

-- ── INSERT ─────────────────────────────────────────────────────────────────────
-- Any authenticated user may create a circle they own.
CREATE POLICY "circles_insert" ON public.circles
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- ── SELECT ─────────────────────────────────────────────────────────────────────
-- Owners always see their circle (even before the trigger runs).
-- Members see circles they belong to.
CREATE POLICY "circles_select" ON public.circles
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circles.id
        AND circle_members.user_id   = auth.uid()
    )
  );

-- ── UPDATE / DELETE ────────────────────────────────────────────────────────────
CREATE POLICY "circles_update" ON public.circles
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "circles_delete" ON public.circles
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());
