/*
  # Fix RLS policy for anonymous inserts

  1. Security Policy Update
    - Drop existing conflicting policies for INSERT operations
    - Create new policy allowing anonymous users to insert waitlist entries
    - Ensure both USING and WITH CHECK clauses are properly set

  2. Policy Details
    - Name: "Allow anonymous insert for waitlist entries"
    - Table: public.waitlist_entries
    - Operation: INSERT
    - Role: anon
    - Conditions: USING (true) and WITH CHECK (true)
*/

-- Drop any existing INSERT policies that might conflict
DROP POLICY IF EXISTS "Allow anonymous insert for waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Allow authenticated insert for waitlist entries" ON public.waitlist_entries;

-- Create the correct policy for anonymous inserts
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