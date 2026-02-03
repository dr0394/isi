/*
  # Fix RLS permissions for pionier_entries table

  1. Grant necessary permissions to anon role
  2. Create proper RLS policies for INSERT operations
  3. Ensure anonymous users can submit the signup form

  This migration fixes the 42501 RLS policy violation error.
*/

-- Grant basic permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.pionier_entries TO anon;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous inserts for pionier_entries" ON public.pionier_entries;
DROP POLICY IF EXISTS "Allow authenticated users full access to pionier_entries" ON public.pionier_entries;

-- Create new RLS policies
CREATE POLICY "Allow anonymous inserts for pionier_entries"
  ON public.pionier_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to pionier_entries"
  ON public.pionier_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.pionier_entries ENABLE ROW LEVEL SECURITY;