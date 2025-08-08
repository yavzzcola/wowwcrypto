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

export default function BuyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [coinSymbol, setCoinSymbol] = useState('ABC');
  const [coinName, setCoinName] = useState('ABC System');
  const [selectedCoin, setSelectedCoin] = useState({ symbol: 'ABC', name: 'ABC System' });
  const [showCoinSelect, setShowCoinSelect] = useState(false);
  const [paymentCoin, setPaymentCoin] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [availableCoins, setAvailableCoins] = useState<any[]>([]);
  const [rates, setRates] = useState<any>(null);
  const [ratesCacheTime, setRatesCacheTime] = useState<number>(0);
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

      try {
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setCoinName(settingsData.settings.platform_name || 'ABC System');
          setCoinSymbol(settingsData.settings.abc_coin_symbol || 'ABC');
          setSelectedCoin({ 
            symbol: settingsData.settings.abc_coin_symbol || 'ABC',
            name: settingsData.settings.platform_name || 'ABC System'
          });
        }
      } catch (error) {
        console.log('Settings not available, using defaults');
      }

      // Fetch allowed cryptocurrencies with cache (5 minutes)
      try {
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        if (!rates || (now - ratesCacheTime) > cacheExpiry) {
          const ratesResponse = await fetch('/api/payments/rates');
          const ratesData = await ratesResponse.json();
          
          if (ratesData) {
            setRates(ratesData);
            setRatesCacheTime(now);
            
            // Convert rates object to array for allowed coins
            const availableCoins = Object.keys(ratesData)
              .map((symbol) => ({
                symbol: symbol,
                name: getCoinName(symbol),
                logo: getCommonCoinLogo(symbol),
                usdt_price: ratesData[symbol],
                status: 'online'
              }))
              .sort((a: any, b: any) => a.symbol.localeCompare(b.symbol));
            
            setAvailableCoins(availableCoins);
            
            // Set default coin to BTC if available, otherwise first available
            if (availableCoins.length > 0 && paymentCoin === 'BTC') {
              const btcCoin = availableCoins.find(coin => coin.symbol === 'BTC');
              if (!btcCoin) {
                setPaymentCoin(availableCoins[0].symbol);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      }
      
    } catch (error) {
      console.error('Error in checkAuthAndFetchData:', error);
      // Don't redirect on error, just log it
    } finally {
      setIsLoading(false);
    }
  };

  const getCommonCoinLogo = (symbol: string) => {
    const logos: { [key: string]: string } = {
      BTC: '₿',
      ETH: 'Ξ', 
      USDT: '₮',
      LTC: 'Ł',
      BCH: '₿',
      DASH: 'Đ',
      XMR: 'ɱ',
      ZEC: 'ⓩ',
      BNB: '🟡',
      ADA: '₳',
      DOT: '●',
      DOGE: 'Ð'
    };
    return logos[symbol] || '◆';
  };

  const getCoinName = (symbol: string) => {
    const names: { [key: string]: string } = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      USDT: 'Tether USD',
      LTC: 'Litecoin',
      BCH: 'Bitcoin Cash',
      DASH: 'Dash'
    };
    return names[symbol] || symbol;
  };

  // Calculate receive amount when crypto amount changes
  useEffect(() => {
    const calculateReceiveAmount = async () => {
      if (cryptoAmount && parseFloat(cryptoAmount) > 0 && rates && rates[paymentCoin]) {
        setIsCalculating(true);
        try {
          // Convert crypto amount to USD
          const cryptoAmountFloat = parseFloat(cryptoAmount);
          const usdValue = cryptoAmountFloat * rates[paymentCoin];
          
          const response = await fetch(`/api/payments/calculate?amount=${usdValue}&currency=${paymentCoin}`);
          const data = await response.json();
          if (data.success) {
            setReceiveAmount(data.data.abc_coin.amount);
          }
        } catch (error) {
          console.error('Error calculating receive amount:', error);
          setReceiveAmount(0);
        } finally {
          setIsCalculating(false);
        }
      } else {
        setReceiveAmount(0);
        setIsCalculating(false);
      }
    };

    const debounceTimer = setTimeout(calculateReceiveAmount, 500);
    return () => clearTimeout(debounceTimer);
  }, [cryptoAmount, paymentCoin, rates]);

  const handleProceed = async () => {
    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0 || isCalculating) return;
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      // Convert crypto amount to USD for payment
      const usdValue = parseFloat(cryptoAmount) * (rates[paymentCoin] || 1);
      
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(cryptoAmount),
          currency1: paymentCoin,
          currency2: paymentCoin,
          buyerEmail: user?.email,
          buyerName: user?.username,
          itemName: `${coinSymbol} Coin Purchase`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentData(data.payment);
        setShowPaymentDetails(true);
      } else {
        setNotification({
          show: true,
          message: `Error creating payment: ${data.error}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setNotification({
        show: true,
        message: 'Error creating payment. Please try again.',
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
            backgroundImage: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.42) 50%, rgba(0,0,0,0.90) 100%), url('/bg3.jpg')",
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
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
      </div>
    );
  }

  const currentBalance = typeof user?.balance === 'string' ? parseFloat(user.balance) : user?.balance || 0;
  const selectedPaymentCoin = availableCoins.find(coin => coin.symbol === paymentCoin);

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
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
        
        .blob-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          mix-blend-mode: multiply;
          animation: blob 7s ease-in-out infinite;
        }
        
        .blob:nth-child(1) {
          top: -10%;
          left: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%);
          animation-delay: 0s;
        }
        
        .blob:nth-child(2) {
          top: -10%;
          right: -10%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(153,51,153,0.08) 0%, transparent 70%);
          animation-delay: -2s;
        }
        
        .blob:nth-child(3) {
          bottom: -10%;
          left: 10%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%);
          animation-delay: -4s;
        }
        
        .blob:nth-child(4) {
          top: 50%;
          right: 20%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%);
          animation-delay: -6s;
        }
        
        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
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
        
        .buy-btn {
          background: linear-gradient(135deg, #1d48c6 0%, #13abf9 50%, #142482 100%);
          transition: all 0.3s ease;
        }
        
        .buy-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(29, 72, 198, 0.4);
        }
        
        .buy-btn:disabled {
          background: rgba(255,255,255,0.1);
          transform: none;
          box-shadow: none;
          cursor: not-allowed;
        }
        
        .coin-selector {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        
        .coin-selector:hover {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
        }
        
        .coin-selector:focus {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(0,255,255,0.4);
          box-shadow: 0 0 0 3px rgba(0,255,255,0.1);
          outline: none;
        }
        
        .payment-method {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        
        .payment-method:hover {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
        
        .payment-method.selected {
          background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,255,255,0.05));
          border: 1px solid rgba(0,255,255,0.3);
          box-shadow: 0 0 20px rgba(0,255,255,0.1);
        }
      `}</style>

      {/* Animated Blob Background */}
      <div className="blob-background">
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
        <div className="blob"></div>
      </div>

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
          {/* Header - Same style as withdraw page */}
          <div className="mb-8 animate-professional-fade">
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-elegant-pulse"></div>
                <div className="w-2 h-0.5 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-gentle-glow" style={{animationDelay: '1s'}}></div>
                <div className="w-1 h-1 bg-purple-400/50 rounded-full animate-elegant-pulse" style={{animationDelay: '2s'}}></div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 animate-subtle-float tracking-tight">
                BUY CRYPTOCURRENCY
              </h1>
              <p className="text-gray-300 text-base font-medium">
                Purchase digital assets securely with <span className="text-blue-400 font-black">INSTANT PROCESSING</span>
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {!showPaymentDetails ? (
              /* Purchase Form */
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
                  {/* Top area - subtle blue tones */}
                  <div className="absolute top-6 right-8 w-0.5 h-0.5 bg-blue-300/40 rounded-full animate-elegant-pulse"></div>
                  <div className="absolute top-10 right-14 w-1 h-1 bg-blue-400/30 rounded-full animate-gentle-glow" style={{animationDelay: '2s'}}></div>
                  <div className="absolute top-4 right-20 w-0.5 h-0.5 bg-cyan-300/50 rounded-full animate-elegant-pulse" style={{animationDelay: '1.5s'}}></div>
                  
                  <div className="absolute top-8 left-6 w-1 h-1 bg-blue-200/35 rounded-full animate-gentle-glow" style={{animationDelay: '3s'}}></div>
                  <div className="absolute top-12 left-12 w-0.5 h-0.5 bg-indigo-300/45 rounded-full animate-elegant-pulse" style={{animationDelay: '0.8s'}}></div>
                  
                  {/* Center area - balanced distribution */}
                  <div className="absolute top-1/2 left-8 w-0.5 h-0.5 bg-purple-200/40 rounded-full animate-elegant-pulse" style={{animationDelay: '2.5s'}}></div>
                  <div className="absolute top-2/3 right-12 w-1 h-1 bg-blue-300/25 rounded-full animate-gentle-glow" style={{animationDelay: '1.2s'}}></div>
                  
                  {/* Bottom area - warmer tones */}
                  <div className="absolute bottom-8 left-10 w-1 h-1 bg-indigo-200/30 rounded-full animate-gentle-glow" style={{animationDelay: '4s'}}></div>
                  <div className="absolute bottom-12 right-8 w-0.5 h-0.5 bg-purple-300/45 rounded-full animate-elegant-pulse" style={{animationDelay: '1.8s'}}></div>
                  <div className="absolute bottom-6 right-16 w-0.5 h-0.5 bg-blue-200/40 rounded-full animate-elegant-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <div 
                  className="p-8 relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(255, 255, 255, 0.02) 100%)'
                  }}
                >
                
                <div className="space-y-6">
                  {/* Payment Coin Selection */}
                  <div>
                    <label className="block text-white/90 text-base font-black mb-4 uppercase tracking-wide">
                      PAY WITH
                    </label>
                    <button
                      onClick={() => setShowCoinSelect(!showCoinSelect)}
                      className="w-full p-5 rounded-2xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-between"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(20px)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{selectedPaymentCoin?.logo}</div>
                        <div className="text-left">
                          <div className="text-white font-medium text-sm">{selectedPaymentCoin?.symbol}</div>
                          <div className="text-gray-400 text-xs">{selectedPaymentCoin?.name}</div>
                          {selectedPaymentCoin?.usdt_price && (
                            <div className="text-blue-300 text-xs">${selectedPaymentCoin.usdt_price.toFixed(2)} USD</div>
                          )}
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${showCoinSelect ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-white/90 text-base font-black mb-4 uppercase tracking-wide">
                      AMOUNT IN {selectedPaymentCoin?.symbol || 'CRYPTO'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="w-full pl-6 pr-20 py-4 rounded-2xl text-white text-lg font-medium placeholder-gray-400 transition-all duration-300 focus:outline-none input-field"
                        placeholder="0.00"
                        step="any"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(20px)',
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
                      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-300 text-sm font-semibold">
                        {selectedPaymentCoin?.symbol || 'CRYPTO'}
                      </div>
                    </div>
                    {/* USD Value Display */}
                    {cryptoAmount && parseFloat(cryptoAmount) > 0 && rates && rates[paymentCoin] && (
                      <div className="mt-2 text-gray-400 text-sm">
                        ≈ ${(parseFloat(cryptoAmount) * rates[paymentCoin]).toFixed(2)} USD
                      </div>
                    )}
                  </div>

                  {/* Conversion Display - Compact */}
                  {(receiveAmount > 0 || isCalculating) && (
                    <div className="relative overflow-hidden rounded-lg p-3 animate-professional-fade" style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(147, 51, 234, 0.06) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.12)',
                      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.06)'
                    }}>
                      {/* Professional indicators */}
                      <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-blue-300/50 rounded-full animate-elegant-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-purple-300/40 rounded-full animate-gentle-glow" style={{animationDelay: '1.5s'}}></div>
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="text-left">
                          <div className="text-blue-300/70 text-sm font-black uppercase tracking-wide mb-1">YOU RECEIVE</div>
                          {isCalculating ? (
                            <div className="text-white text-xl font-black flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
                              <span>Calculating...</span>
                            </div>
                          ) : (
                            <div className="text-white text-xl font-black animate-subtle-float">
                              {receiveAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} {coinSymbol}
                            </div>
                          )}
                        </div>
                        {!isCalculating && (
                          <div className="text-right text-xs text-blue-300/60 font-mono">
                            Rate: 1 {paymentCoin} = {receiveAmount > 0 && cryptoAmount ? (receiveAmount / parseFloat(cryptoAmount)).toFixed(4) : '0'} {coinSymbol}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proceed Button */}
                  <button
                    onClick={handleProceed}
                    disabled={!cryptoAmount || parseFloat(cryptoAmount) <= 0 || isProcessing || isCalculating}
                    className="w-full py-4 px-6 rounded-2xl font-semibold text-white flex items-center justify-center space-x-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: cryptoAmount && parseFloat(cryptoAmount) > 0 && !isCalculating 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: cryptoAmount && parseFloat(cryptoAmount) > 0 && !isCalculating 
                        ? '1px solid rgba(59, 130, 246, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: cryptoAmount && parseFloat(cryptoAmount) > 0 && !isCalculating 
                        ? '0 8px 32px rgba(59, 130, 246, 0.15)'
                        : 'none'
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="font-black uppercase tracking-wide">PROCESSING PAYMENT...</span>
                      </>
                    ) : isCalculating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="font-black uppercase tracking-wide">CALCULATING...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="font-black uppercase tracking-wide">PROCEED TO PAYMENT</span>
                      </>
                    )}
                  </button>
                </div>
                </div>
              </div>
            ) : (
              /* Payment Details Screen - Horizontal Layout */
              <div 
                className="backdrop-blur-xl border border-white/10 overflow-hidden relative animate-smooth-scale"
                style={{
                  borderRadius: '24px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(40px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
              >
                {/* Professional Success Ambiance */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute top-6 right-10 w-0.5 h-0.5 bg-emerald-200/40 rounded-full animate-elegant-pulse"></div>
                  <div className="absolute top-12 right-6 w-1 h-1 bg-green-300/35 rounded-full animate-gentle-glow" style={{animationDelay: '2.5s'}}></div>
                  <div className="absolute top-4 right-16 w-0.5 h-0.5 bg-teal-200/50 rounded-full animate-elegant-pulse" style={{animationDelay: '1.8s'}}></div>
                  <div className="absolute top-8 left-8 w-1 h-1 bg-blue-200/30 rounded-full animate-gentle-glow" style={{animationDelay: '3.2s'}}></div>
                  <div className="absolute top-14 left-12 w-0.5 h-0.5 bg-cyan-200/40 rounded-full animate-elegant-pulse" style={{animationDelay: '1.1s'}}></div>
                  <div className="absolute bottom-8 left-12 w-1 h-1 bg-teal-300/30 rounded-full animate-gentle-glow" style={{animationDelay: '4.1s'}}></div>
                  <div className="absolute bottom-12 right-10 w-0.5 h-0.5 bg-emerald-200/45 rounded-full animate-elegant-pulse" style={{animationDelay: '0.7s'}}></div>
                </div>
                
                <div className="p-8 relative z-10">
                  {/* Header - Compact */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))',
                        border: '1px solid rgba(34, 197, 94, 0.3)'
                      }}>
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">COMPLETE PAYMENT</h2>
                        <p className="text-gray-300 text-sm font-medium">Send exact amount to address below</p>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Layout Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Payment Info */}
                    <div className="space-y-6">
                      {/* Payment Summary */}
                      <div className="rounded-2xl p-6" style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(20px)'
                      }}>
                        <h3 className="text-white font-black mb-4 uppercase tracking-wide">PAYMENT SUMMARY</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">USD Value</span>
                            <span className="text-white font-semibold">
                              ${cryptoAmount && rates && rates[paymentCoin] ? (parseFloat(cryptoAmount) * rates[paymentCoin]).toFixed(2) : '0'} USD
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">You pay</span>
                            <span className="text-white font-semibold">
                              {cryptoAmount} {selectedPaymentCoin?.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">You receive</span>
                            <span className="text-emerald-400 font-semibold">
                              {receiveAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} {coinSymbol}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Address */}
                      <div className="rounded-2xl p-6" style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <h3 className="text-white font-black mb-4 uppercase tracking-wide">{selectedPaymentCoin?.name} ADDRESS</h3>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 px-4 py-3 bg-black/30 rounded-xl border border-white/5">
                            <div className="font-mono text-white text-sm break-all">
                              {paymentData?.address || 'Address will appear here...'}
                            </div>
                          </div>
                          <button
                            onClick={() => paymentData?.address && navigator.clipboard.writeText(paymentData.address)}
                            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              color: 'rgb(52, 211, 153)'
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - QR & Instructions */}
                    <div className="space-y-6">
                      {/* QR Code */}
                      <div className="text-center rounded-2xl p-6" style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div className="w-40 h-40 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4">
                          {paymentData?.qrcode_url ? (
                            <img 
                              src={paymentData.qrcode_url} 
                              alt="Payment QR Code"
                              className="w-full h-full object-contain rounded-2xl"
                            />
                          ) : (
                            <div className="text-gray-800 text-center">
                              <div className="text-5xl mb-2">📱</div>
                              <div className="text-sm font-semibold">QR Code</div>
                              <div className="text-xs text-gray-600">{selectedPaymentCoin?.symbol}</div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">Scan with your {selectedPaymentCoin?.name} wallet</p>
                      </div>

                      {/* Instructions */}
                      <div className="rounded-2xl p-6" style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05))',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                      }}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5" style={{
                            background: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-amber-300 font-black mb-2 uppercase tracking-wide">PAYMENT INSTRUCTIONS</h4>
                            <div className="text-amber-100/80 text-sm space-y-1">
                              <div>• Send exactly {paymentData?.amount || '0'} {selectedPaymentCoin?.symbol}</div>
                              <div>• Use {selectedPaymentCoin?.name} network only</div>
                              <div>• Payment expires in {paymentData?.timeout ? Math.round(paymentData.timeout / 60) : 60} minutes</div>
                              <div>• Requires {paymentData?.confirms_needed || 1} confirmations</div>
                              <div>• Double-check address before sending</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8">
                    <button
                      onClick={() => setShowPaymentDetails(false)}
                      className="px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'rgb(209, 213, 219)'
                      }}
                    >
                      ← BACK TO PURCHASE FORM
                    </button>
                    
                    {paymentData?.checkout_url && (
                      <a
                        href={paymentData.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: 'rgb(59, 130, 246)'
                        }}
                      >
                        VIEW ON COINPAYMENTS ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Coin Selection Modal */}
            {showCoinSelect && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setShowCoinSelect(false)}
              >
                <div 
                  className="bg-black/90 border border-white/20 rounded-2xl p-6 w-80 max-w-sm mx-4"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(29, 72, 198, 0.1) 50%, rgba(0, 0, 0, 0.9) 100%)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-black uppercase tracking-wide">SELECT PAYMENT METHOD</h3>
                    <button 
                      onClick={() => setShowCoinSelect(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {availableCoins.map((coin) => (
                      <button
                        key={coin.symbol}
                        onClick={() => {
                          setPaymentCoin(coin.symbol);
                          setShowCoinSelect(false);
                        }}
                        className={`w-full p-4 rounded-lg border transition-all duration-300 flex items-center space-x-3 ${
                          paymentCoin === coin.symbol 
                            ? 'border-blue-400/30 bg-blue-400/10' 
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-3xl">{coin.logo}</div>
                        <div className="text-left flex-1">
                          <div className="text-white font-medium">{coin.symbol}</div>
                          <div className="text-gray-400 text-sm">{coin.name}</div>
                          {coin.usdt_price && (
                            <div className="text-blue-300 text-xs">${coin.usdt_price.toFixed(2)} USD</div>
                          )}
                        </div>
                        {paymentCoin === coin.symbol && (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
