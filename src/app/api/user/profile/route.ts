import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';
import bcrypt from 'bcryptjs';
import { sanitizeInput, isValidEmail, isValidPhone } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    const db = getDatabase();
    const [users] = await db.execute(
      'SELECT id, username, email, full_name, phone, wallet_address, balance, referral_code, role, created_at FROM users WHERE id = ?',
      [tokenData.data!.userId]
    );

    const userArray = users as any[];
    if (userArray.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile retrieved successfully',
      data: userArray[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, wallet_address, current_password, new_password } = body;

    // Validate inputs
    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Full name must be at least 2 characters'
      }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid phone number format'
      }, { status: 400 });
    }

    const db = getDatabase();
    
    // If changing password, verify current password
    if (new_password) {
      if (!current_password) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Current password is required to change password'
        }, { status: 400 });
      }

      if (new_password.length < 6) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'New password must be at least 6 characters'
        }, { status: 400 });
      }

      // Get current user password
      const [users] = await db.execute(
        'SELECT password FROM users WHERE id = ?',
        [tokenData.data!.userId]
      );

      const userArray = users as any[];
      if (userArray.length === 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }

      const isValidPassword = await bcrypt.compare(current_password, userArray[0].password);
      if (!isValidPassword) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Current password is incorrect'
        }, { status: 400 });
      }

      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      
      await db.execute(
        'UPDATE users SET full_name = ?, phone = ?, wallet_address = ?, password = ?, updated_at = NOW() WHERE id = ?',
        [sanitizeInput(full_name), phone ? sanitizeInput(phone) : null, 
         wallet_address ? sanitizeInput(wallet_address) : null, hashedNewPassword, tokenData.data!.userId]
      );
    } else {
      // Update without password change
      await db.execute(
        'UPDATE users SET full_name = ?, phone = ?, wallet_address = ?, updated_at = NOW() WHERE id = ?',
        [sanitizeInput(full_name), phone ? sanitizeInput(phone) : null, 
         wallet_address ? sanitizeInput(wallet_address) : null, tokenData.data!.userId]
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
