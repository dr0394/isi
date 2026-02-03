/*
  # Create waitlist management system

  1. New Tables
    - `waitlist_entries`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `email` (text, unique)
      - `registered_at` (timestamp)
      - `status` (text with check constraint)
      - `source` (text)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `waitlist_entries` table
    - Add policies for authenticated admin access
    - Add policy for public insert (for landing page signups)

  3. Indexes
    - Add index on email for fast lookups
    - Add index on status for filtering
    - Add index on registered_at for sorting
*/

-- Create waitlist_entries table
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text UNIQUE NOT NULL,
  registered_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'enrolled', 'declined')),
  source text DEFAULT 'landing-page',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email ON waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status ON waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_registered_at ON waitlist_entries(registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at ON waitlist_entries(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_waitlist_entries_updated_at ON waitlist_entries;
CREATE TRIGGER update_waitlist_entries_updated_at
    BEFORE UPDATE ON waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Policies for Row Level Security

-- Allow public to insert new entries (for landing page signups)
CREATE POLICY "Allow public to insert waitlist entries"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admins) to view all entries
CREATE POLICY "Allow authenticated users to view all waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update all entries
CREATE POLICY "Allow authenticated users to update waitlist entries"
  ON waitlist_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete entries
CREATE POLICY "Allow authenticated users to delete waitlist entries"
  ON waitlist_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert some sample data for testing
INSERT INTO waitlist_entries (first_name, email, registered_at, status, source, notes) VALUES
  ('Sarah', 'sarah.mueller@email.com', '2024-01-15T10:30:00Z', 'pending', 'landing-page', NULL),
  ('Marcus', 'marcus.klein@email.com', '2024-01-14T15:45:00Z', 'contacted', 'social-media', 'Sehr interessiert, Follow-up geplant'),
  ('Lisa', 'lisa.wagner@email.com', '2024-01-13T09:20:00Z', 'enrolled', 'landing-page', NULL),
  ('Tom', 'tom.richter@email.com', '2024-01-12T14:10:00Z', 'pending', 'referral', NULL),
  ('Anna', 'anna.weber@email.com', '2024-01-11T11:55:00Z', 'contacted', 'landing-page', NULL)
ON CONFLICT (email) DO NOTHING;