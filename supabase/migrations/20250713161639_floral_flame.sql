/*
  # Fix RLS error 42501 for anonymous inserts

  This migration resolves the RLS policy violation when anonymous users
  try to insert into the waitlist_entries table.

  ## Changes
  1. Drop existing conflicting policies
  2. Create proper policy for anonymous inserts with both USING and WITH CHECK
  3. Add created_at default if missing
  4. Ensure all required fields have proper defaults
*/

-- First, let's ensure the table has proper defaults
ALTER TABLE public.waitlist_entries 
  ALTER COLUMN created_at SET DEFAULT now();

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Allow anonymous insert for waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Allow authenticated insert for waitlist entries" ON public.waitlist_entries;

-- Create the policy for anonymous users with both USING and WITH CHECK
CREATE POLICY "Allow anonymous insert for waitlist entries"
  ON public.waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also create policy for authenticated users
CREATE POLICY "Allow authenticated insert for waitlist entries"
  ON public.waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT INSERT ON public.waitlist_entries TO anon;
GRANT USAGE ON SCHEMA public TO anon;