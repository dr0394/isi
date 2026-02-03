/*
  # Fix RLS error 42501 for anonymous inserts

  1. Grant Permissions
    - Grant INSERT permission to `anon` role on `waitlist_entries` table
    - Grant USAGE permission on `public` schema to `anon` role

  2. RLS Policies
    - Drop any conflicting policies
    - Create proper INSERT policy for anonymous users with `WITH CHECK (true)`
    - Create proper INSERT policy for authenticated users

  3. Table Defaults
    - Ensure `created_at` has proper default value
    - Ensure other timestamp fields have defaults

  This addresses the core issue: RLS policies are checked AFTER basic table permissions.
  The `anon` role needs explicit INSERT permission on the table.
*/

-- Grant basic permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.waitlist_entries TO anon;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow anonymous insert for waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Allow authenticated insert for waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.waitlist_entries;

-- Ensure table has proper defaults
DO $$
BEGIN
  -- Ensure created_at has default if it doesn't already
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' 
    AND column_name = 'created_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.waitlist_entries 
    ALTER COLUMN created_at SET DEFAULT now();
  END IF;

  -- Ensure updated_at has default if it doesn't already
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' 
    AND column_name = 'updated_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.waitlist_entries 
    ALTER COLUMN updated_at SET DEFAULT now();
  END IF;

  -- Ensure registered_at has default if it doesn't already
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' 
    AND column_name = 'registered_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.waitlist_entries 
    ALTER COLUMN registered_at SET DEFAULT now();
  END IF;
END $$;

-- Create RLS policy for anonymous inserts
CREATE POLICY "Enable anonymous inserts for waitlist_entries"
  ON public.waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create RLS policy for authenticated inserts
CREATE POLICY "Enable authenticated inserts for waitlist_entries"
  ON public.waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify RLS is enabled (should already be enabled)
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;