import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/lib/database';
import { LoginCredentials, ApiResponse, JWTPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginCredentials = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Find user
    const [users] = await db.execute(
      'SELECT id, email, username, password, role FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      isAdmin: user.role === 'admin',
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    // Create response
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.role === 'admin'
        }
      }
    });

    // Set secure cookie
    response.cookies.set('token', token, {
      httpOnly: true,   // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'strict', // CSRF protection
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
