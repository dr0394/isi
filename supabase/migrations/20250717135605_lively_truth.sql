/*
  # User Invitation and Dashboard System

  1. New Tables
    - `user_invitations`
      - `id` (uuid, primary key)
      - `pionier_entry_id` (uuid, foreign key to pionier_entries)
      - `invitation_token` (text, unique token for secure access)
      - `status` (text, invitation status: pending, used, expired)
      - `expires_at` (timestamp, expiration date)
      - `used_at` (timestamp, when invitation was used)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `users`
      - `id` (uuid, primary key)
      - `pionier_entry_id` (uuid, foreign key to pionier_entries)
      - `invitation_id` (uuid, foreign key to user_invitations)
      - `user_id` (uuid, Supabase auth user ID)
      - `is_active` (boolean, user account status)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and admins
    - Secure token generation and validation

  3. Changes
    - Add status field to pionier_entries if not exists
    - Add indexes for performance
    - Add triggers for updated_at columns
*/

-- Add status field to pionier_entries if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'status'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN status text DEFAULT 'new';
  END IF;
END $$;

-- Add additional fields to pionier_entries for better tracking
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'source'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN source text DEFAULT 'website';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN utm_source text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN utm_medium text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pionier_entries' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE pionier_entries ADD COLUMN utm_campaign text;
  END IF;
END $$;

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pionier_entry_id uuid REFERENCES pionier_entries(id) ON DELETE CASCADE,
  invitation_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
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
  user_id uuid UNIQUE, -- Supabase auth user ID
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
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
CREATE POLICY "Allow authenticated users to read own invitations"
  ON user_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.invitation_id = user_invitations.id 
      AND users.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins full access to invitations"
  ON user_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@coachisi.de'
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow admins full access to users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@coachisi.de'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to create invitation for approved pionier entry
CREATE OR REPLACE FUNCTION create_user_invitation(entry_id uuid)
RETURNS uuid AS $$
DECLARE
  invitation_id uuid;
  token text;
BEGIN
  -- Generate unique token
  LOOP
    token := generate_invitation_token();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM user_invitations WHERE invitation_token = token);
  END LOOP;
  
  -- Create invitation
  INSERT INTO user_invitations (pionier_entry_id, invitation_token)
  VALUES (entry_id, token)
  RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use invitation token
CREATE OR REPLACE FUNCTION use_invitation_token(token text, auth_user_id uuid)
RETURNS uuid AS $$
DECLARE
  invitation_record user_invitations%ROWTYPE;
  user_id uuid;
BEGIN
  -- Get invitation
  SELECT * INTO invitation_record
  FROM user_invitations
  WHERE invitation_token = token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Mark invitation as used
  UPDATE user_invitations
  SET status = 'used', used_at = now()
  WHERE id = invitation_record.id;
  
  -- Create user record
  INSERT INTO users (pionier_entry_id, invitation_id, user_id)
  VALUES (invitation_record.pionier_entry_id, invitation_record.id, auth_user_id)
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;