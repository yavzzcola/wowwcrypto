-- Fix transactions table to include withdrawal type
ALTER TABLE transactions MODIFY type ENUM('deposit', 'referral_commission', 'withdrawal') NOT NULL;