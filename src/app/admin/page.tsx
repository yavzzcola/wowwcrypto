'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  totalReferrals: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalReferrals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchStats();
  }, []);

  const checkAuthAndFetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        router.push('/');
        return;
      }

      setStats(data.data || stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e12] flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage your platform from here</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-400 mb-1">Pending Withdrawals</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingWithdrawals}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400 mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-white">{stats.totalReferrals}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05))', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-400 mb-1">Total Deposits</p>
                  <p className="text-3xl font-bold text-white">{stats.totalDeposits}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/users">
              <div className="p-6 rounded-2xl transition-all duration-300 cursor-pointer group" 
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                     e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                     e.currentTarget.style.transform = 'translateY(-4px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">User Management</h3>
                    <p className="text-gray-400 text-sm">Manage users, balances, and referrals</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/withdrawals">
              <div className="p-6 rounded-2xl transition-all duration-300 cursor-pointer group" 
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                     e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                     e.currentTarget.style.transform = 'translateY(-4px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">Withdrawal Management</h3>
                    <p className="text-gray-400 text-sm">Approve/reject withdrawal requests</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/payments">
              <div className="p-6 rounded-2xl transition-all duration-300 cursor-pointer group" 
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
                     e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                     e.currentTarget.style.transform = 'translateY(-4px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Payment Overview</h3>
                    <p className="text-gray-400 text-sm">View all payments and transactions</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/referrals">
              <div className="p-6 rounded-2xl transition-all duration-300 cursor-pointer group" 
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'rgba(147, 51, 234, 0.05)';
                     e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
                     e.currentTarget.style.transform = 'translateY(-4px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Referral System</h3>
                    <p className="text-gray-400 text-sm">Track referrals and commissions</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/settings">
              <div className="p-6 rounded-2xl transition-all duration-300 cursor-pointer group" 
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                     e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                     e.currentTarget.style.transform = 'translateY(-4px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-gray-300 transition-colors">System Settings</h3>
                    <p className="text-gray-400 text-sm">Manage platform settings</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/cryptocurrencies">
              <div className="p-6 rounded-2xl transition-all duration-300 cursor-pointer group" 
                   style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'rgba(251, 191, 36, 0.05)';
                     e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.2)';
                     e.currentTarget.style.transform = 'translateY(-4px)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                     e.currentTarget.style.transform = 'translateY(0)';
                   }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">Cryptocurrency Management</h3>
                    <p className="text-gray-400 text-sm">Manage allowed cryptocurrencies</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
