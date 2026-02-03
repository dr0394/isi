/*
  # Update waitlist entries schema for multistep form

  1. Schema Changes
    - Convert notes column to jsonb for better JSON operations
    - Add proper indexing for JSON queries

  2. Data Updates
    - Update existing entries with structured JSON data
    - Add sample multistep form data for testing

  3. Performance
    - Add GIN index for efficient JSON queries
    - Maintain existing indexes
*/

-- First, let's convert the notes column to jsonb if it's currently text
-- This will allow us to use proper JSON operations and indexing
DO $$
BEGIN
  -- Check if notes column is text and convert to jsonb
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waitlist_entries' 
    AND column_name = 'notes' 
    AND data_type = 'text'
  ) THEN
    -- Convert existing text data to jsonb, handling null values
    UPDATE waitlist_entries 
    SET notes = CASE 
      WHEN notes IS NULL OR notes = '' THEN '{}'::jsonb
      ELSE 
        CASE 
          WHEN notes::text ~ '^[\s]*\{.*\}[\s]*$' THEN notes::jsonb
          ELSE jsonb_build_object('legacy_note', notes)
        END
    END;
    
    -- Change column type to jsonb
    ALTER TABLE waitlist_entries ALTER COLUMN notes TYPE jsonb USING 
      CASE 
        WHEN notes IS NULL THEN '{}'::jsonb
        ELSE notes::jsonb
      END;
  END IF;
END $$;

-- Add GIN index for efficient JSON operations on notes column
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_notes_gin 
ON waitlist_entries USING gin (notes);

-- Add index for JSON path queries (commonly used patterns)
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_notes_primary_goal 
ON waitlist_entries USING btree ((notes->>'primaryGoal'));

CREATE INDEX IF NOT EXISTS idx_waitlist_entries_notes_fitness_level 
ON waitlist_entries USING btree ((notes->>'currentFitnessLevel'));

-- Update existing sample data to include more detailed information
-- Only update if the entries exist and don't already have structured data
UPDATE waitlist_entries 
SET notes = jsonb_build_object(
  'phone', '+49 123 456 789',
  'primaryGoal', 'weight-loss',
  'currentFitnessLevel', 'beginner',
  'previousExperience', 'Keine Erfahrung mit Personal Training',
  'availableTime', '3-4h',
  'preferredTime', 'evening',
  'motivation', 'Ich möchte endlich wieder fit werden und mich in meinem Körper wohlfühlen.',
  'challenges', '["Zeitmangel", "Motivation aufrechterhalten"]'::jsonb,
  'hearAboutUs', 'instagram',
  'additionalNotes', '',
  'submittedAt', now()::text,
  'formType', 'multistep'
)
WHERE email = 'sarah.mueller@email.com' 
AND (notes IS NULL OR NOT (notes ? 'formType'));

UPDATE waitlist_entries 
SET notes = jsonb_build_object(
  'phone', '+49 987 654 321',
  'primaryGoal', 'muscle-gain',
  'currentFitnessLevel', 'intermediate',
  'previousExperience', 'Trainiere seit 6 Monaten im Fitnessstudio',
  'availableTime', '5-6h',
  'preferredTime', 'morning',
  'motivation', 'Ich will stärker werden und Muskeln aufbauen für mehr Selbstvertrauen.',
  'challenges', '["Richtige Ernährung", "Plateau überwinden"]'::jsonb,
  'hearAboutUs', 'youtube',
  'additionalNotes', 'Interessiert an Krafttraining-Tipps',
  'submittedAt', now()::text,
  'formType', 'multistep'
)
WHERE email = 'marcus.klein@email.com'
AND (notes IS NULL OR NOT (notes ? 'formType'));

UPDATE waitlist_entries 
SET notes = jsonb_build_object(
  'phone', '+49 555 123 456',
  'primaryGoal', 'fitness',
  'currentFitnessLevel', 'beginner',
  'previousExperience', 'Sporadisches Training zuhause',
  'availableTime', '1-2h',
  'preferredTime', 'afternoon',
  'motivation', 'Gesünder leben und mehr Energie im Alltag haben.',
  'challenges', '["Selbstdisziplin", "Work-Life-Balance"]'::jsonb,
  'hearAboutUs', 'friend',
  'additionalNotes', 'Arbeite im Büro und brauche Ausgleich',
  'submittedAt', now()::text,
  'formType', 'multistep'
)
WHERE email = 'lisa.wagner@email.com'
AND (notes IS NULL OR NOT (notes ? 'formType'));

-- Insert some additional sample data for testing the multistep form
INSERT INTO waitlist_entries (first_name, email, registered_at, status, source, notes)
VALUES 
(
  'Anna Weber',
  'anna.weber@test.com',
  now(),
  'pending',
  'multistep-form',
  jsonb_build_object(
    'phone', '+49 176 123 456',
    'primaryGoal', 'health',
    'currentFitnessLevel', 'beginner',
    'previousExperience', 'Yoga-Kurse besucht',
    'availableTime', '3-4h',
    'preferredTime', 'morning',
    'motivation', 'Nach der Schwangerschaft wieder in Form kommen und gesund leben.',
    'challenges', '["Zeitmangel", "Work-Life-Balance", "Motivation aufrechterhalten"]'::jsonb,
    'hearAboutUs', 'instagram',
    'additionalNotes', 'Habe vor 6 Monaten entbunden',
    'submittedAt', now()::text,
    'formType', 'multistep'
  )
),
(
  'Tom Fischer',
  'tom.fischer@test.com',
  now(),
  'pending',
  'multistep-form',
  jsonb_build_object(
    'phone', '+49 151 987 654',
    'primaryGoal', 'strength',
    'currentFitnessLevel', 'advanced',
    'previousExperience', '5 Jahre Krafttraining, suche neue Impulse',
    'availableTime', '7h+',
    'preferredTime', 'evening',
    'motivation', 'Plateau durchbrechen und neue Trainingsmethoden lernen.',
    'challenges', '["Plateau überwinden", "Richtige Ernährung"]'::jsonb,
    'hearAboutUs', 'youtube',
    'additionalNotes', 'Interessiert an fortgeschrittenen Techniken',
    'submittedAt', now()::text,
    'formType', 'multistep'
  )
)
ON CONFLICT (email) DO NOTHING;