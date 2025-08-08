export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  referral_code: string | null;
  referrer_id: number | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'referral_commission';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  external_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  crypto_address: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  approved_by_admin_id: number | null;
  transaction_fee: number;
  created_at: Date;
  updated_at: Date;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  referral_code?: string;
}

export interface WithdrawalRequest {
  amount: number;
  crypto_address: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface JWTPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
  role: string;
}

export interface CoinPaymentsTransaction {
  txn_id: string;
  address: string;
  amount: number;
  confirms_needed: number;
  timeout: number;
  checkout_url: string;
  status_url: string;
  qrcode_url: string;
}

export interface SystemStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  currentSupply: number;
  maxSupply: number;
}
