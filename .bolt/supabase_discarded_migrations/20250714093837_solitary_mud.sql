/*
  # Recipe Download System

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `file_url` (text)
      - `file_name` (text)
      - `file_size` (integer)
      - `download_count` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `recipe_downloads`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `source` (text, default 'recipe-landing')
      - `utm_source` (text, optional)
      - `utm_medium` (text, optional)
      - `utm_campaign` (text, optional)
      - `landing_page_url` (text, optional)
      - `referrer` (text, optional)
      - `user_agent` (text, optional)
      - `ip_address` (text, optional)
      - `downloaded_at` (timestamp, default now())
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access to active recipes
    - Add policies for recipe downloads
    - Add admin policies for management

  3. Functions
    - Function to increment download count
</*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  download_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipe_downloads table
CREATE TABLE IF NOT EXISTS recipe_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'recipe-landing',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  landing_page_url text,
  referrer text,
  user_agent text,
  ip_address text,
  downloaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_recipes_active ON recipes (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_email ON recipe_downloads (email);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_source ON recipe_downloads (source);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_created_at ON recipe_downloads (created_at DESC);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_downloads ENABLE ROW LEVEL SECURITY;

-- Policies for recipes table
CREATE POLICY "Allow public read access to active recipes"
  ON recipes
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow authenticated users full access to recipes"
  ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for recipe_downloads table
CREATE POLICY "Allow anon insert for recipe downloads"
  ON recipe_downloads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to recipe downloads"
  ON recipe_downloads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE recipes 
  SET download_count = download_count + 1,
      updated_at = now()
  WHERE id = recipe_id;
END;
$$;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_recipes_updated_at'
  ) THEN
    CREATE TRIGGER update_recipes_updated_at
      BEFORE UPDATE ON recipes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_recipe_downloads_updated_at'
  ) THEN
    CREATE TRIGGER update_recipe_downloads_updated_at
      BEFORE UPDATE ON recipe_downloads
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample recipes (you can modify these later)
INSERT INTO recipes (title, description, file_url, file_name, file_size, is_active) VALUES
('Protein Power Smoothie Rezepte', 'Leckere und nahrhafte Smoothie-Rezepte für den perfekten Start in den Tag', 'https://example.com/smoothie-recipes.pdf', 'smoothie-recipes.pdf', 1024000, true),
('Gesunde Meal Prep Ideen', '7 Tage Meal Prep Plan mit einfachen und gesunden Rezepten', 'https://example.com/meal-prep-guide.pdf', 'meal-prep-guide.pdf', 2048000, true),
('Post-Workout Snacks', 'Die besten Snacks für optimale Regeneration nach dem Training', 'https://example.com/post-workout-snacks.pdf', 'post-workout-snacks.pdf', 512000, true)
ON CONFLICT DO NOTHING;