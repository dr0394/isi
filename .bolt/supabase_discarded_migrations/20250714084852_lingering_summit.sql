/*
  # Recipe Downloads System

  1. New Tables
    - `recipe_downloads`
      - `id` (uuid, primary key)
      - `name` (text, user name)
      - `email` (text, user email)
      - `source` (text, lead source)
      - `utm_source` (text, UTM source parameter)
      - `utm_medium` (text, UTM medium parameter)
      - `utm_campaign` (text, UTM campaign parameter)
      - `landing_page_url` (text, landing page URL)
      - `referrer` (text, referrer URL)
      - `user_agent` (text, browser user agent)
      - `ip_address` (text, user IP address)
      - `downloaded_at` (timestamp, download timestamp)
      - `created_at` (timestamp, entry creation time)
      - `updated_at` (timestamp, last update time)

    - `recipes`
      - `id` (uuid, primary key)
      - `title` (text, recipe title)
      - `description` (text, recipe description)
      - `file_url` (text, download URL)
      - `file_name` (text, original file name)
      - `file_size` (integer, file size in bytes)
      - `download_count` (integer, total downloads)
      - `is_active` (boolean, recipe availability)
      - `created_at` (timestamp, creation time)
      - `updated_at` (timestamp, last update time)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous access to recipe downloads
    - Add policies for authenticated admin access
</sql>

-- Create recipe_downloads table
CREATE TABLE IF NOT EXISTS recipe_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  source text DEFAULT 'recipe-landing' NOT NULL,
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

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer DEFAULT 0,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recipe_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON recipe_downloads TO anon;
GRANT SELECT ON recipes TO anon;

-- Policies for recipe_downloads
CREATE POLICY "Allow anon insert for recipe_downloads"
  ON recipe_downloads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon select from recipe_downloads"
  ON recipe_downloads
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable all access for authenticated users on recipe_downloads"
  ON recipe_downloads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for recipes
CREATE POLICY "Allow anon select from active recipes"
  ON recipes
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Enable all access for authenticated users on recipes"
  ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_email ON recipe_downloads (email);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_created_at ON recipe_downloads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_source ON recipe_downloads (source);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON recipes (is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipe_downloads_updated_at
    BEFORE UPDATE ON recipe_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample recipes
INSERT INTO recipes (title, description, file_url, file_name, file_size, is_active) VALUES
('Protein Power Rezepte', 'Eine Sammlung von 20 proteinreichen Rezepten für den Muskelaufbau', 'https://example.com/protein-recipes.pdf', 'protein-recipes.pdf', 2048000, true),
('Gesunde Snacks für unterwegs', '15 schnelle und gesunde Snack-Ideen für den Alltag', 'https://example.com/healthy-snacks.pdf', 'healthy-snacks.pdf', 1536000, true),
('Post-Workout Smoothies', '10 leckere Smoothie-Rezepte für nach dem Training', 'https://example.com/smoothie-recipes.pdf', 'smoothie-recipes.pdf', 1024000, true)
ON CONFLICT DO NOTHING;