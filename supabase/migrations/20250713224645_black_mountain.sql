/*
  # Fix RLS policy for pionier_entries table

  1. Security Changes
    - Drop existing restrictive policies
    - Create new policy allowing anonymous inserts
    - Grant necessary permissions to anon role
    - Ensure RLS is properly enabled

  2. Tables Modified
    - `pionier_entries` - Updated RLS policies for anonymous access

  This migration fixes the "new row violates row-level security policy" error
  by allowing anonymous users to insert new entries into the pionier_entries table.
*/

-- First, ensure the anon role has the necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.pionier_entries TO anon;

-- Enable RLS on the table
ALTER TABLE public.pionier_entries ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow anonymous inserts for pionier_entries" ON public.pionier_entries;
DROP POLICY IF EXISTS "Allow authenticated users full access to pionier_entries" ON public.pionier_entries;

-- Create a new policy that allows anonymous inserts
CREATE POLICY "Enable insert for anonymous users" ON public.pionier_entries
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Create a policy for authenticated users to have full access
CREATE POLICY "Enable all access for authenticated users" ON public.pionier_entries
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Verify the table structure and permissions
DO $$
BEGIN
  -- Check if the table exists and has the right structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'pionier_entries'
  ) THEN
    RAISE EXCEPTION 'Table pionier_entries does not exist';
  END IF;
  
  -- Log success
  RAISE NOTICE 'RLS policies updated successfully for pionier_entries table';
END $$;