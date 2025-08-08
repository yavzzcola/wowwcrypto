import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/database';
import { generateReferralCode } from '@/lib/utils';
import { RegisterData, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, referral_code }: RegisterData = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Username, email, and password are required'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User with this email or username already exists'
      }, { status: 409 });
    }

    // Check referral code if provided
    let referrerId = null;
    if (referral_code) {
      const [referrerResult] = await db.execute(
        'SELECT id FROM users WHERE referral_code = ?',
        [referral_code]
      );
      
      if (Array.isArray(referrerResult) && referrerResult.length > 0) {
        referrerId = (referrerResult[0] as any).id;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userReferralCode = generateReferralCode();

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, full_name, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, username, userReferralCode, referral_code || null]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User registered successfully',
      data: {
        id: (result as any).insertId,
        username,
        email,
        referral_code: userReferralCode
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
