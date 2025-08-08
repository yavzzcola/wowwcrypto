import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';

interface TokenVerificationResult {
  success: boolean;
  message: string;
  data?: JWTPayload;
}

export async function verifyToken(request: NextRequest): Promise<TokenVerificationResult> {
  try {
    // Get token from cookies or Authorization header
    let token = request.cookies.get('token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return {
        success: false,
        message: 'No token provided'
      };
    }

    if (!process.env.JWT_SECRET) {
      return {
        success: false,
        message: 'Server configuration error'
      };
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    return {
      success: true,
      message: 'Token verified successfully',
      data: decoded
    };

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message: 'Token expired'
      };
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        message: 'Invalid token'
      };
    }

    return {
      success: false,
      message: 'Token verification failed'
    };
  }
}

export async function verifyAdminToken(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    
    if (!tokenVerification.success) {
      return {
        success: false,
        response: NextResponse.json({
          success: false,
          message: tokenVerification.message
        }, { status: 401 })
      };
    }

    // Check if user has admin role
    if (tokenVerification.data?.role !== 'admin') {
      return {
        success: false,
        response: NextResponse.json({
          success: false,
          message: 'Admin access required'
        }, { status: 403 })
      };
    }

    return {
      success: true,
      data: tokenVerification.data
    };
    
  } catch (error) {
    console.error('Admin token verification error:', error);
    return {
      success: false,
      response: NextResponse.json({
        success: false,
        message: 'Authentication error'
      }, { status: 500 })
    };
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export async function requireAuth(request: NextRequest): Promise<TokenVerificationResult> {
  const result = await verifyToken(request);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return result;
}

export async function requireAdmin(request: NextRequest): Promise<TokenVerificationResult> {
  const result = await requireAuth(request);
  
  if (result.data?.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return result;
}

export function createAuthResponse(success: boolean, message: string, data?: any) {
  return {
    success,
    message,
    data
  };
}
