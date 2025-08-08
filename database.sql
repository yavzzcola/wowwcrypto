-- Crypto Platform Database Schema
-- Created for Next.js crypto payment and referral system

-- Create database
CREATE DATABASE IF NOT EXISTS crypto_platform2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crypto_platform2;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    wallet_address VARCHAR(255),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_referral_code (referral_code),
    INDEX idx_referred_by (referred_by),
    INDEX idx_role (role)
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'referral_commission', 'withdrawal') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    external_id VARCHAR(255),
    gateway_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_external_id (external_id),
    INDEX idx_created_at (created_at)
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BTC',
    address VARCHAR(255) NOT NULL,
    fee DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
    external_id VARCHAR(255),
    rejection_reason TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Payments table for CoinPayments transactions
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    txn_id VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    checkout_url VARCHAR(500),
    status_url VARCHAR(500),
    qrcode_url VARCHAR(500),
    amount DECIMAL(15, 8) NOT NULL,
    currency1 VARCHAR(10) NOT NULL,
    currency2 VARCHAR(10) NOT NULL,
    confirms_needed INT DEFAULT 0,
    timeout INT DEFAULT 3600,
    buyer_email VARCHAR(100),
    buyer_name VARCHAR(100),
    item_name VARCHAR(255),
    item_number VARCHAR(100),
    invoice VARCHAR(100),
    custom VARCHAR(255),
    ipn_url VARCHAR(500),
    success_url VARCHAR(500),
    cancel_url VARCHAR(500),
    status ENUM('pending', 'partial', 'completed', 'timeout', 'cancelled') DEFAULT 'pending',
    received_amount DECIMAL(15, 8) DEFAULT 0.00,
    referral_commission DECIMAL(15, 2) DEFAULT 0.00,
    referral_paid TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_txn_id (txn_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key)
);

-- Allowed cryptocurrencies table
CREATE TABLE allowed_cryptocurrencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active TINYINT DEFAULT 1,
    min_amount DECIMAL(15, 8) DEFAULT 0.00000001,
    max_amount DECIMAL(15, 8) DEFAULT 9999999.99999999,
    sort_order INT DEFAULT 0,
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_symbol (symbol),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_supply', '1000000', 'Maximum token supply'),
('current_supply', '0', 'Current circulating supply'),
('token_price', '1.00', 'Current token price in USD'),
('abc_coin_symbol', 'ABC', 'ABC coin symbol'),
('referral_commission', '10', 'Referral commission percentage'),
('min_deposit', '10.00', 'Minimum deposit amount'),
('min_withdrawal', '50.00', 'Minimum withdrawal amount'),
('withdrawal_fee', '5.00', 'Withdrawal fee amount'),
('withdraw_fee_percentage', '2', 'Withdrawal fee percentage'),
('platform_name', 'Crypto Platform', 'Platform name'),
('contact_email', 'support@cryptoplatform.com', 'Contact email'),
('coinpayments_merchant_id', '', 'CoinPayments merchant ID'),
('coinpayments_ipn_secret', '', 'CoinPayments IPN secret'),
('coinpayments_public_key', '', 'CoinPayments public key'),
('coinpayments_private_key', '', 'CoinPayments private key');

-- Insert default allowed cryptocurrencies
INSERT INTO allowed_cryptocurrencies (symbol, name, is_active, min_amount, max_amount, sort_order) VALUES
('BTC', 'Bitcoin', 1, 0.0001, 10.0, 1),
('ETH', 'Ethereum', 1, 0.001, 100.0, 2),
('USDT', 'Tether USD', 1, 10.0, 50000.0, 3),
('LTC', 'Litecoin', 1, 0.01, 1000.0, 4),
('BCH', 'Bitcoin Cash', 1, 0.01, 500.0, 5),
('DASH', 'Dash', 1, 0.01, 1000.0, 6);

-- Create default admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, referral_code, role) VALUES
('admin', 'admin@cryptoplatform.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'ADMIN001', 'admin');


-- Update user balances based on transactions
UPDATE users SET balance = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM transactions 
    WHERE transactions.user_id = users.id AND transactions.status = 'completed'
) - (
    SELECT COALESCE(SUM(amount + fee), 0) 
    FROM withdrawals 
    WHERE withdrawals.user_id = users.id AND withdrawals.status IN ('completed', 'pending')
);

-- Counter settings table for presale countdown
CREATE TABLE counter_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_end_date (end_date)
);

-- Insert default counter settings
INSERT INTO counter_settings (stage_name, start_date, end_date, is_active) VALUES
('ICO Presale Phase 1', '2024-12-01 00:00:00', '2025-01-15 23:59:59', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_withdrawals_amount ON withdrawals(amount);

-- Views for reporting
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.balance,
    u.referral_code,
    u.created_at,
    COALESCE(deposit_total.total, 0) as total_deposits,
    COALESCE(withdrawal_total.total, 0) as total_withdrawals,
    COALESCE(commission_total.total, 0) as total_commissions,
    COALESCE(referral_count.count, 0) as referral_count
FROM users u
LEFT JOIN (
    SELECT user_id, SUM(amount) as total
    FROM transactions 
    WHERE type = 'deposit' AND status = 'completed'
    GROUP BY user_id
) deposit_total ON u.id = deposit_total.user_id
LEFT JOIN (
    SELECT user_id, SUM(amount) as total
    FROM withdrawals 
    WHERE status = 'completed'
    GROUP BY user_id
) withdrawal_total ON u.id = withdrawal_total.user_id
LEFT JOIN (
    SELECT user_id, SUM(amount) as total
    FROM transactions 
    WHERE type = 'referral_commission' AND status = 'completed'
    GROUP BY user_id
) commission_total ON u.id = commission_total.user_id
LEFT JOIN (
    SELECT referred_by, COUNT(*) as count
    FROM users 
    WHERE referred_by IS NOT NULL
    GROUP BY referred_by
) referral_count ON u.referral_code = referral_count.referred_by;

-- Triggers for automatic balance updates
DELIMITER //

CREATE TRIGGER update_balance_after_transaction
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE users 
        SET balance = balance + NEW.amount 
        WHERE id = NEW.user_id;
    END IF;
END//

CREATE TRIGGER update_balance_after_withdrawal_approval
AFTER UPDATE ON withdrawals
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Balance was already deducted when withdrawal was requested
        -- This trigger is for logging purposes
        INSERT INTO transactions (user_id, type, amount, status, external_id)
        VALUES (NEW.user_id, 'withdrawal', -NEW.amount, 'completed', CONCAT('WD_', NEW.id));
    ELSEIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        -- Return the amount to user balance if rejected
        UPDATE users 
        SET balance = balance + NEW.amount + NEW.fee 
        WHERE id = NEW.user_id;
    END IF;
END//

DELIMITER ;

-- Security: Create a database user for the application
-- Run these commands as root/admin user
/*
CREATE USER 'crypto_app'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON crypto_platform.* TO 'crypto_app'@'localhost';
FLUSH PRIVILEGES;
*/

-- Final optimization
ANALYZE TABLE users, transactions, withdrawals, system_settings;

-- Show database summary
SELECT 'Database Setup Complete' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_transactions FROM transactions;
SELECT COUNT(*) as total_withdrawals FROM withdrawals;
SELECT COUNT(*) as total_settings FROM system_settings;
