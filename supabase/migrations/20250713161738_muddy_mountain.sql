/*
  # Fix RLS Policy for Anonymous Inserts

  This migration resolves the 42501 error by:
  1. Dropping any conflicting policies
  2. Creating a proper policy for anonymous inserts
  3. Ensuring the anon role has necessary permissions
  4. Adding proper defaults for timestamp fields

  Changes:
  - Drop existing INSERT policies that may be blocking anonymous users
  - Create new policy "Allow anonymous inserts" for anon role
  - Grant INSERT permission to anon role
  - Ensure created_at has proper default
*/

-- Drop any existing INSERT policies that might conflict
DROP POLICY IF EXISTS "Allow anonymous insert for waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Allow authenticated insert for waitlist entries" ON public.waitlist_entries;

-- Ensure the anon role has INSERT permission on the table
GRANT INSERT ON public.waitlist_entries TO anon;
GRANT INSERT ON public.waitlist_entries TO authenticated;

-- Ensure created_at has a proper default if it doesn't already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' 
    AND column_name = 'created_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE public.waitlist_entries 
    ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END $$;

-- Create the policy for anonymous inserts with both USING and WITH CHECK
CREATE POLICY "Allow anonymous inserts"
  ON public.waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for authenticated users as well
CREATE POLICY "Allow authenticated inserts"
  ON public.waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);