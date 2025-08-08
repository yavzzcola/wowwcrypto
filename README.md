# WowCrypto - ICO Token Investment Platform

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
