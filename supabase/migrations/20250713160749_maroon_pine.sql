/*
  # Fix RLS policy for anonymous user inserts

  1. Security Changes
    - Drop existing restrictive INSERT policies
    - Create new policy allowing anonymous users to insert waitlist entries
    - Ensure authenticated users can also insert entries
    - Maintain existing SELECT, UPDATE, DELETE policies for authenticated users

  This migration resolves the "new row violates row-level security policy" error
  by properly configuring INSERT permissions for the anon role.
*/

-- Drop existing INSERT policies that might be too restrictive
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON waitlist_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON waitlist_entries;

-- Create a comprehensive INSERT policy for anonymous users
CREATE POLICY "Allow anonymous insert for waitlist entries"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create INSERT policy for authenticated users as well
CREATE POLICY "Allow authenticated insert for waitlist entries"
  ON waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled (should already be enabled based on schema)
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;