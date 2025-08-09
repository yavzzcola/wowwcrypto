'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ModernNotification from '@/components/ModernNotification';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number | string;
  referral_code: string;
  role: string;
}

interface WithdrawalItem {
  id: number;
  amount: number;
  address: string;
  status: string;
  date: string;
}

export default function WithdrawPage() {
  const [user, setUser] = useState<User | null>(null);
  const [coinSymbol, setCoinSymbol] = useState('ABC');
  const [coinName, setCoinName] = useState('ABC System');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('ERC20');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawalItem[]>([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });
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

      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const userData = await userResponse.json();
      
      if (!userData.success) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      setUser(userData.data || userData.user);

      try {
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setCoinName(settingsData.settings.abc_coin_symbol || 'ABC');
          setCoinSymbol(settingsData.settings.abc_coin_symbol || 'ABC');
        }
      } catch (error) {
        console.log('Settings not available, using defaults');
      }

      // Fetch withdraw history from database
      try {
        const withdrawResponse = await fetch('/api/withdrawals/request', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const withdrawData = await withdrawResponse.json();
        if (withdrawData.success) {
          setWithdrawHistory(withdrawData.data.withdrawals || []);
        }
      } catch (error) {
        console.log('Error fetching withdraw history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
      
    } catch (error) {
      localStorage.removeItem('token');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !address || parseFloat(amount) <= 0) return;
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          crypto_address: address
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAmount('');
        setAddress('');
        // Refresh withdraw history
        setIsLoadingHistory(true);
        checkAuthAndFetchData();
        setNotification({
          show: true,
          message: 'Withdrawal request submitted successfully!',
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: `Error: ${data.message}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setNotification({
        show: true,
        message: 'Error submitting withdrawal request. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.68) 50%, rgba(0,0,0,0.90) 100%), url('/bg3.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-[10] flex items-center justify-center">
          <div className="text-center">
            <div style={{
              border: '2px solid rgba(255,255,255,0.1)',
              borderTop: '2px solid #00FFFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              animation: 'spin 1s linear infinite'
            }} className="mx-auto"></div>
            <p className="mt-4 text-white/70 text-sm">Loading withdrawal data...</p>
          </div>
        </main>
      </div>
    );
  }

  const currentBalance = typeof user?.balance === 'string' ? parseFloat(user.balance) : user?.balance || 0;
  const withdrawAmount = parseFloat(amount) || 0;
  const minWithdraw = 100;
  const maxWithdraw = currentBalance;

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes moveLines {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        .stats-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stats-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04));
          border: 1px solid rgba(0,255,255,0.3);
          transform: translateY(-4px);
          box-shadow: 
            0 20px 40px rgba(0,255,255,0.1),
            0 0 30px rgba(0,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        .stats-card.purple:hover {
          border: 1px solid rgba(153,51,153,0.3);
          box-shadow: 
            0 20px 40px rgba(153,51,153,0.1),
            0 0 30px rgba(153,51,153,0.05),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        .stats-card.orange:hover {
          border: 1px solid rgba(255,193,7,0.3);
          box-shadow: 
            0 20px 40px rgba(255,193,7,0.1),
            0 0 30px rgba(255,193,7,0.05),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        .title-glow {
          background: linear-gradient(135deg, #ffffff 0%, #00FFFF 40%, #993399 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite;
        }
        
        .section-title {
          background: linear-gradient(135deg, #ffffff 0%, #00FFFF 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .floating-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        
        .floating-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,255,0.3), transparent);
          animation: moveLines 15s linear infinite;
        }
        
        .floating-line:nth-child(1) { top: 20%; width: 200px; animation-delay: 0s; }
        .floating-line:nth-child(2) { top: 60%; width: 150px; animation-delay: -5s; }
        .floating-line:nth-child(3) { top: 40%; width: 100px; animation-delay: -10s; 
          background: linear-gradient(90deg, transparent, rgba(153,51,153,0.3), transparent); }
        
        .background-blur {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(0,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(153,51,153,0.03) 0%, transparent 50%),
            radial-gradient(circle at 60% 20%, rgba(255,193,7,0.02) 0%, transparent 40%);
          filter: blur(40px);
          z-index: 0;
          pointer-events: none;
        }
        
        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }
        
        .input-field:hover {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
        }
        
        .input-field:focus {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(0,255,255,0.4);
          box-shadow: 0 0 0 3px rgba(0,255,255,0.1);
          outline: none;
        }
        
        .withdraw-btn {
          background: linear-gradient(135deg, #00FFFF 0%, #993399 100%);
          transition: all 0.3s ease;
        }
        
        .withdraw-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,255,255,0.25);
        }
        
        .withdraw-btn:disabled {
          background: rgba(255,255,255,0.1);
          transform: none;
          box-shadow: none;
          cursor: not-allowed;
        }
        
        .max-btn {
          background: linear-gradient(135deg, rgba(0,255,255,0.15), rgba(0,255,255,0.05));
          border: 1px solid rgba(0,255,255,0.3);
          transition: all 0.3s ease;
        }
        
        .max-btn:hover {
          background: linear-gradient(135deg, rgba(0,255,255,0.25), rgba(0,255,255,0.1));
          transform: scale(1.05);
        }
        
        .particle {
          position: absolute;
          background: linear-gradient(45deg, #2073a5, #0e606e);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.6;
        }
        
        .particle-1 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
          animation: float-particle 6s ease-in-out infinite;
        }
        
        .particle-2 {
          width: 6px;
          height: 6px;
          top: 60%;
          right: 15%;
          animation: float-particle 8s ease-in-out infinite reverse;
        }
        
        .particle-3 {
          width: 3px;
          height: 3px;
          top: 80%;
          left: 20%;
          animation: float-particle 5s ease-in-out infinite;
          animation-delay: -2s;
        }
        
        .particle-4 {
          width: 5px;
          height: 5px;
          top: 30%;
          right: 30%;
          animation: float-particle 7s ease-in-out infinite;
          animation-delay: -4s;
        }
        
        .particle-5 {
          width: 2px;
          height: 2px;
          top: 40%;
          left: 80%;
          animation: float-particle 9s ease-in-out infinite reverse;
          animation-delay: -1s;
        }
        
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.6;
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(0px) translateX(20px) rotate(180deg);
            opacity: 0.4;
          }
          75% {
            transform: translateY(20px) translateX(10px) rotate(270deg);
            opacity: 0.7;
          }
        }
        
        .form-glow {
          box-shadow: 
            0 0 30px rgba(32, 115, 165, 0.1),
            0 20px 40px rgba(5, 17, 28, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(32, 115, 165, 0.1);
        }
      `}</style>

      <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
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
       
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-[10]">
          {/* Header - Same style as buy page */}
          <div className="mb-8 animate-professional-fade">
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-elegant-pulse"></div>
                <div className="w-2 h-0.5 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-gentle-glow" style={{animationDelay: '1s'}}></div>
                <div className="w-1 h-1 bg-purple-400/50 rounded-full animate-elegant-pulse" style={{animationDelay: '2s'}}></div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 animate-subtle-float tracking-tight">
                WITHDRAW CRYPTOCURRENCY
              </h1>
              <p className="text-gray-300 text-base font-medium">
                Transfer digital assets securely to <span className="text-green-400 font-black">EXTERNAL WALLETS</span>
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Side by side layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Withdraw Form - Takes 3 columns (left side, wider) */}
              <div className="lg:col-span-3">
                {/* Modern Glassmorphism Form with Particles */}
                <div 
                  className="p-10 backdrop-blur-xl transition-all duration-300 h-fit form-glow relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(2, 10, 18, 0.9), rgba(5, 17, 28, 0.8))',
                    backdropFilter: 'blur(50px)',
                    border: '1px solid rgba(32, 115, 165, 0.3)',
                    borderRadius: '28px',
                  }}
                >
                  {/* Animated Particles */}
                  <div className="particle particle-1"></div>
                  <div className="particle particle-2"></div>
                  <div className="particle particle-3"></div>
                  <div className="particle particle-4"></div>
                  <div className="particle particle-5"></div>
              <div className="space-y-8">
                {/* Current Balance Display */}
                <div className="text-center mb-8">
                  <div className="text-white/70 text-base font-bold uppercase tracking-widest mb-3">AVAILABLE BALANCE</div>
                  <div 
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#2073a5' }}
                  >
                    {currentBalance.toLocaleString()}
                  </div>
                  <div className="text-white/80 text-base font-black uppercase tracking-wide">{coinSymbol} TOKENS</div>
                </div>

                {/* Wallet Address Input */}
                <div>
                  <label className="block text-white/90 text-base font-black mb-4 uppercase tracking-wide">
                    WALLET ADDRESS
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/40 font-mono text-sm transition-all duration-300 focus:outline-none input-field"
                    placeholder="Enter your wallet address"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '1px solid rgba(0,255,255,0.4)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,255,255,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-white/90 text-base font-black mb-4 uppercase tracking-wide">
                    AMOUNT TO WITHDRAW
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-6 py-4 pr-20 rounded-2xl text-white placeholder-white/40 text-lg font-medium transition-all duration-300 focus:outline-none input-field"
                      placeholder="0.00"
                      min={minWithdraw}
                      max={maxWithdraw}
                      step="0.01"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(0,255,255,0.4)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0,255,255,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255,255,255,0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(maxWithdraw.toString())}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(32, 115, 165, 0.2), rgba(14, 96, 110, 0.2))',
                        border: '1px solid rgba(32, 115, 165, 0.3)',
                        color: '#2073a5'
                      }}
                    >
                      Max
                    </button>
                  </div>
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-white/50">
                      Min: {minWithdraw.toLocaleString()} {coinSymbol}
                    </span>
                    <span style={{ color: '#0e606e' }}>
                      {coinSymbol}
                    </span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={
                    !amount || 
                    !address || 
                    parseFloat(amount) < minWithdraw || 
                    parseFloat(amount) > maxWithdraw || 
                    isProcessing
                  }
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-white flex items-center justify-center space-x-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: amount && address && parseFloat(amount) >= minWithdraw && parseFloat(amount) <= maxWithdraw && !isProcessing
                      ? 'linear-gradient(135deg, #2073a5, #0e606e)'
                      : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: amount && address && parseFloat(amount) >= minWithdraw && parseFloat(amount) <= maxWithdraw && !isProcessing
                      ? '0 8px 32px rgba(32, 115, 165, 0.3)'
                      : 'none'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Confirm Withdrawal</span>
                    </>
                  )}
                </button>
              </div>
            </div>

              </div>
              
              {/* Transaction History Sidebar - Takes 2 columns (right side) */}
              <div className="lg:col-span-2">
                <div 
                  className="p-8 backdrop-blur-xl transition-all duration-300 sticky top-8 form-glow relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(2, 10, 18, 0.95), rgba(5, 17, 28, 0.9))',
                    backdropFilter: 'blur(50px)',
                    border: '1px solid rgba(32, 115, 165, 0.3)',
                    borderRadius: '24px',
                  }}
                >
                  {/* Animated Particles for Transaction History */}
                  <div className="particle particle-1" style={{ top: '15%', left: '85%', width: '3px', height: '3px' }}></div>
                  <div className="particle particle-2" style={{ top: '40%', right: '10%', width: '4px', height: '4px' }}></div>
                  <div className="particle particle-3" style={{ top: '70%', left: '15%', width: '2px', height: '2px' }}></div>
                  <div className="particle particle-4" style={{ top: '25%', right: '40%', width: '3px', height: '3px' }}></div>
                  <h3 className="text-white/90 text-lg font-semibold mb-6 text-center">
                    Recent Transactions
                  </h3>
                  
                  <div className="space-y-3">
                    {isLoadingHistory ? (
                      // History loading state
                      Array(3).fill(0).map((_, index) => (
                        <div 
                          key={index}
                          className="p-4 backdrop-blur-xl relative overflow-hidden animate-pulse"
                          style={{
                            background: 'linear-gradient(135deg, rgba(2, 10, 18, 0.6), rgba(5, 17, 28, 0.5))',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(32, 115, 165, 0.1)',
                            borderRadius: '20px',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-10 h-10 rounded-xl bg-gray-600/30"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-600/30 rounded mb-2"></div>
                                <div className="h-3 bg-gray-600/20 rounded w-2/3"></div>
                              </div>
                            </div>
                            <div className="w-16 h-6 bg-gray-600/30 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : withdrawHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No withdrawal history yet</p>
                      </div>
                    ) : (
                      withdrawHistory.slice(0, 5).map((withdrawal) => (
                      <div 
                        key={withdrawal.id} 
                        className="p-4 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden group"
                        style={{
                          background: 'linear-gradient(135deg, rgba(2, 10, 18, 0.8), rgba(5, 17, 28, 0.7))',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(32, 115, 165, 0.2)',
                          borderRadius: '20px',
                          boxShadow: '0 8px 32px rgba(5, 17, 28, 0.4)',
                        }}
                      >
                        {/* Hover glow effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(32, 115, 165, 0.1), rgba(14, 96, 110, 0.05))',
                            borderRadius: '20px'
                          }}
                        ></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: withdrawal.status === 'completed' 
                                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.15))'
                                    : withdrawal.status === 'approved'
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.15))'
                                    : withdrawal.status === 'pending'
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.15))'
                                    : 'linear-gradient(135deg, rgba(220, 53, 69, 0.25), rgba(220, 53, 69, 0.15))',
                                  border: withdrawal.status === 'completed' 
                                    ? '1px solid rgba(34, 197, 94, 0.4)'
                                    : withdrawal.status === 'approved'
                                    ? '1px solid rgba(59, 130, 246, 0.4)'
                                    : withdrawal.status === 'pending'
                                    ? '1px solid rgba(245, 158, 11, 0.4)'
                                    : '1px solid rgba(220, 53, 69, 0.4)',
                                  boxShadow: withdrawal.status === 'completed'
                                    ? '0 0 15px rgba(34, 197, 94, 0.2)'
                                    : withdrawal.status === 'approved'
                                    ? '0 0 15px rgba(59, 130, 246, 0.2)'
                                    : withdrawal.status === 'pending'
                                    ? '0 0 15px rgba(245, 158, 11, 0.2)'
                                    : '0 0 15px rgba(220, 53, 69, 0.2)'
                                }}
                              >
                                {withdrawal.status === 'completed' ? (
                                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : withdrawal.status === 'approved' ? (
                                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : withdrawal.status === 'pending' ? (
                                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-sm truncate">
                                  {withdrawal.amount.toLocaleString()} {coinSymbol}
                                </div>
                                <div className="text-white/50 text-xs mt-0.5 truncate">
                                  {withdrawal.date}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 ml-3">
                              <div 
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                                style={{
                                  background: withdrawal.status === 'completed' 
                                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))'
                                    : withdrawal.status === 'approved'
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1))'
                                    : withdrawal.status === 'pending'
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.1))'
                                    : 'linear-gradient(135deg, rgba(220, 53, 69, 0.15), rgba(220, 53, 69, 0.1))',
                                  color: withdrawal.status === 'completed' 
                                    ? '#22C55E'
                                    : withdrawal.status === 'approved'
                                    ? '#3B82F6'
                                    : withdrawal.status === 'pending'
                                    ? '#F59E0B'
                                    : '#DC3545',
                                  border: withdrawal.status === 'completed' 
                                    ? '1px solid rgba(34, 197, 94, 0.25)'
                                    : withdrawal.status === 'approved'
                                    ? '1px solid rgba(59, 130, 246, 0.25)'
                                    : withdrawal.status === 'pending'
                                    ? '1px solid rgba(245, 158, 11, 0.25)'
                                    : '1px solid rgba(220, 53, 69, 0.25)',
                                  boxShadow: withdrawal.status === 'completed'
                                    ? '0 0 10px rgba(34, 197, 94, 0.15)'
                                    : withdrawal.status === 'approved'
                                    ? '0 0 10px rgba(59, 130, 246, 0.15)'
                                    : withdrawal.status === 'pending'
                                    ? '0 0 10px rgba(245, 158, 11, 0.15)'
                                    : '0 0 10px rgba(220, 53, 69, 0.15)'
                                }}
                              >
                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Address display (truncated) */}
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="text-white/40 text-xs font-mono">
                            {withdrawal.address}
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>
                  
                  {/* View All Link */}
                  <div className="mt-6 text-center">
                    <button 
                      className="text-sm font-medium transition-all duration-300 hover:scale-105"
                      style={{ color: '#2073a5' }}
                    >
                      View All Transactions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <div className="relative z-[10]">
          <Footer />
        </div>
        
        <ModernNotification
          show={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      </div>
    </>
  );
}