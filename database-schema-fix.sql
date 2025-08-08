-- Schema fix for password field inconsistency
-- Run this script to fix any existing password_hash columns

USE crypto_platform2;

-- Check if password_hash column exists and rename it to password
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND column_name = 'password_hash'
);

-- Rename password_hash to password if it exists
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255) NOT NULL', 
    'SELECT "Column password_hash does not exist, no changes needed" as status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column now exists as 'password'
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
    AND table_name = 'users' 
    AND column_name IN ('password', 'password_hash')
ORDER BY column_name;

-- Show current user table structure
SHOW CREATE TABLE users;