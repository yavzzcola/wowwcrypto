'use client';

import { useState, useEffect } from 'react';

interface ICOPresaleInfoProps {
  coinSymbol?: string;
}

interface SystemStats {
  supply: {
    current: number;
    max: number;
    percentage: number;
    remaining: number;
  };
  token: {
    price: number;
    symbol: string;
  };
  platform: {
    total_users: number;
    total_transactions: number;
    total_volume: number;
    recent_activity: number;
    active_referrals: number;
  };
}

export default function ICOPresaleInfo({ coinSymbol = 'ABC' }: ICOPresaleInfoProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real system statistics
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const response = await fetch('/api/system/stats');
        const data = await response.json();
        if (data.success) {
          setSystemStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const presaleData = systemStats ? {
    totalRaised: systemStats.supply.current * systemStats.token.price,
    targetAmount: systemStats.supply.max * systemStats.token.price,
    tokenPrice: systemStats.token.price,
    currentSupply: systemStats.supply.current,
    maxSupply: systemStats.supply.max,
    progress: systemStats.supply.percentage,
    totalUsers: systemStats.platform.total_users,
    totalVolume: systemStats.platform.total_volume,
    phase: 'Phase 1',
    bonus: '10%'
  } : {
    totalRaised: 0,
    targetAmount: 1000000,
    tokenPrice: 1.0,
    currentSupply: 0,
    maxSupply: 1000000,
    progress: 0,
    totalUsers: 0,
    totalVolume: 0,
    phase: 'Phase 1',
    bonus: '10%'
  };

  useEffect(() => {
    // Set presale end date (30 days from now)
    const presaleEnd = new Date();
    presaleEnd.setDate(presaleEnd.getDate() + 30);
    presaleEnd.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = presaleEnd.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progress = presaleData.progress;

  return (
    <div className="mb-8 p-6 rounded-2xl" style={{
      background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(15,23,42,0.8) 100%)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">ICO Presale - {presaleData.phase}</h3>
            <p className="text-gray-400 text-sm">{presaleData.bonus} Early Bird Bonus</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {progress.toFixed(1)}%
          </div>
          <p className="text-gray-400 text-xs">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 rounded-full mb-2" style={{
          background: 'rgba(100, 116, 139, 0.2)'
        }}>
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">
            {presaleData.currentSupply.toLocaleString()} {systemStats?.token.symbol || coinSymbol}
          </span>
          <span className="text-gray-500">
            {presaleData.maxSupply.toLocaleString()} {systemStats?.token.symbol || coinSymbol} Total
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">${presaleData.tokenPrice}</div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Price</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{timeLeft.days}d</div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Left</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{presaleData.totalUsers}</div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Users</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">${presaleData.totalVolume.toLocaleString()}</div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Volume</p>
        </div>
      </div>
    </div>
  );
}