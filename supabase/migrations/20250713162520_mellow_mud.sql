/*
  # Create pionier_entries table

  1. New Tables
    - `pionier_entries`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, unique, not null)
      - `phone` (text, not null)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `pionier_entries` table
    - Add policy for anonymous users to insert data
    - Add policy for authenticated users to read/update/delete data

  3. Permissions
    - Grant INSERT permission to anon role
    - Grant all permissions to authenticated role
*/

-- Drop waitlist_entries table if it exists
DROP TABLE IF EXISTS public.waitlist_entries CASCADE;

-- Create pionier_entries table
CREATE TABLE IF NOT EXISTS public.pionier_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pionier_entries ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role for public signup
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.pionier_entries TO anon;

-- Grant all permissions to authenticated users (admins)
GRANT ALL ON public.pionier_entries TO authenticated;

-- Create RLS policies
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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_pionier_entries_updated_at
  BEFORE UPDATE ON public.pionier_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pionier_entries_email ON public.pionier_entries (email);
CREATE INDEX IF NOT EXISTS idx_pionier_entries_created_at ON public.pionier_entries (created_at DESC);