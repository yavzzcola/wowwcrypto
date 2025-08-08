'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number | string;
  referral_code: string;
  role: string;
}

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'referral_commission';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  created_at: string;
  external_id?: string;
  gateway_data?: any;
}

interface Payment {
  id: number;
  txn_id: string;
  amount: number;
  currency1: string;
  currency2: string;
  status: 'pending' | 'partial' | 'completed' | 'timeout' | 'cancelled';
  received_amount: number;
  created_at: string;
  checkout_url?: string;
  item_name?: string;
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      // Try to get user profile, if fails silently continue
      try {
        const userResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const userData = await userResponse.json();
        
        if (userData.success) {
          setUser(userData.data || userData.user);
        }
      } catch (error) {
        console.log('User profile fetch failed, continuing...');
      }
      
      // Get system settings
      try {
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setSystemSettings(settingsData.settings);
        }
      } catch (error) {
        console.log('Settings not available, using defaults');
      }

      // Fetch user transactions
      try {
        const transactionsResponse = await fetch('/api/user/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsData.success) {
          setTransactions(transactionsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }

      // Fetch user payments (CoinPayments transactions)
      try {
        const paymentsResponse = await fetch('/api/payments/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const paymentsData = await paymentsResponse.json();
        if (paymentsData.success) {
          setPayments(paymentsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't redirect on error, just log it
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.42) 50%, rgba(0,0,0,0.90) 100%), url('/bg3.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        {/* Loader */}
        <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin relative z-10"></div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const coinSymbol = systemSettings?.abc_coin_symbol || 'ABC';

  // Combine transactions and payments for display
  const allItems = [
    ...(Array.isArray(transactions) ? transactions.map(tx => ({
      ...tx,
      source: 'transaction' as const,
      date: tx.created_at
    })) : []),
    ...(Array.isArray(payments) ? payments.map(payment => ({
      ...payment,
      source: 'payment' as const,
      type: 'deposit' as const,
      currency: payment.currency1,
      date: payment.created_at
    })) : [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'referral_commission':
        return (
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'withdrawal':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'completed':
        return (
          <span 
            className={`${baseClasses}`} 
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))',
              color: '#22C55E',
              border: '1px solid rgba(34, 197, 94, 0.25)'
            }}
          >
            Completed
          </span>
        );
      case 'pending':
        return (
          <span 
            className={`${baseClasses}`} 
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.1))',
              color: '#F59E0B',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            Pending
          </span>
        );
      case 'partial':
        return (
          <span 
            className={`${baseClasses}`} 
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1))',
              color: '#3B82F6',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            Partial
          </span>
        );
      case 'failed':
      case 'cancelled':
      case 'timeout':
        return (
          <span 
            className={`${baseClasses}`} 
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.1))',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}
          >
            {status === 'cancelled' ? 'Cancelled' : status === 'timeout' ? 'Timeout' : 'Failed'}
          </span>
        );
      default:
        return (
          <span 
            className={`${baseClasses}`} 
            style={{
              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.1))',
              color: '#6B7280',
              border: '1px solid rgba(107, 114, 128, 0.25)'
            }}
          >
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
        @keyframes gentle-glow {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes professional-fade {
          0% { 
            opacity: 0; 
            transform: translateY(8px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0px);
          }
        }
        
        @keyframes smooth-scale {
          0% { 
            opacity: 0;
            transform: scale(0.98);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes elegant-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.02);
          }
        }
        
        .animate-gentle-glow {
          animation: gentle-glow 3s ease-in-out infinite;
        }
        
        .animate-subtle-float {
          animation: subtle-float 4s ease-in-out infinite;
        }
        
        .animate-professional-fade {
          animation: professional-fade 0.5s ease-out;
        }
        
        .animate-smooth-scale {
          animation: smooth-scale 0.4s ease-out;
        }
        
        .animate-elegant-pulse {
          animation: elegant-pulse 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
        {/* Background Image - Fixed/Static */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.42) 50%, rgba(0,0,0,0.90) 100%), url('/bg3.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-[10]">
          {/* Header */}
          <div className="mb-8 animate-professional-fade">
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-elegant-pulse"></div>
                <div className="w-2 h-0.5 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-gentle-glow" style={{animationDelay: '1s'}}></div>
                <div className="w-1 h-1 bg-purple-400/50 rounded-full animate-elegant-pulse" style={{animationDelay: '2s'}}></div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 animate-subtle-float tracking-tight">
                TRANSACTION HISTORY
              </h1>
              <p className="text-gray-300 text-base font-medium">
                View all your <span className="text-amber-400 font-black">TRANSACTIONS</span> and their status
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto relative">


            {/* Statistics Card */}
            <div className="mb-8">
              <div 
                className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] animate-professional-fade"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Total Transactions</h3>
                  <p className="text-3xl font-bold text-blue-400 animate-subtle-float">{allItems.length}</p>
                  <p className="text-sm text-gray-400 mt-2">All your transaction history</p>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div 
              className="backdrop-blur-xl border border-white/10 overflow-hidden relative animate-smooth-scale"
              style={{
                borderRadius: '24px',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(40px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Professional Ambient Particles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-6 right-10 w-0.5 h-0.5 bg-blue-200/40 rounded-full animate-elegant-pulse"></div>
                <div className="absolute top-12 right-6 w-1 h-1 bg-purple-300/35 rounded-full animate-gentle-glow" style={{animationDelay: '2.5s'}}></div>
                <div className="absolute top-4 right-16 w-0.5 h-0.5 bg-cyan-200/50 rounded-full animate-elegant-pulse" style={{animationDelay: '1.8s'}}></div>
                <div className="absolute top-8 left-8 w-1 h-1 bg-blue-200/30 rounded-full animate-gentle-glow" style={{animationDelay: '3.2s'}}></div>
                <div className="absolute top-14 left-12 w-0.5 h-0.5 bg-cyan-200/40 rounded-full animate-elegant-pulse" style={{animationDelay: '1.1s'}}></div>
                <div className="absolute bottom-8 left-12 w-1 h-1 bg-purple-300/30 rounded-full animate-gentle-glow" style={{animationDelay: '4.1s'}}></div>
                <div className="absolute bottom-12 right-10 w-0.5 h-0.5 bg-blue-200/45 rounded-full animate-elegant-pulse" style={{animationDelay: '0.7s'}}></div>
              </div>
              
              <div className="overflow-x-auto relative z-10">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {allItems.map((item, index) => (
                      <tr key={`${item.source}-${item.id}`} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                              }}
                            >
                              {getTypeIcon(item.type)}
                            </div>
                            <span className="text-sm font-medium capitalize text-blue-300">
                              {item.type === 'referral_commission' ? 'Referral' : item.type === 'deposit' ? 'Deposit' : item.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {item.source === 'payment' && 'received_amount' in item && item.received_amount > 0 
                              ? `${parseFloat(item.received_amount.toString()).toFixed(8)} ${item.currency2 || 'BTC'}`
                              : `${parseFloat(item.amount.toString()).toFixed(8)} ${item.currency2 || item.currency || coinSymbol}`
                            }
                          </div>
                          {item.source === 'payment' && 'tx_fee' in item && item.tx_fee && parseFloat(item.tx_fee) > 0 && (
                            <div className="text-xs text-gray-400">
                              Fee: {parseFloat(item.tx_fee.toString()).toFixed(8)} {item.currency2 || 'BTC'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatDate(item.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {item.source === 'payment' 
                              ? ('item_name' in item ? item.item_name : 'Deposit Transaction')
                              : item.type === 'referral_commission' 
                                ? 'Referral Commission'
                                : item.type === 'deposit'
                                  ? 'Deposit Transaction'
                                  : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Transaction`
                            }
                          </div>
                          {item.source === 'payment' && 'address' in item && item.address && (
                            <div className="text-xs font-mono mt-1 text-blue-400">
                              Wallet: {item.address}
                            </div>
                          )}
                          {item.source === 'transaction' && item.external_id && (
                            <div className="text-xs font-mono mt-1 text-blue-400">
                              ID: {item.external_id}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* No Transactions State - Same width as table */}
            {allItems.length === 0 && (
              <div 
                className="backdrop-blur-xl border border-white/10 overflow-hidden relative animate-smooth-scale mt-8"
                style={{
                  borderRadius: '24px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(40px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* Professional Ambient Particles */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute top-6 right-10 w-0.5 h-0.5 bg-blue-200/40 rounded-full animate-elegant-pulse"></div>
                  <div className="absolute top-12 right-6 w-1 h-1 bg-purple-300/35 rounded-full animate-gentle-glow" style={{animationDelay: '2.5s'}}></div>
                  <div className="absolute top-4 right-16 w-0.5 h-0.5 bg-cyan-200/50 rounded-full animate-elegant-pulse" style={{animationDelay: '1.8s'}}></div>
                  <div className="absolute top-8 left-8 w-1 h-1 bg-blue-200/30 rounded-full animate-gentle-glow" style={{animationDelay: '3.2s'}}></div>
                  <div className="absolute top-14 left-12 w-0.5 h-0.5 bg-cyan-200/40 rounded-full animate-elegant-pulse" style={{animationDelay: '1.1s'}}></div>
                  <div className="absolute bottom-8 left-12 w-1 h-1 bg-purple-300/30 rounded-full animate-gentle-glow" style={{animationDelay: '4.1s'}}></div>
                  <div className="absolute bottom-12 right-10 w-0.5 h-0.5 bg-blue-200/45 rounded-full animate-elegant-pulse" style={{animationDelay: '0.7s'}}></div>
                </div>
                
                <div className="px-8 py-16 text-center relative z-10">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-2" style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}>
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 animate-subtle-float">
                      No purchases found
                    </h3>
                    <p className="text-sm text-gray-400 max-w-md">
                      Start buying tokens to see your purchase history here. All your token purchases will appear in this table.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <div className="relative z-[10]">
          <Footer />
        </div>
      </div>
    </>
  );
}
