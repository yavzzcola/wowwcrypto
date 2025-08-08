import crypto from 'crypto';
import { CoinPaymentsTransaction } from '@/types';

interface CoinPaymentsCredentials {
  key: string;
  secret: string;
}

interface CoinpaymentsCreateTransactionOpts {
  currency1: string;
  currency2: string;
  amount: number;
  buyer_email: string;
  address?: string;
  buyer_name?: string;
  item_name?: string;
  item_number?: string;
  invoice?: string;
  custom?: string;
  ipn_url?: string;
  success_url?: string;
  cancel_url?: string;
}

interface CoinPaymentsRatesOpts {
  short?: number;
  accepted?: number;
}

interface CoinPaymentsConfig {
  publicKey: string;
  privateKey: string;
  merchantId: string;
  ipnSecret: string;
}

class CoinPayments {
  private config: CoinPaymentsConfig;
  private baseUrl = 'https://www.coinpayments.net/api.php';

  constructor() {
    this.config = {
      publicKey: process.env.COINPAYMENTS_PUBLIC_KEY!,
      privateKey: process.env.COINPAYMENTS_PRIVATE_KEY!,
      merchantId: process.env.COINPAYMENTS_MERCHANT_ID!,
      ipnSecret: process.env.COINPAYMENTS_IPN_SECRET!,
    };
  }

  private generateHmac(data: string): string {
    return crypto.createHmac('sha512', this.config.privateKey).update(data).digest('hex');
  }

  private async makeRequest(params: Record<string, any>): Promise<any> {
    const postData = new URLSearchParams({
      version: '1',
      key: this.config.publicKey,
      format: 'json',
      ...params,
    }).toString();

    const hmac = this.generateHmac(postData);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmac,
      },
      body: postData,
    });

    if (!response.ok) {
      throw new Error(`CoinPayments API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error !== 'ok') {
      throw new Error(`CoinPayments error: ${result.error}`);
    }

    return result.result;
  }

  async createTransaction(params: {
    amount: number;
    currency1: string;
    currency2: string;
    buyerEmail?: string;
    itemName?: string;
    itemNumber?: string;
    custom?: string;
  }): Promise<CoinPaymentsTransaction> {
    const result = await this.makeRequest({
      cmd: 'create_transaction',
      amount: params.amount,
      currency1: params.currency1,
      currency2: params.currency2,
      buyer_email: params.buyerEmail,
      item_name: params.itemName,
      item_number: params.itemNumber,
      custom: params.custom,
    });

    return {
      txn_id: result.txn_id,
      address: result.address,
      amount: result.amount,
      confirms_needed: result.confirms_needed,
      timeout: result.timeout,
      checkout_url: result.checkout_url,
      status_url: result.status_url,
      qrcode_url: result.qrcode_url,
    };
  }

  async getTransactionInfo(txnId: string): Promise<any> {
    return this.makeRequest({
      cmd: 'get_tx_info',
      txid: txnId,
    });
  }

  async createWithdrawal(params: {
    amount: number;
    currency: string;
    address: string;
    pbntag?: string;
    destTag?: string;
  }): Promise<any> {
    return this.makeRequest({
      cmd: 'create_withdrawal',
      amount: params.amount,
      currency: params.currency,
      address: params.address,
      pbntag: params.pbntag,
      dest_tag: params.destTag,
    });
  }

  async getBasicInfo(): Promise<any> {
    return this.makeRequest({
      cmd: 'get_basic_info',
    });
  }

  async getDepositAddress(currency: string): Promise<any> {
    return this.makeRequest({
      cmd: 'get_deposit_address',
      currency: currency,
    });
  }

  verifyIPN(postData: any, httpHmac: string): boolean {
    const serialized = Object.keys(postData)
      .sort()
      .map(key => `${key}=${postData[key]}`)
      .join('&');
    
    const calculatedHmac = crypto
      .createHmac('sha512', this.config.ipnSecret)
      .update(serialized)
      .digest('hex');
    
    return calculatedHmac === httpHmac;
  }

  async balances(): Promise<any> {
    return this.makeRequest({
      cmd: 'balances',
    });
  }

  async rates(options?: { short?: number; accepted?: number }): Promise<any> {
    const params: any = { cmd: 'rates' };
    if (options?.short !== undefined) params.short = options.short;
    if (options?.accepted !== undefined) params.accepted = options.accepted;
    
    return this.makeRequest(params);
  }
}

export const coinpayments = new CoinPayments();
export default coinpayments;
