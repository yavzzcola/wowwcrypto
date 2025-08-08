import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { coinpayments } from '@/lib/coinpayments';
import { paymentService } from '@/lib/payments';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    // Get POST data
    const formData = await request.formData();
    const postData: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      postData[key] = value.toString();
    });

    // Get HMAC from headers
    const httpHmac = request.headers.get('HTTP_HMAC') || 
                     request.headers.get('HMAC') || 
                     request.headers.get('hmac') || '';

    // Verify IPN authenticity
    if (!coinpayments.verifyIPN(postData, httpHmac)) {
      console.error('IPN verification failed', { httpHmac, postData });
      return NextResponse.json({
        success: false,
        message: 'Invalid IPN signature'
      }, { status: 401 });
    }

    const db = getDatabase();
    const txnId = postData.txn_id;
    const status = parseInt(postData.status || '0');
    const receivedAmount = parseFloat(postData.amount || '0');
    const currency = postData.currency || '';
    const custom = postData.custom || '';

    console.log('IPN received:', { 
      txnId, 
      status, 
      receivedAmount, 
      currency, 
      custom,
      full_postData: postData 
    });

    // Find the payment in our database
    const [paymentRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM payments WHERE txn_id = ?',
      [txnId]
    );

    if (!paymentRows || paymentRows.length === 0) {
      console.error('Payment not found:', txnId);
      return NextResponse.json({
        success: false,
        message: 'Payment not found'
      }, { status: 404 });
    }

    const payment = paymentRows[0];

    // Update payment status based on CoinPayments status
    let paymentStatus = 'pending';
    
    if (status >= 100 || status === 2) {
      // Payment completed (status >= 100) or confirmed (status = 2)
      paymentStatus = 'completed';
      
      await db.execute('START TRANSACTION');
      
      try {
        // Update payment status and received amount
        await db.execute(
          'UPDATE payments SET status = ?, received_amount = ?, updated_at = NOW() WHERE txn_id = ?',
          [paymentStatus, receivedAmount, txnId]
        );

        // Calculate ABC coin amount based on USD amount received
        const abcCoinAmount = await paymentService.calculateCoinAmount(receivedAmount);

        // Add ABC coin balance to user
        await db.execute(
          'UPDATE users SET balance = balance + ?, updated_at = NOW() WHERE id = ?',
          [abcCoinAmount, payment.user_id]
        );

        // Create transaction record for the deposit
        await db.execute(
          `INSERT INTO transactions (user_id, type, amount, currency, status, external_id, gateway_data)
           VALUES (?, 'deposit', ?, ?, 'completed', ?, ?)`,
          [
            payment.user_id, 
            abcCoinAmount, 
            'ABC', 
            txnId,
            JSON.stringify({ 
              crypto_amount: receivedAmount, 
              crypto_currency: currency,
              usd_amount: payment.amount 
            })
          ]
        );

        // Update current supply
        await db.execute(
          'UPDATE system_settings SET setting_value = CAST(setting_value AS DECIMAL(15,2)) + ? WHERE setting_key = "current_supply"',
          [abcCoinAmount]
        );

        // Process referral commission if user has a referrer and commission not already paid
        if (!payment.referral_paid) {
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
              
              // Calculate commission in ABC coins
              const commissionAbcCoins = await paymentService.calculateCoinAmount(payment.referral_commission);
              
              // Add referral commission to referrer's balance
              await db.execute(
                'UPDATE users SET balance = balance + ?, updated_at = NOW() WHERE id = ?',
                [commissionAbcCoins, referrerId]
              );

              // Create referral commission transaction
              await db.execute(
                `INSERT INTO transactions (user_id, type, amount, currency, status, external_id, gateway_data)
                 VALUES (?, 'referral_commission', ?, ?, 'completed', ?, ?)`,
                [
                  referrerId, 
                  commissionAbcCoins, 
                  'ABC', 
                  `REF_${txnId}`,
                  JSON.stringify({ 
                    referral_from: payment.user_id,
                    commission_rate: '10%',
                    original_deposit: receivedAmount,
                    usd_commission: payment.referral_commission
                  })
                ]
              );

              // Mark referral as paid in payments table
              await db.execute(
                'UPDATE payments SET referral_paid = 1 WHERE txn_id = ?',
                [txnId]
              );

              console.log('Referral commission processed:', {
                referrerId,
                commissionAbcCoins,
                originalPayment: receivedAmount
              });
            }
          }
        }

        await db.execute('COMMIT');
        console.log('Payment completed successfully:', txnId, 'ABC coins awarded:', abcCoinAmount);
        
      } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
      }
      
    } else if (status < 0) {
      // Payment failed
      paymentStatus = 'cancelled';
      await db.execute(
        'UPDATE payments SET status = ?, updated_at = NOW() WHERE txn_id = ?',
        [paymentStatus, txnId]
      );
      
      console.log('Payment failed:', txnId);
    } else if (status === 1) {
      // Payment partially confirmed
      paymentStatus = 'partial';
      await db.execute(
        'UPDATE payments SET status = ?, received_amount = ?, updated_at = NOW() WHERE txn_id = ?',
        [paymentStatus, receivedAmount, txnId]
      );
      
      console.log('Payment partially confirmed:', txnId);
    }
    // For status 0, keep as pending

    return NextResponse.json({
      success: true,
      message: 'IPN processed successfully',
      data: {
        txn_id: txnId,
        status: paymentStatus,
        received_amount: receivedAmount
      }
    });

  } catch (error) {
    console.error('IPN processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'IPN processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
