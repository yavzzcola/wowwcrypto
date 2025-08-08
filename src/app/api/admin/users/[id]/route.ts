'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json({ success: false, message: tokenData.message }, { status: 401 });
    }
    if (tokenData.data?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const resolvedParams = await params;
    const db = getDatabase();
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id, username, email, balance, role, referral_code, referred_by, created_at FROM users WHERE id = ? LIMIT 1',
      [resolvedParams.id]
    );

    if (!rows[0]) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json({ success: false, message: tokenData.message }, { status: 401 });
    }
    if (tokenData.data?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, role, referred_by, referral_code } = body;
    let { balance } = body as { balance?: number };
    const adjustBalance: boolean = !!body.adjustBalance;

    const updates: string[] = [];
    const paramsArr: any[] = [];

    if (typeof username === 'string' && username.length > 0) {
      updates.push('username = ?');
      paramsArr.push(username);
    }
    if (typeof email === 'string' && email.length > 0) {
      updates.push('email = ?');
      paramsArr.push(email);
    }
    if (typeof role === 'string' && role.length > 0) {
      updates.push('role = ?');
      paramsArr.push(role);
    }
    if (typeof referred_by === 'string') {
      updates.push('referred_by = ?');
      paramsArr.push(referred_by || null);
    }
    if (typeof referral_code === 'string' && referral_code.length > 0) {
      updates.push('referral_code = ?');
      paramsArr.push(referral_code);
    }

    const db = getDatabase();

    // Balance handling
    if (typeof balance === 'number' && !Number.isNaN(balance)) {
      if (adjustBalance) {
        // Adjust relative to current balance
        await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [balance, resolvedParams.id]);
      } else {
        // Set absolute balance
        await db.execute('UPDATE users SET balance = ? WHERE id = ?', [balance, resolvedParams.id]);
      }
    }

    if (updates.length > 0) {
      const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      paramsArr.push(resolvedParams.id);
      await db.execute(sql, paramsArr);
    }

    const [updated] = await db.execute<RowDataPacket[]>(
      'SELECT id, username, email, balance, role, referral_code, referred_by, created_at FROM users WHERE id = ? LIMIT 1',
      [resolvedParams.id]
    );

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

