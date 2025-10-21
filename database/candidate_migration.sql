-- Add missing columns to candidates table
-- Run this after voting_system.sql

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS position VARCHAR(255) DEFAULT 'Candidate';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Rename manifesto to description if manifesto exists (backward compatibility)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='candidates' AND column_name='manifesto') THEN
        -- Copy manifesto data to description if description is empty
        UPDATE candidates SET description = manifesto WHERE description IS NULL OR description = '';
    END IF;
END $$;

SELECT 'Candidate table migration completed!' AS message;
