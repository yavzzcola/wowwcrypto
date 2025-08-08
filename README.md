# Crypto Platform - ICO Token Investment Platform

A secure Next.js-based cryptocurrency investment platform with CoinPayments integration, referral system, and admin panel.

## 🚀 Features

### User Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Token Investment**: Buy platform tokens using various cryptocurrencies via CoinPayments
- **Referral System**: Earn commission by referring new users (configurable percentage)
- **Wallet Management**: Secure withdrawal to crypto wallets
- **Transaction History**: Complete transaction tracking
- **Dashboard**: User-friendly interface with balance and statistics

### Admin Features
- **User Management**: View and manage all users
- **Withdrawal Management**: Approve/reject withdrawal requests
- **System Settings**: Configure supply limits, fees, and referral percentages
- **Transaction Monitoring**: Monitor all platform transactions

### Technical Features
- **Secure Payment Processing**: CoinPayments integration with IPN verification
- **Database**: MySQL with proper schema and relationships
- **Security**: bcrypt password hashing, JWT authentication, input validation
- **Rate Limiting**: Protection against brute-force attacks
- **Responsive Design**: Mobile-friendly Tailwind CSS interface
- **TypeScript**: Full type safety

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js
- **Database**: MySQL 8
- **Authentication**: JWT, bcrypt
- **Payment**: CoinPayments API
- **Email**: Nodemailer (for password reset)
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ installed
- MySQL 8+ running
- CoinPayments account (for payment processing)
- SMTP email service (for password reset)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd crypto-platform
npm install
```

### 2. Environment Setup

Copy the environment file and configure:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your settings:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_platform

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# CoinPayments
COINPAYMENTS_PUBLIC_KEY=your_coinpayments_public_key
COINPAYMENTS_PRIVATE_KEY=your_coinpayments_private_key
COINPAYMENTS_MERCHANT_ID=your_merchant_id
COINPAYMENTS_IPN_SECRET=your_ipn_secret

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Site
SITE_URL=http://localhost:3000

# Database Init Secret
INIT_SECRET=your-database-init-secret-key
```

### 3. Database Setup

Create MySQL database:

```sql
CREATE DATABASE crypto_platform;
```

Initialize database tables via API:

```bash
curl -X POST http://localhost:3000/api/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-database-init-secret-key"}'
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Users Table
```sql
users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  referral_code VARCHAR(255) UNIQUE,
  referrer_id INT,
  is_admin TINYINT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Transactions Table
```sql
transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type ENUM('deposit', 'referral_commission'),
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  status ENUM('pending', 'completed', 'failed'),
  external_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Withdrawals Table
```sql
withdrawals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  amount DECIMAL(10, 2),
  crypto_address VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected', 'processed'),
  approved_by_admin_id INT,
  transaction_fee DECIMAL(10, 2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### System Settings Table
```sql
system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE,
  value VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Payments
- `POST /api/payments/deposit` - Create deposit transaction
- `POST /api/payments/ipn` - CoinPayments IPN callback

### Withdrawals
- `POST /api/withdrawals/request` - Request withdrawal
- `GET /api/withdrawals/request` - Get user withdrawals

### Admin
- `GET /api/admin/withdrawals` - Get withdrawal requests
- `POST /api/admin/withdrawals/[id]/approve` - Approve withdrawal

## 🔧 Configuration

### System Settings

Configurable via database `system_settings` table:

- `max_supply`: Maximum token supply (default: 1,000,000)
- `current_supply`: Current tokens in circulation
- `referral_percentage`: Referral commission percentage (default: 5%)
- `withdraw_fee_percentage`: Withdrawal fee percentage (default: 2%)

### CoinPayments Setup

1. Create CoinPayments account
2. Generate API keys in account settings
3. Set up IPN URL: `https://yourdomain.com/api/payments/ipn`
4. Configure supported currencies

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Built-in protection against abuse
- **HTTPS Enforcement**: Production security headers
- **IPN Verification**: CoinPayments signature validation

## 🚦 Admin Panel

Access admin features at `/admin` (admin users only):

1. Create admin user by setting `is_admin = 1` in database
2. Login and navigate to admin panel
3. Manage withdrawals, users, and system settings

## 📱 Frontend Pages

- `/` - Landing page
- `/register` - User registration
- `/login` - User login
- `/dashboard` - User dashboard
- `/deposit` - Deposit funds
- `/withdraw` - Withdraw funds
- `/transactions` - Transaction history
- `/profile` - User profile settings
- `/admin` - Admin panel

## 🧪 Testing

### Manual Testing

1. **Registration Flow**:
   - Register new user
   - Verify referral code works
   - Check database entries

2. **Payment Flow**:
   - Create deposit transaction
   - Test IPN callback
   - Verify balance updates

3. **Withdrawal Flow**:
   - Request withdrawal
   - Admin approval process
   - CoinPayments integration

## 📈 Production Deployment

### Environment Variables

Update production environment:

```env
NODE_ENV=production
JWT_SECRET=generate-strong-secret
SITE_URL=https://yourdomain.com
# Update all database and API credentials
```

### Security Checklist

- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] Database credentials secured
- [ ] CoinPayments IPN URL configured
- [ ] SMTP settings configured
- [ ] Admin user created
- [ ] System settings configured

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Fails**:
   - Check MySQL service is running
   - Verify credentials in `.env.local`
   - Ensure database exists

2. **CoinPayments IPN Not Working**:
   - Check IPN URL is publicly accessible
   - Verify IPN secret matches
   - Check server logs for errors

3. **JWT Token Issues**:
   - Ensure JWT_SECRET is set
   - Clear browser cookies
   - Check token expiration

### Logs

Check application logs:

```bash
# Development
npm run dev

# Production (if using PM2)
pm2 logs crypto-platform
```

## 📄 License

This project is for educational and development purposes. Ensure compliance with local regulations before deploying cryptocurrency-related applications.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## ⚠️ Disclaimer

This is a development template. Before using in production:

- Conduct security audit
- Implement additional rate limiting
- Add comprehensive logging
- Test all payment flows
- Verify regulatory compliance
- Add monitoring and alerts

Cryptocurrency investments carry risk. Ensure proper disclaimers and comply with local regulations.
