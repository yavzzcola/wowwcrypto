'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import StatsCards from '@/components/StatsCards';
import AnimatedBackground from '@/components/AnimatedBackground';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number | string;
  referral_code: string;
  role: string;
}

interface ReferralData {
  count: number;
  earnings: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [referralUrl, setReferralUrl] = useState('');
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [counterData, setCounterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
    
    // User interaction listener for autoplay policy
    const handleUserInteraction = () => {
      setUserInteracted(true);
      if (videoRef.current) {
        videoRef.current.play().catch(console.warn);
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Counter update effect
  useEffect(() => {
    if (!counterData) return;

    const timer = setInterval(() => {
      if (counterData && counterData.targetDate) {
        const now = new Date().getTime();
        const distance = new Date(counterData.targetDate).getTime() - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            isExpired: false
          });
        } else {
          setTimeLeft(prev => ({ ...prev, isExpired: true }));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [counterData]);

  // Video kaynaklarını tanımla - bgvideo ve bgvideo-reverse arası loop
  const videoSources = ['/bgvideo.mp4', '/bgvideo-reverse.mp4'];

  // Video değiştirme: 3. saniyede transition başlat, 3 saniye sürsün
  useEffect(() => {
    // 3. saniyede transition başlat
    const transitionTimer = setTimeout(() => {
      console.log(`🔄 Starting transition at 3rd second for video ${currentVideoIndex}`);
      setIsTransitioning(true);
    }, 3000); // 3. saniye

    // 4.5. saniyede video değiştir (transition ortasında)
    const videoChangeTimer = setTimeout(() => {
      setCurrentVideoIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % videoSources.length;
        console.log(`➡️ Switching to video ${nextIndex} (${videoSources[nextIndex]})`);
        return nextIndex;
      });
    }, 4500); // 4.5. saniye

    // 6. saniyede transition bitir
    const transitionEndTimer = setTimeout(() => {
      console.log(`✅ Transition completed`);
      setIsTransitioning(false);
    }, 6000); // 6. saniye

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(videoChangeTimer);
      clearTimeout(transitionEndTimer);
    };
  }, [currentVideoIndex, videoSources]);

  // Video kaynak değişikliği ve event listener'ları
  useEffect(() => {
    const video = videoRef.current;
    const nextVideo = nextVideoRef.current;
    if (!video) {
      console.log('❌ Video ref not found');
      return;
    }

    // Mevcut video'yu ayarla
    video.src = videoSources[currentVideoIndex];
    console.log(`🔄 Loading video: ${videoSources[currentVideoIndex]}`);
    
    // Bir sonraki video'yu preload et
    if (nextVideo) {
      const nextIndex = (currentVideoIndex + 1) % videoSources.length;
      nextVideo.src = videoSources[nextIndex];
      nextVideo.load();
      console.log(`⏳ Preloading next video: ${videoSources[nextIndex]}`);
    }
    
    // Video'yu yükle ve oynat
    const playVideo = async () => {
      try {
        video.load();
        
        // Video ready olmasını bekle
        await new Promise((resolve) => {
          if (video.readyState >= 3) {
            resolve(true);
          } else {
            video.addEventListener('canplaythrough', resolve, { once: true });
          }
        });
        
        // Autoplay policy için gerekli ayarlar
        video.muted = true;
        video.playsInline = true;
        
        // Play attempt with error handling
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`✅ Video ${currentVideoIndex} started successfully`);
            })
            .catch(error => {
              console.warn(`⚠️ Video ${currentVideoIndex} autoplay blocked:`, error.message);
              // Fallback: Show a static background or image
              video.style.display = 'none';
            });
        }
      } catch (error) {
        console.error(`❌ Video ${currentVideoIndex} play failed:`, error);
        video.style.display = 'none';
      }
    };

    // Event listener'ları ekle
    const handleVideoPlay = () => {
      console.log(`▶️ Video ${currentVideoIndex} started playing`);
    };

    const handleVideoError = (e: Event) => {
      console.error(`❌ Video ${currentVideoIndex} error:`, e);
    };

    video.addEventListener('play', handleVideoPlay);
    video.addEventListener('error', handleVideoError);

    // Video'yu oynat
    playVideo();
    
    // Cleanup function
    return () => {
      console.log(`🧹 Cleaning up event listeners for video ${currentVideoIndex}`);
      video.removeEventListener('play', handleVideoPlay);
      video.removeEventListener('error', handleVideoError);
    };
  }, [currentVideoIndex, isTransitioning]);

  const checkAuthAndFetchData = async () => {
    try {
      // Check authentication
      const userResponse = await fetch('/api/user/profile');
      const userData = await userResponse.json();
      
      if (!userData.success) {
        router.push('/login');
        return;
      }

      setUser(userData.data || userData.user);
      
      // Get system settings
      try {
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setSystemSettings(settingsData.settings);
        }
      } catch (error) {
        console.log('Settings not available, using defaults');
        setSystemSettings({
          coin_name: 'AI GameEngine',
          coin_symbol: 'AGE'
        });
      }

      // Set coin balance from user data
      const balance = userData.data?.balance || userData.user?.balance || 0;
      setCoinBalance(typeof balance === 'string' ? parseFloat(balance) : balance);

      // Fetch referral data
      try {
        const referralResponse = await fetch('/api/referrals');
        const referralData = await referralResponse.json();
        
        if (referralData.success) {
          setReferralCount(referralData.count || 0);
          setReferralEarnings(referralData.earnings || 0);
        } else {
          // Fallback to mock calculation
          setReferralCount(0);
          setReferralEarnings(0);
        }
      } catch (error) {
        console.log('Referral data not available, using defaults');
        setReferralCount(0);
        setReferralEarnings(0);
      }

      // Generate referral URL
      const baseUrl = window.location.origin;
      const refCode = userData.data?.referral_code || userData.user?.referral_code;
      setReferralUrl(`${baseUrl}/register?ref=${refCode}`);

      // Fetch counter data
      try {
        const counterResponse = await fetch('/api/counter');
        const counterDataResponse = await counterResponse.json();
        
        if (counterDataResponse.success) {
          setCounterData(counterDataResponse.data);
          setTimeLeft(counterDataResponse.data.timeLeft);
        }
      } catch (error) {
        console.log('Counter data not available');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralUrl = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const coinName = systemSettings?.coin_name || 'AI GameEngine';
  const coinSymbol = systemSettings?.coin_symbol || 'AGE';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0, 0, 0, 0.68) 50%, rgba(0,0,0,0.95) 100%), url("/bg3.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Subtle Background Effects */}
      <div className="fixed inset-0 z-[2]">
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0,255,255,0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(153,51,153,0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
      </div>
      
      <div className="relative z-[2]">
        <AnimatedBackground />
      </div>
      
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-[10]">
        {/* Welcome Section */}
        <div className="mb-12 animate-professional-fade">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-1 h-1 bg-blue-400/50 rounded-full animate-elegant-pulse"></div>
              <div className="w-2 h-0.5 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full animate-gentle-glow" style={{animationDelay: '1s'}}></div>
              <div className="w-1 h-1 bg-purple-400/50 rounded-full animate-elegant-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                WELCOME BACK,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {user?.username?.toUpperCase()}
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Manage your <span className="text-cyan-400 font-black">AI GAMEENGINE</span> tokens and build the future of gaming
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl mt-4" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)'
            }}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-gray-200 text-sm font-black tracking-wider uppercase">AI ENGINE ONLINE</span>
            </div>
          </div>
        </div>

        <StatsCards 
          coinBalance={coinBalance}
          referralEarnings={referralEarnings}
          referralCount={referralCount}
          coinSymbol={coinSymbol}
        />

        {/* AI Gaming Actions */}
        <div className="mb-12 animate-professional-fade" style={{animationDelay: '0.2s'}}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
              }}>
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                AI GAMING PLATFORM
              </h2>
            </div>
            <p className="text-gray-300 text-lg max-w-lg mx-auto font-medium leading-relaxed">
              Access powerful tools to manage your tokens and explore the <span className="text-purple-400 font-black">GAMING ECOSYSTEM</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Purchase Tokens */}
            <Link href="/dashboard/buy" className="block group animate-smooth-scale" style={{animationDelay: '0.1s'}}>
              <div className="relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
                  borderRadius: '1.5rem'
                }}></div>
                
                {/* Animated particles */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
                    }}>
                      <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-wide">PURCHASE {coinSymbol}</h3>
                  </div>
                  <p className="text-gray-300 text-base mb-6 font-medium leading-relaxed">
                    Acquire tokens to participate in <span className="text-blue-400 font-black">AI GAME DEVELOPMENT</span> and earn rewards
                  </p>
                  <div className="flex items-center text-gray-200 text-sm font-black group-hover:text-blue-300 transition-colors tracking-wide">
                    <span>START BUILDING</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Withdraw Tokens */}
            <Link href="/dashboard/withdraw" className="block group animate-smooth-scale" style={{animationDelay: '0.2s'}}>
              <div className="relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(16, 185, 129, 0.05))',
                  borderRadius: '1.5rem'
                }}></div>
                
                {/* Animated particles */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-green-400/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-emerald-400/40 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                    }}>
                      <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-wide">WITHDRAW</h3>
                  </div>
                  <p className="text-gray-300 text-base mb-6 font-medium leading-relaxed">
                    Transfer your earned tokens to <span className="text-green-400 font-black">EXTERNAL WALLETS</span> securely
                  </p>
                  <div className="flex items-center text-gray-200 text-sm font-black group-hover:text-green-300 transition-colors tracking-wide">
                    <span>SECURE TRANSFER</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Transaction History */}
            <Link href="/dashboard/history" className="block group animate-smooth-scale" style={{animationDelay: '0.3s'}}>
              <div className="relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05))',
                  borderRadius: '1.5rem'
                }}></div>
                
                {/* Animated particles */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-amber-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-orange-400/40 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15))',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)'
                    }}>
                      <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-wide">ACTIVITY</h3>
                  </div>
                  <p className="text-gray-300 text-base mb-6 font-medium leading-relaxed">
                    Track your <span className="text-amber-400 font-black">GAMING REWARDS</span> and platform interactions
                  </p>
                  <div className="flex items-center text-gray-200 text-sm font-black group-hover:text-amber-300 transition-colors tracking-wide">
                    <span>VIEW HISTORY</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Token Sale Info Section */}
        {counterData && (
          <div className="mb-12 animate-professional-fade" style={{animationDelay: '0.4s'}}>
            <div className="rounded-2xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5)'
            }}>
              {/* Header */}
              <div className="p-6 border-b border-white/10" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse" style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(139, 92, 246, 0.15))',
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                  }}>
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-wide">TOKEN SALE INFO</h3>
                    <p className="text-gray-400 text-sm font-medium">Live presale statistics and progress</p>
                  </div>
                </div>
              </div>

              {/* Token Info Cards */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="group relative p-6 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1" style={{
                    background: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.05) 100%)',
                    border: '1px solid rgba(0,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,255,255,0.05)'
                  }}>
                    {/* Animated background glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                      background: 'linear-gradient(135deg, rgba(0,255,255,0.15) 0%, rgba(0,255,255,0.08) 100%)',
                      borderRadius: '1rem'
                    }}></div>
                    
                    {/* Floating particles */}
                    <div className="absolute top-3 right-3 w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="relative z-10">
                      <div className="text-3xl font-black text-cyan-400 mb-2 font-mono group-hover:text-cyan-300 transition-colors">
                        ${counterData.token ? counterData.token.price.toFixed(3) : '0.025'}
                      </div>
                      <div className="text-gray-300 text-sm font-bold uppercase tracking-wider">Current Price</div>
                      <div className="w-full h-1 bg-gradient-to-r from-cyan-400/20 to-cyan-400 rounded-full mt-3 group-hover:from-cyan-300/40 group-hover:to-cyan-300 transition-colors" />
                    </div>
                  </div>

                  <div className="group relative p-6 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1" style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.05)'
                  }}>
                    {/* Animated background glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                      borderRadius: '1rem'
                    }}></div>
                    
                    {/* Floating particles */}
                    <div className="absolute top-3 right-3 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-purple-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    
                    <div className="relative z-10">
                      <div className="text-3xl font-black text-purple-400 mb-2 font-mono group-hover:text-purple-300 transition-colors">
                        {counterData.progress ? (counterData.progress.currentSupply / 1000000).toFixed(2) + 'M' : '0.00M'}
                      </div>
                      <div className="text-gray-300 text-sm font-bold uppercase tracking-wider">Tokens Sold</div>
                      <div className="w-full h-1 bg-gradient-to-r from-purple-400/20 to-purple-400 rounded-full mt-3 group-hover:from-purple-300/40 group-hover:to-purple-300 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Mini Progress Indicator */}
                {counterData.progress && (
                  <div className="relative mb-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span className="font-medium">Sale Progress</span>
                      <span className="font-bold">{counterData.progress.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{
                      background: 'rgba(100, 116, 139, 0.2)'
                    }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ 
                          width: `${counterData.progress.percentage}%`,
                          background: 'linear-gradient(90deg, #00FFFF, #8B5CF6)'
                        }}
                      >
                        {/* Animated glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{counterData.progress.currentSupply.toLocaleString()} sold</span>
                      <span>{counterData.progress.maxSupply.toLocaleString()} total</span>
                    </div>
                  </div>
                )}

                {/* Countdown Timer - Embedded in Token Sale Info */}
                {!timeLeft.isExpired && (
                  <div className="border-t border-white/10 pt-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl mb-4" style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backdropFilter: 'blur(20px)'
                      }}>
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                        <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Sale Ends In</span>
                      </div>
                    </div>
                    
                    {/* Countdown Display - Compact version */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="group text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105" style={{
                        background: 'linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,255,255,0.05))',
                        border: '1px solid rgba(0,255,255,0.2)',
                        boxShadow: '0 4px 16px rgba(0,255,255,0.05)'
                      }}>
                        <div className="text-3xl font-black text-cyan-400 mb-1 font-mono group-hover:text-cyan-300 transition-colors">
                          {timeLeft.days.toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">DAYS</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400/20 to-cyan-400 rounded-full mt-2" />
                      </div>
                      <div className="group text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105" style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))',
                        border: '1px solid rgba(59,130,246,0.2)',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.05)'
                      }}>
                        <div className="text-3xl font-black text-blue-400 mb-1 font-mono group-hover:text-blue-300 transition-colors">
                          {timeLeft.hours.toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">HOURS</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-blue-400/20 to-blue-400 rounded-full mt-2" />
                      </div>
                      <div className="group text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105" style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))',
                        border: '1px solid rgba(139,92,246,0.2)',
                        boxShadow: '0 4px 16px rgba(139,92,246,0.05)'
                      }}>
                        <div className="text-3xl font-black text-purple-400 mb-1 font-mono group-hover:text-purple-300 transition-colors">
                          {timeLeft.minutes.toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">MINUTES</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-purple-400/20 to-purple-400 rounded-full mt-2" />
                      </div>
                      <div className="group text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105" style={{
                        background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(236,72,153,0.05))',
                        border: '1px solid rgba(236,72,153,0.2)',
                        boxShadow: '0 4px 16px rgba(236,72,153,0.05)'
                      }}>
                        <div className="text-3xl font-black text-pink-400 mb-1 font-mono group-hover:text-pink-300 transition-colors">
                          {timeLeft.seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">SECONDS</div>
                        <div className="w-full h-0.5 bg-gradient-to-r from-pink-400/20 to-pink-400 rounded-full mt-2" />
                      </div>
                    </div>

                    {/* Call to Action Button - Embedded */}
                    <div className="text-center mt-6">
                      <Link href="/dashboard/buy" className="group relative inline-flex items-center px-8 py-4 text-lg font-black rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                        color: '#000',
                        boxShadow: '0 12px 32px rgba(0,255,255,0.3)'
                      }}>
                        <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="relative z-10 tracking-wide uppercase">BUY TOKENS</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Network Expansion Program */}
        <div className="rounded-2xl p-6 animate-smooth-scale" style={{
          animationDelay: '0.5s',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(15,23,42,0.8) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(59, 130, 246, 0.15))',
              border: '1px solid rgba(147, 51, 234, 0.3)'
            }}>
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-black text-xl tracking-wide">NETWORK EXPANSION</h3>
              <p className="text-gray-300 text-sm font-medium tracking-wide">Invite others & <span className="text-purple-400 font-black">EARN REWARDS</span></p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 p-3 rounded-xl" style={{
              background: 'rgba(100, 116, 139, 0.1)',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}>
              <p className="text-gray-200 font-mono text-sm break-all select-all font-medium">
                {referralUrl}
              </p>
            </div>
            <button
              onClick={copyReferralUrl}
              className="px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 text-white text-sm"
              style={{
                background: copied 
                  ? 'linear-gradient(135deg, #059669, #10b981)' 
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {referralCount}
              </div>
              <p className="text-gray-300 text-xs uppercase tracking-widest font-black">REFERRALS</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {referralEarnings.toLocaleString()}
              </div>
              <p className="text-gray-300 text-xs uppercase tracking-widest font-black">{coinSymbol} EARNED</p>
            </div>
          </div>
        </div>
      </main>
      
      <div className="relative z-[10]">
        <Footer />
      </div>
    </div>
  );
}