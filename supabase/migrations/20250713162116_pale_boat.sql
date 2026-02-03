/*
  # Fix RLS policy for anonymous inserts

  1. Security Changes
    - Drop existing conflicting policies
    - Create new policy allowing anonymous inserts
    - Grant necessary permissions to anon role
    - Ensure created_at has proper default

  2. Policy Details
    - Name: "Allow anonymous insert for waitlist entries"
    - Operation: INSERT
    - Role: anon
    - Condition: true (allows all inserts)
*/

-- First, ensure the anon role has the necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.waitlist_entries TO anon;

-- Drop any existing conflicting policies for INSERT operations
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Allow anonymous insert for waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.waitlist_entries;

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

-- Create the policy that allows anonymous inserts
CREATE POLICY "Allow anonymous insert for waitlist entries"
  ON public.waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also ensure authenticated users can insert (if needed)
CREATE POLICY "Allow authenticated insert for waitlist entries"
  ON public.waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);