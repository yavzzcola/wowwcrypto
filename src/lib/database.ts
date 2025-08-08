import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crypto_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;

export function getDatabase() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Database initialization script
export async function initializeDatabase() {
  const db = getDatabase();
  
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        referral_code VARCHAR(255) UNIQUE,
        referrer_id INT,
        is_admin TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (referrer_id) REFERENCES users(id)
      )
    `);

    // Create transactions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM('deposit', 'referral_commission', 'withdrawal') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        external_id VARCHAR(255),
        gateway_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_external_id (external_id),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create payments table for CoinPayments transactions
    await db.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
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
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_txn_id (txn_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create withdrawals table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        crypto_address VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
        approved_by_admin_id INT,
        transaction_fee DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (approved_by_admin_id) REFERENCES users(id)
      )
    `);

    // Create system_settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create allowed cryptocurrencies table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS allowed_cryptocurrencies (
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
      )
    `);

    // Insert default system settings
    const defaultSettings = [
      ['max_supply', '1000000'],
      ['current_supply', '0'],
      ['token_price', '1.00'],
      ['abc_coin_symbol', 'ABC'],
      ['referral_commission', '10'],
      ['min_deposit', '10.00'],
      ['min_withdrawal', '50.00'],
      ['withdrawal_fee', '5.00'],
      ['platform_name', 'Crypto Platform'],
      ['contact_email', 'support@cryptoplatform.com'],
    ];

    // Insert default allowed cryptocurrencies
    const allowedCryptos = [
      ['BTC', 'Bitcoin', 1, 0.0001, 10.0, 1],
      ['ETH', 'Ethereum', 1, 0.001, 100.0, 2],
      ['USDT', 'Tether USD', 1, 10.0, 50000.0, 3],
      ['LTC', 'Litecoin', 1, 0.01, 1000.0, 4],
      ['BCH', 'Bitcoin Cash', 1, 0.01, 500.0, 5],
      ['DASH', 'Dash', 1, 0.01, 1000.0, 6],
    ];

    for (const [key, value] of defaultSettings) {
      await db.execute(
        'INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
    }

    // Insert allowed cryptocurrencies
    for (const [symbol, name, is_active, min_amount, max_amount, sort_order] of allowedCryptos) {
      await db.execute(
        'INSERT IGNORE INTO allowed_cryptocurrencies (symbol, name, is_active, min_amount, max_amount, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [symbol, name, is_active, min_amount, max_amount, sort_order]
      );
    }

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default getDatabase;
