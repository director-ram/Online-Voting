-- Add DOB and Gender columns to candidates table
-- Migration script to add missing columns

ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN candidates.dob IS 'Date of birth of the candidate';
COMMENT ON COLUMN candidates.gender IS 'Gender of the candidate';

