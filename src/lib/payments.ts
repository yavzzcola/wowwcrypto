import { getDatabase } from './database';
import { coinpayments } from './coinpayments';
import { RowDataPacket } from 'mysql2';

interface CreatePaymentParams {
  userId: number;
  amount: number;
  currency1: string;
  currency2: string;
  buyerEmail: string;
  buyerName?: string;
  itemName?: string;
  itemNumber?: string;
}

interface Payment extends RowDataPacket {
  id: number;
  user_id: number;
  txn_id: string;
  address: string;
  checkout_url: string;
  status_url: string;
  qrcode_url: string;
  amount: number;
  currency1: string;
  currency2: string;
  status: string;
  created_at: Date;
}

export class PaymentService {
  private db = getDatabase();

  async createPayment(params: CreatePaymentParams) {
    const { userId, amount, currency1, currency2, buyerEmail, buyerName, itemName, itemNumber } = params;

    try {
      // Create transaction with CoinPayments
      const coinPaymentResult = await coinpayments.createTransaction({
        amount,
        currency1,
        currency2,
        buyerEmail,
        itemName,
        itemNumber,
        custom: `user_${userId}`,
      });

      // Calculate referral commission
      const [settingsRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['referral_commission']
      );
      const referralPercentage = parseInt(settingsRows[0]?.setting_value || '10');
      const referralCommission = (amount * referralPercentage) / 100;

      // Store payment in database
      const [result] = await this.db.execute(
        `INSERT INTO payments (
          user_id, txn_id, address, checkout_url, status_url, qrcode_url,
          amount, currency1, currency2, confirms_needed, timeout,
          buyer_email, buyer_name, item_name, item_number, custom,
          referral_commission, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          coinPaymentResult.txn_id,
          coinPaymentResult.address,
          coinPaymentResult.checkout_url,
          coinPaymentResult.status_url,
          coinPaymentResult.qrcode_url,
          coinPaymentResult.amount,
          currency1,
          currency2,
          coinPaymentResult.confirms_needed,
          coinPaymentResult.timeout,
          buyerEmail,
          buyerName,
          itemName,
          itemNumber,
          `user_${userId}`,
          referralCommission,
          'pending'
        ]
      );

      return {
        paymentId: (result as any).insertId,
        ...coinPaymentResult,
        referralCommission
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPayment(txnId: string): Promise<Payment | null> {
    const [rows] = await this.db.execute<Payment[]>(
      'SELECT * FROM payments WHERE txn_id = ?',
      [txnId]
    );
    return rows[0] || null;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    const [rows] = await this.db.execute<Payment[]>(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  async updatePaymentStatus(txnId: string, status: string, receivedAmount?: number) {
    await this.db.execute(
      'UPDATE payments SET status = ?, received_amount = ?, updated_at = NOW() WHERE txn_id = ?',
      [status, receivedAmount || 0, txnId]
    );

    if (status === 'completed') {
      const payment = await this.getPayment(txnId);
      if (payment) {
        await this.processCompletedPayment(payment);
      }
    }
  }

  private async processCompletedPayment(payment: Payment) {
    const db = getDatabase();
    
    try {
      await db.execute('START TRANSACTION');

      // Add balance to user
      await db.execute(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [payment.received_amount || payment.amount, payment.user_id]
      );

      // Create transaction record
      await db.execute(
        `INSERT INTO transactions (user_id, type, amount, currency, status, external_id)
         VALUES (?, 'deposit', ?, ?, 'completed', ?)`,
        [payment.user_id, payment.received_amount || payment.amount, payment.currency1, payment.txn_id]
      );

      // Process referral commission if user has a referrer
      const [userRows] = await db.execute<RowDataPacket[]>(
        'SELECT referred_by FROM users WHERE id = ?',
        [payment.user_id]
      );

      const referredBy = userRows[0]?.referred_by;
      if (referredBy && payment.referral_commission > 0) {
        // Find referrer user ID
        const [referrerRows] = await db.execute<RowDataPacket[]>(
          'SELECT id FROM users WHERE referral_code = ?',
          [referredBy]
        );

        if (referrerRows[0]) {
          const referrerId = referrerRows[0].id;
          
          // Add referral commission to referrer's balance
          await db.execute(
            'UPDATE users SET balance = balance + ? WHERE id = ?',
            [payment.referral_commission, referrerId]
          );

          // Create referral commission transaction
          await db.execute(
            `INSERT INTO transactions (user_id, type, amount, currency, status, external_id)
             VALUES (?, 'referral_commission', ?, ?, 'completed', ?)`,
            [referrerId, payment.referral_commission, 'USD', `REF_${payment.txn_id}`]
          );

          // Mark referral as paid
          await db.execute(
            'UPDATE payments SET referral_paid = 1 WHERE txn_id = ?',
            [payment.txn_id]
          );
        }
      }

      await db.execute('COMMIT');
    } catch (error) {
      await db.execute('ROLLBACK');
      console.error('Error processing completed payment:', error);
      throw error;
    }
  }

  async calculateCoinAmount(usdAmount: number): Promise<number> {
    try {
      // Get current token price and supply from settings
      const [priceRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['token_price']
      );
      
      const [supplyRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['current_supply']
      );

      const [maxSupplyRows] = await this.db.execute<RowDataPacket[]>(
        'SELECT setting_value FROM system_settings WHERE setting_key = ?',
        ['max_supply']
      );

      const currentPrice = parseFloat(priceRows[0]?.setting_value || '1.0');
      const currentSupply = parseInt(supplyRows[0]?.setting_value || '0');
      const maxSupply = parseInt(maxSupplyRows[0]?.setting_value || '1000000');

      // Calculate dynamic price based on supply (simple algorithm)
      const supplyRatio = currentSupply / maxSupply;
      const priceMultiplier = 1 + (supplyRatio * 2); // Price increases as supply decreases
      const dynamicPrice = currentPrice * priceMultiplier;

      // Calculate how many coins user gets
      const coinAmount = usdAmount / dynamicPrice;
      
      return Math.floor(coinAmount * 100000000) / 100000000; // 8 decimal precision
    } catch (error) {
      console.error('Error calculating coin amount:', error);
      return usdAmount; // Fallback to 1:1 ratio
    }
  }
}

export const paymentService = new PaymentService();