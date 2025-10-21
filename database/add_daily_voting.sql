-- Add vote_date column to votes table for daily voting reset
-- This allows users to vote once per day

-- Step 1: Add vote_date column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='votes' 
        AND column_name='vote_date'
    ) THEN
        ALTER TABLE votes ADD COLUMN vote_date DATE DEFAULT CURRENT_DATE;
        
        -- Update existing votes to have vote_date from timestamp
        UPDATE votes SET vote_date = DATE(timestamp) WHERE vote_date IS NULL;
        
        -- Make vote_date NOT NULL after populating
        ALTER TABLE votes ALTER COLUMN vote_date SET NOT NULL;
        
        RAISE NOTICE 'Added vote_date column to votes table';
    ELSE
        RAISE NOTICE 'vote_date column already exists';
    END IF;
END $$;

-- Step 2: Drop old UNIQUE constraint (user can vote once per day, not once ever)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'votes_user_id_key'
    ) THEN
        ALTER TABLE votes DROP CONSTRAINT votes_user_id_key;
        RAISE NOTICE 'Dropped old votes_user_id_key constraint';
    END IF;
END $$;

-- Step 3: Add new UNIQUE constraint (user_id + vote_date = one vote per user per day)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'votes_user_date_unique'
    ) THEN
        ALTER TABLE votes ADD CONSTRAINT votes_user_date_unique UNIQUE (user_id, vote_date);
        RAISE NOTICE 'Added votes_user_date_unique constraint';
    ELSE
        RAISE NOTICE 'votes_user_date_unique constraint already exists';
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- Show constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'votes'::regclass;
