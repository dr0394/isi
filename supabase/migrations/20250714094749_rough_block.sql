/*
  # Recipe Downloads System

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `title` (text, recipe title)
      - `description` (text, optional description)
      - `file_url` (text, download URL)
      - `file_name` (text, original filename)
      - `file_size` (integer, file size in bytes)
      - `download_count` (integer, tracking downloads)
      - `is_active` (boolean, enable/disable recipe)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `recipe_downloads`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, foreign key to recipes)
      - `name` (text, user name)
      - `email` (text, user email)
      - `source` (text, tracking source)
      - `utm_source` (text, UTM tracking)
      - `utm_medium` (text, UTM tracking)
      - `utm_campaign` (text, UTM tracking)
      - `landing_page_url` (text, page URL)
      - `referrer` (text, referrer URL)
      - `user_agent` (text, browser info)
      - `ip_address` (text, user IP)
      - `downloaded_at` (timestamp, when downloaded)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Allow anonymous users to read active recipes
    - Allow anonymous users to insert download records
    - Allow authenticated users full access for admin

  3. Functions
    - Function to increment download count
*/

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

-- Create recipe_downloads table
CREATE TABLE IF NOT EXISTS recipe_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  source text DEFAULT 'recipe-page',
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

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_downloads ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON recipes TO anon;
GRANT INSERT ON recipe_downloads TO anon;
GRANT SELECT ON recipe_downloads TO anon;

-- Grant full access to authenticated users (admin)
GRANT ALL ON recipes TO authenticated;
GRANT ALL ON recipe_downloads TO authenticated;

-- RLS Policies for recipes
CREATE POLICY "Allow anon to read active recipes"
  ON recipes
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Allow authenticated full access to recipes"
  ON recipes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for recipe_downloads
CREATE POLICY "Allow anon to insert recipe downloads"
  ON recipe_downloads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to read own downloads"
  ON recipe_downloads
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated full access to recipe downloads"
  ON recipe_downloads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to increment download count
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

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_active ON recipes (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_recipe_id ON recipe_downloads (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_email ON recipe_downloads (email);
CREATE INDEX IF NOT EXISTS idx_recipe_downloads_created_at ON recipe_downloads (created_at DESC);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_downloads_updated_at
  BEFORE UPDATE ON recipe_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();