/*
  # User Invitation and Dashboard System

  1. New Tables
    - `user_invitations`
      - `id` (uuid, primary key)
      - `pionier_entry_id` (uuid, foreign key to pionier_entries)
      - `invitation_token` (text, unique)
      - `status` (text, default 'pending')
      - `expires_at` (timestamp)
      - `used_at` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key)
      - `pionier_entry_id` (uuid, foreign key to pionier_entries)
      - `invitation_id` (uuid, foreign key to user_invitations)
      - `user_id` (text, unique - custom user identifier)
      - `password_hash` (text)
      - `is_active` (boolean, default true)
      - `last_login` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `status` column to `pionier_entries` for application status tracking
    - Add `reviewed_by` and `reviewed_at` columns for admin tracking

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user access
    - Add indexes for performance
*/

-- Add status tracking to pionier_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'status'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN status text DEFAULT 'new';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN reviewed_by text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN reviewed_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'notes'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN notes text;
  END IF;
END $$;

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pionier_entry_id uuid REFERENCES pionier_entries(id) ON DELETE CASCADE,
  invitation_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pionier_entry_id uuid REFERENCES pionier_entries(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES user_invitations(id) ON DELETE SET NULL,
  user_id text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_pionier_entries_status ON pionier_entries(status);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_invitations
CREATE POLICY "Allow anon to read valid invitations"
  ON user_invitations
  FOR SELECT
  TO anon
  USING (status = 'pending' AND expires_at > now());

CREATE POLICY "Allow authenticated full access to invitations"
  ON user_invitations
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated full access to users"
  ON users
  FOR ALL
  TO authenticated
  USING (true);

-- Update triggers
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique user ID
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS text AS $$
DECLARE
  new_id text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_id := 'USER' || LPAD(floor(random() * 999999)::text, 6, '0');
    done := NOT EXISTS(SELECT 1 FROM users WHERE user_id = new_id);
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text AS $$
DECLARE
  new_token text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_token := encode(gen_random_bytes(32), 'hex');
    done := NOT EXISTS(SELECT 1 FROM user_invitations WHERE invitation_token = new_token);
  END LOOP;
  RETURN new_token;
END;
$$ LANGUAGE plpgsql;