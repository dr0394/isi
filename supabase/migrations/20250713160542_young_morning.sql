/*
  # Fix RLS policy for anonymous inserts

  1. Security Updates
    - Drop existing INSERT policy for anonymous users
    - Create new policy that properly allows anonymous inserts
    - Ensure anonymous users can insert waitlist entries from the frontend

  2. Changes
    - Remove restrictive INSERT policy
    - Add permissive INSERT policy for anonymous users
    - Maintain security while allowing public signups
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow public to insert waitlist entries" ON waitlist_entries;

-- Create a new policy that allows anonymous users to insert waitlist entries
CREATE POLICY "Enable insert for anonymous users" ON waitlist_entries
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Ensure the policy allows all necessary fields to be inserted
CREATE POLICY "Enable insert for authenticated users" ON waitlist_entries
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);