'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [counterData, setCounterData] = useState<any>(null);

  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch counter data once and start local countdown
  useEffect(() => {
    const fetchCounterData = async () => {
      try {
        const response = await fetch('/api/counter');
        const data = await response.json();
        
        if (data.success) {
          setCounterData(data.data);
          setTimeLeft(data.data.timeLeft);
        }
      } catch (error) {
        console.error('Failed to fetch counter data:', error);
      }
    };

    fetchCounterData(); // Only fetch once
  }, []); // Empty dependency array - only run once

  // Separate effect for countdown timer
  useEffect(() => {
    if (!counterData || !counterData.targetDate) return;

    const timer = setInterval(() => {
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
    }, 1000);

    return () => clearInterval(timer);
  }, [counterData]); // Only depend on counterData

  // Video control functions
  const playVideo = () => {
    if (videoRef.current && isHeroVisible) {
      videoRef.current.play().catch(console.warn);
      setIsVideoPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  // Auto-play/pause video every 10 seconds when hero is visible
  useEffect(() => {
    if (isHeroVisible) {
      intervalRef.current = setInterval(() => {
        if (isVideoPlaying) {
          pauseVideo();
          setTimeout(playVideo, 2000); // Resume after 2 seconds
        } else {
          playVideo();
        }
      }, 10000); // Every 10 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      pauseVideo();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHeroVisible, isVideoPlaying]);

  // Intersection Observer for hero visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHeroVisible(entry.isIntersecting);
          if (entry.isIntersecting) {
            playVideo();
          } else {
            pauseVideo();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  // Mouse enter/leave handlers for video control
  const handleMouseEnter = () => {
    if (isHeroVisible) {
      playVideo();
    }
  };

  const handleMouseLeave = () => {
    // Don't pause immediately on mouse leave, let the interval handle it
  };

  const faqData = [
    {
      question: "What is AI GameEngine (AGE)?",
      answer: "AI GameEngine is a revolutionary platform that combines artificial intelligence with blockchain technology to create next-generation gaming experiences. Our token AGE powers the entire ecosystem."
    },
    {
      question: "How does the ICO presale work?",
      answer: "Our ICO presale offers early investors the opportunity to purchase AGE tokens at discounted rates. There are multiple phases with increasing prices, and early participants receive bonus tokens."
    },
    {
      question: "What are the benefits of holding AGE tokens?",
      answer: "AGE token holders can participate in governance, earn staking rewards, access exclusive features, and benefit from the platform's growth through token appreciation."
    },
    {
      question: "How can I participate in the presale?",
      answer: "Simply register an account, complete KYC verification, and you can start purchasing AGE tokens during the presale period using various cryptocurrencies or fiat payments."
    },
    {
      question: "Is the platform secure?",
      answer: "Yes, we implement bank-level security measures including multi-factor authentication, cold storage for funds, smart contract audits, and comprehensive security protocols."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Video Background */}
      <section 
        ref={heroRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-20"
      >
        {/* Video Background */}
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/Abgvideo.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 z-[1]" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(26,26,46,0.75) 50%, rgba(0,0,0,0.85) 100%)'
        }}></div>
        
        {/* Smooth Edge Overlays for seamless section transition */}
        <div className="absolute inset-0 z-[2]">
          {/* Top edge darkening */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
          {/* Bottom edge darkening */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          {/* Left edge darkening */}
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          {/* Right edge darkening */}
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-black/60 via-black/20 to-transparent pointer-events-none" />
          
          {/* Subtle Background Effects */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(0,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(153,51,153,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
        </div>
        

        {/* Hero Content */}
        <div className="relative z-[10] text-center px-4 max-w-6xl mx-auto">
          <div className="mb-8 mt-16">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.85] tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent font-black">
              AI GameChain
            </span>
            <br />
            <span className="text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-wider uppercase">
              Next-Gen Gaming Platform
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Experience the future of gaming with our revolutionary AI-powered blockchain platform.
            <br className="hidden md:block" />
            <span className="text-cyan-300 font-bold tracking-wide">CREATE • PLAY • EARN</span> in the decentralized gaming ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/register" className="group relative px-10 py-5 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden" style={{
              background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
              color: '#000',
              boxShadow: '0 15px 40px rgba(0,255,255,0.4)'
            }}>
              <span className="relative z-10 tracking-wide">JOIN PRESALE NOW</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <Link href="#tokenomics" className="px-10 py-5 text-lg font-bold rounded-2xl border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 backdrop-blur-sm bg-white/5 tracking-wide">
              LEARN MORE
            </Link>
          </div>
          
          {/* Token Info Cards */}
          {counterData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(15,23,42,0.8) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(0,255,255,0.2)'
            }}>
              <div className="text-4xl font-black text-cyan-400 mb-3 font-mono">
                ${counterData.token ? counterData.token.price.toFixed(3) : '0.025'}
              </div>
              <div className="text-gray-200 text-sm font-medium uppercase tracking-wider">Current Price</div>
              <div className="w-full h-1 bg-gradient-to-r from-cyan-400/30 to-cyan-400 rounded-full mt-4" />
            </div>
            <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(15,23,42,0.8) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(139,92,246,0.2)'
            }}>
              <div className="text-4xl font-black text-purple-400 mb-3 font-mono">
                {counterData.progress ? (counterData.progress.currentSupply / 1000000).toFixed(2) + 'M' : '0.00M'}
              </div>
              <div className="text-gray-200 text-sm font-medium uppercase tracking-wider">Tokens Sold</div>
              <div className="w-full h-1 bg-gradient-to-r from-purple-400/30 to-purple-400 rounded-full mt-4" />
            </div>
          </div>
          )}
        </div>
        </div>
      </section>

      {/* All Other Sections with bg3.jpg Background */}
      <div style={{
        backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0, 0, 0, 0.68) 50%, rgba(0,0,0,0.95) 100%), url("/bg3.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Countdown Timer Section */}
        {counterData && !timeLeft.isExpired && (
        <section className="relative py-20">
          {/* Smooth dark overlay at the top of Presale section */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none z-10"></div>
          
          {/* Edge darkening overlays - only left and right */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            {/* Left edge darkening */}
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            {/* Right edge darkening */}
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-20 container mx-auto px-4 lg:px-8 text-center">
            <div className="mb-16">
              <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl mb-8" style={{
                background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(139,92,246,0.15))',
                border: '2px solid rgba(0,255,255,0.3)',
                backdropFilter: 'blur(30px)'
              }}>
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                <span className="text-red-400 text-lg font-black uppercase tracking-wider">Limited Time Only</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                  PRESALE ENDS IN
                </span>
              </h2>
              <p className="text-xl text-gray-200 mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
                Don&apos;t miss your chance to join the revolution at <span className="text-cyan-300 font-black">EXCLUSIVE EARLY-BIRD PRICES</span>
              </p>
            </div>
          
          {/* Countdown Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
            <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(40px)',
              border: '2px solid rgba(0,255,255,0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,255,255,0.1)'
            }}>
              <div className="text-5xl md:text-6xl font-black text-cyan-400 mb-3 font-mono group-hover:text-cyan-300 transition-colors">
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-300 text-sm font-bold uppercase tracking-widest">DAYS</div>
              <div className="w-full h-1 bg-gradient-to-r from-cyan-400/20 to-cyan-400 rounded-full mt-4 group-hover:from-cyan-300/40 group-hover:to-cyan-300 transition-colors" />
            </div>
            <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(40px)',
              border: '2px solid rgba(59,130,246,0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.1)'
            }}>
              <div className="text-5xl md:text-6xl font-black text-blue-400 mb-3 font-mono group-hover:text-blue-300 transition-colors">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-300 text-sm font-bold uppercase tracking-widest">HOURS</div>
              <div className="w-full h-1 bg-gradient-to-r from-blue-400/20 to-blue-400 rounded-full mt-4 group-hover:from-blue-300/40 group-hover:to-blue-300 transition-colors" />
            </div>
            <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(40px)',
              border: '2px solid rgba(139,92,246,0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(139,92,246,0.1)'
            }}>
              <div className="text-5xl md:text-6xl font-black text-purple-400 mb-3 font-mono group-hover:text-purple-300 transition-colors">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-300 text-sm font-bold uppercase tracking-widest">MINUTES</div>
              <div className="w-full h-1 bg-gradient-to-r from-purple-400/20 to-purple-400 rounded-full mt-4 group-hover:from-purple-300/40 group-hover:to-purple-300 transition-colors" />
            </div>
            <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(40px)',
              border: '2px solid rgba(236,72,153,0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(236,72,153,0.1)'
            }}>
              <div className="text-5xl md:text-6xl font-black text-pink-400 mb-3 font-mono group-hover:text-pink-300 transition-colors">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-300 text-sm font-bold uppercase tracking-widest">SECONDS</div>
              <div className="w-full h-1 bg-gradient-to-r from-pink-400/20 to-pink-400 rounded-full mt-4 group-hover:from-pink-300/40 group-hover:to-pink-300 transition-colors" />
            </div>
          </div>
          
          {/* Progress Bar */}
          {counterData && counterData.progress && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{counterData.progress.currentSupply.toLocaleString()} tokens sold</span>
              <span>{counterData.progress.maxSupply.toLocaleString()} total supply</span>
            </div>
            <div className="h-4 rounded-full" style={{
              background: 'rgba(100, 116, 139, 0.2)'
            }}>
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${counterData.progress.percentage}%`,
                  background: 'linear-gradient(90deg, #00FFFF, #8B5CF6)'
                }}
              ></div>
            </div>
            <div className="text-center mt-4">
              <span className="text-2xl font-bold text-white">{counterData.progress.percentage}% Sold</span>
            </div>
          </div>
          )}
          
          <Link href="/register" className="group relative inline-flex items-center px-12 py-6 text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden" style={{
            background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
            color: '#000',
            boxShadow: '0 20px 50px rgba(0,255,255,0.4)'
          }}>
            <svg className="w-7 h-7 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="relative z-10 tracking-wide uppercase">BUY AGE TOKENS NOW</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
          </div>
        </section>
        )}

        {/* Features Section */}
        <section className="relative py-20">
          {/* Edge darkening overlays - only left and right */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-20 container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  Powered by AI Innovation
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Advanced artificial intelligence meets blockchain technology to create the ultimate gaming experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="group p-10 text-center hover:scale-105 hover:-translate-y-3 transition-all duration-500 rounded-3xl" style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(0,255,255,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300" style={{
                  background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                  boxShadow: '0 10px 30px rgba(0,255,255,0.3)'
                }}>
                  <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
                  AI GAME GENERATION
                </h3>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Create unique games instantly using advanced AI algorithms. No coding required.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-10 text-center hover:scale-105 hover:-translate-y-3 transition-all duration-500 rounded-3xl" style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(139,92,246,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300" style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #00FFFF 100%)',
                  boxShadow: '0 10px 30px rgba(139,92,246,0.3)'
                }}>
                  <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
                  BLOCKCHAIN INTEGRATION
                </h3>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Secure ownership, trading, and rewards through blockchain technology.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-10 text-center hover:scale-105 hover:-translate-y-3 transition-all duration-500 rounded-3xl" style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(34,197,94,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300" style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #8B5CF6 100%)',
                  boxShadow: '0 10px 30px rgba(34,197,94,0.3)'
                }}>
                  <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-6 tracking-tight">
                  PLAY-TO-EARN ECONOMY
                </h3>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Earn AGE tokens by playing, creating, and sharing gaming content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tokenomics Section */}
        <section id="tokenomics" className="relative py-20">
          {/* Edge darkening overlays - only left and right */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
        <div className="relative z-20 container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl mb-8" style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(0,255,255,0.15))',
              border: '2px solid rgba(139,92,246,0.3)',
              backdropFilter: 'blur(30px)'
            }}>
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
              <span className="text-purple-400 text-lg font-black uppercase tracking-wider">Token Distribution</span>
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                TOKENOMICS
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-4xl mx-auto font-medium leading-relaxed">
              Smart token distribution designed for <span className="text-purple-400 font-black">SUSTAINABLE GROWTH</span> and community rewards
            </p>
          </div>
          
          {/* Token Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left side - Token Info */}
            <div>
              <div className="space-y-6">
                <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '2px solid rgba(0,255,255,0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-6 h-6 rounded-full bg-cyan-400 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-white font-black text-lg tracking-wide">PUBLIC SALE</span>
                      <span className="text-cyan-400 font-black text-2xl font-mono">40%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 font-medium">Available for public purchase during presale and main sale</p>
                  <div className="w-full h-2 bg-cyan-400/20 rounded-full mt-6">
                    <div className="w-2/5 h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full"></div>
                  </div>
                </div>
                
                <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '2px solid rgba(139,92,246,0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-6 h-6 rounded-full bg-purple-400 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-white font-black text-lg tracking-wide">DEVELOPMENT</span>
                      <span className="text-purple-400 font-black text-2xl font-mono">25%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 font-medium">Platform development and AI research advancement</p>
                  <div className="w-full h-2 bg-purple-400/20 rounded-full mt-6">
                    <div className="w-1/4 h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full"></div>
                  </div>
                </div>
                
                <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '2px solid rgba(34,197,94,0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-6 h-6 rounded-full bg-green-400 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-white font-black text-lg tracking-wide">REWARDS</span>
                      <span className="text-green-400 font-black text-2xl font-mono">20%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 font-medium">Play-to-earn rewards and staking incentives</p>
                  <div className="w-full h-2 bg-green-400/20 rounded-full mt-6">
                    <div className="w-1/5 h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full"></div>
                  </div>
                </div>
                
                <div className="group p-8 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '2px solid rgba(251,146,60,0.3)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-6 h-6 rounded-full bg-orange-400 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-white font-black text-lg tracking-wide">TEAM</span>
                      <span className="text-orange-400 font-black text-2xl font-mono">15%</span>
                    </div>
                  </div>
                  <p className="text-gray-300 font-medium">Team allocation with vesting schedule</p>
                  <div className="w-full h-2 bg-orange-400/20 rounded-full mt-6">
                    <div className="w-[15%] h-full bg-gradient-to-r from-orange-400 to-orange-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Token Details */}
            <div className="p-10 rounded-3xl" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(40px)',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
              <h3 className="text-4xl font-black text-white mb-10 text-center tracking-tight">TOKEN DETAILS</h3>
              <div className="space-y-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-300 font-medium uppercase tracking-wide">Token Name</span>
                  <span className="text-white font-black text-lg">AI GameEngine</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-300 font-medium uppercase tracking-wide">Symbol</span>
                  <span className="text-cyan-400 font-black text-xl font-mono">AGE</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-300 font-medium uppercase tracking-wide">Total Supply</span>
                  <span className="text-white font-black text-lg font-mono">1,000,000,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-300 font-medium uppercase tracking-wide">Blockchain</span>
                  <span className="text-white font-black">Ethereum (ERC-20)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                  <span className="text-gray-300 font-medium uppercase tracking-wide">Initial Price</span>
                  <span className="text-green-400 font-black text-xl font-mono">$0.025</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-300 font-medium uppercase tracking-wide">Listing Price</span>
                  <span className="text-purple-400 font-black text-xl font-mono">$0.05</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group text-center p-10 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-3" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(0,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{
                background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                boxShadow: '0 10px 30px rgba(0,255,255,0.3)'
              }}>
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight">STAKING REWARDS</h4>
              <p className="text-gray-300 leading-relaxed font-medium">Earn up to <span className="text-cyan-400 font-black">12% APY</span> by staking AGE tokens</p>
            </div>
            
            <div className="group text-center p-10 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-3" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(139,92,246,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #00FFFF 100%)',
                boxShadow: '0 10px 30px rgba(139,92,246,0.3)'
              }}>
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight">GOVERNANCE</h4>
              <p className="text-gray-300 leading-relaxed font-medium">Vote on <span className="text-purple-400 font-black">PLATFORM DECISIONS</span> and proposals</p>
            </div>
            
            <div className="group text-center p-10 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-3" style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(30px)',
              border: '2px solid rgba(34,197,94,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}>
              <div className="w-20 h-20 rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #8B5CF6 100%)',
                boxShadow: '0 10px 30px rgba(34,197,94,0.3)'
              }}>
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl font-black text-white mb-6 tracking-tight">UTILITY</h4>
              <p className="text-gray-300 leading-relaxed font-medium">Access <span className="text-green-400 font-black">PREMIUM FEATURES</span> and AI tools</p>
            </div>
          </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="relative py-20">
          {/* Edge darkening overlays - only left and right */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-20 container mx-auto px-4 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl mb-8" style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                border: '2px solid rgba(59,130,246,0.3)',
                backdropFilter: 'blur(30px)'
              }}>
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-400 text-lg font-black uppercase tracking-wider">Got Questions?</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  FAQ
                </span>
              </h2>
              <p className="text-xl text-gray-200 max-w-4xl mx-auto font-medium leading-relaxed">
                Everything you need to know about <span className="text-blue-400 font-black">AI GAMEENGINE</span> and our ICO presale
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto space-y-6">
              {faqData.map((faq, index) => (
                <div key={index} className="group rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1" style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                  backdropFilter: 'blur(40px)',
                  border: '2px solid rgba(59,130,246,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                  <button
                    className="w-full p-8 text-left flex justify-between items-center hover:bg-white/5 transition-all duration-300 group-hover:bg-white/10"
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  >
                    <span className="text-xl md:text-2xl font-black text-white pr-8 leading-tight tracking-tight">{faq.question}</span>
                    <div className="flex-shrink-0">
                      <svg 
                        className={`w-8 h-8 text-blue-400 transition-all duration-300 ${
                          faqOpen === index ? 'rotate-180 text-cyan-400' : 'group-hover:scale-110'
                        }`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {faqOpen === index && (
                    <div className="px-8 pb-8 border-t border-gray-700/30">
                      <div className="text-gray-200 leading-relaxed text-lg font-medium pt-6">{faq.answer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Roadmap Section */}
        <section className="relative py-20">
          {/* Edge darkening overlays - only left and right */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-20 container mx-auto px-4 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl mb-8" style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(0,255,255,0.15))',
                border: '2px solid rgba(34,197,94,0.3)',
                backdropFilter: 'blur(30px)'
              }}>
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400 text-lg font-black uppercase tracking-wider">Development Timeline</span>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                  ROADMAP
                </span>
              </h2>
              <p className="text-xl text-gray-200 max-w-4xl mx-auto font-medium leading-relaxed">
                Our journey to <span className="text-green-400 font-black">REVOLUTIONIZE</span> the gaming industry with AI and blockchain
              </p>
            </div>
            
            {/* Roadmap Timeline */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Q1 2024 */}
                <div className="group text-center">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{
                      background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                      boxShadow: '0 15px 40px rgba(0,255,255,0.3)'
                    }}>
                      <span className="text-black font-black text-2xl">Q1</span>
                    </div>
                    <div className="absolute top-12 left-1/2 w-1 h-20 bg-gradient-to-b from-cyan-400 to-transparent hidden lg:block rounded-full"></div>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-6 tracking-tight">FOUNDATION</h4>
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,23,42,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(0,255,255,0.2)'
                  }}>
                    <ul className="text-gray-200 text-base space-y-3 font-medium">
                      <li className="flex items-center"><span className="text-green-400 mr-3 text-lg">✅</span> Team Assembly</li>
                      <li className="flex items-center"><span className="text-green-400 mr-3 text-lg">✅</span> Whitepaper Release</li>
                      <li className="flex items-center"><span className="text-green-400 mr-3 text-lg">✅</span> Smart Contracts</li>
                      <li className="flex items-center"><span className="text-green-400 mr-3 text-lg">✅</span> Security Audits</li>
                    </ul>
                  </div>
                </div>
                
                {/* Q2 2024 */}
                <div className="group text-center">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #8B5CF6 100%)',
                      boxShadow: '0 15px 40px rgba(245,158,11,0.3)'
                    }}>
                      <span className="text-black font-black text-2xl">Q2</span>
                    </div>
                    <div className="absolute top-12 left-1/2 w-1 h-20 bg-gradient-to-b from-amber-400 to-transparent hidden lg:block rounded-full"></div>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-6 tracking-tight">LAUNCH</h4>
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,23,42,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(245,158,11,0.2)'
                  }}>
                    <ul className="text-gray-200 text-base space-y-3 font-medium">
                      <li className="flex items-center"><span className="text-red-400 mr-3 text-lg">🔥</span> ICO Presale</li>
                      <li className="flex items-center"><span className="text-red-400 mr-3 text-lg">🔥</span> Platform Beta</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> AI Model Training</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> Community Building</li>
                    </ul>
                  </div>
                </div>
                
                {/* Q3 2024 */}
                <div className="group text-center">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 border-4 border-purple-400" style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      boxShadow: '0 15px 40px rgba(139,92,246,0.2)'
                    }}>
                      <span className="text-purple-400 font-black text-2xl">Q3</span>
                    </div>
                    <div className="absolute top-12 left-1/2 w-1 h-20 bg-gradient-to-b from-purple-400/50 to-transparent hidden lg:block rounded-full"></div>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-6 tracking-tight">EXPANSION</h4>
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,23,42,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(139,92,246,0.2)'
                  }}>
                    <ul className="text-gray-200 text-base space-y-3 font-medium">
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> Public Launch</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> DEX Listing</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> AI Game Templates</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> Mobile App</li>
                    </ul>
                  </div>
                </div>
                
                {/* Q4 2024 */}
                <div className="group text-center">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-all duration-300 border-4 border-gray-500" style={{
                      backgroundColor: 'rgba(100, 116, 139, 0.2)',
                      boxShadow: '0 15px 40px rgba(100,116,139,0.2)'
                    }}>
                      <span className="text-gray-400 font-black text-2xl">Q4</span>
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-white mb-6 tracking-tight">EVOLUTION</h4>
                  <div className="p-6 rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,23,42,0.7) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(100,116,139,0.2)'
                  }}>
                    <ul className="text-gray-200 text-base space-y-3 font-medium">
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> NFT Marketplace</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> Advanced AI Tools</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> Partnership Program</li>
                      <li className="flex items-center"><span className="text-yellow-400 mr-3 text-lg">⏳</span> Global Expansion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          {/* Edge darkening overlays - only left and right */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-20 container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl mb-8" style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(0,255,255,0.15))',
                  border: '2px solid rgba(236,72,153,0.3)',
                  backdropFilter: 'blur(30px)'
                }}>
                  <div className="w-3 h-3 rounded-full bg-pink-400 animate-pulse"></div>
                  <span className="text-pink-400 text-lg font-black uppercase tracking-wider">Join The Revolution</span>
                </div>
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                  READY TO BUILD
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                  THE FUTURE?
                </span>
              </h2>
              <p className="text-xl text-gray-200 mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
                Join <span className="text-cyan-400 font-black">THOUSANDS OF DEVELOPERS</span> and gamers who are already creating the next generation of interactive experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <Link href="/register" className="group relative px-12 py-6 text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden" style={{
                  background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                  color: '#000',
                  boxShadow: '0 20px 50px rgba(0,255,255,0.4)'
                }}>
                  <span className="relative z-10 tracking-wide uppercase">GET STARTED FREE</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
                <button className="px-12 py-6 text-xl border-3 border-cyan-400 text-cyan-400 rounded-2xl font-black hover:bg-cyan-400 hover:text-black transition-all duration-300 backdrop-blur-sm bg-white/5 tracking-wide uppercase hover:scale-105">
                  VIEW DOCUMENTATION
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Footer Section */}
        <section className="relative py-16">
          {/* Edge darkening overlays */}
          <div className="absolute inset-0 pointer-events-none z-[1]">
            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black/70 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-20">
            <Footer />
          </div>
        </section>
      </div>
    </div>
  );
}
