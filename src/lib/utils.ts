import crypto from 'crypto';

// Generate a unique referral code
export function generateReferralCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Format currency values
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate secure random token
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

// Calculate transaction fee
export function calculateFee(amount: number, feePercentage: number): number {
  return (amount * feePercentage) / 100;
}

// Validate crypto address (basic validation for multiple currencies)
export function isValidCryptoAddress(address: string): boolean {
  if (!address || address.length < 20) return false;
  
  // Bitcoin addresses
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)) {
    return true;
  }
  
  // Ethereum addresses (and ERC-20 tokens like USDT)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return true;
  }
  
  // Litecoin addresses
  if (/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$|^ltc1[a-z0-9]{39,59}$/.test(address)) {
    return true;
  }
  
  // Bitcoin Cash addresses
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bitcoincash:[a-z0-9]{42,62}$|^[qp][a-z0-9]{41}$/.test(address)) {
    return true;
  }
  
  // DASH addresses
  if (/^[X7][a-km-zA-HJ-NP-Z1-9]{33}$/.test(address)) {
    return true;
  }
  
  // General crypto address pattern (most other currencies)
  if (/^[a-zA-Z0-9]{20,100}$/.test(address)) {
    return true;
  }
  
  return false;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Sleep utility for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate pagination offset
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// Calculate total pages
export function getTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}

// Sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
}

// Alias for backward compatibility
export const sanitizeInput = sanitizeString;

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  // Basic phone number validation (supports various international formats)
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Generate UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Validate positive number
export function isPositiveNumber(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

// Hash string with crypto
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
