-- Add profile_pic column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_pic VARCHAR(500);

-- Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_profile_pic ON users(profile_pic);

-- Display updated table structure
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
