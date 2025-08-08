'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
  user?: {
    username: string;
    email: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Clear token cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Buy',
      href: '/dashboard/buy',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: '#e8e8e8'
    },
    {
      name: 'Withdraw',
      href: '/dashboard/withdraw',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: '#c0c0c0'
    },
    {
      name: 'History',
      href: '/dashboard/history',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#a8a8a8'
    }
  ];

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
        
        .nav-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
          position: relative;
        }
        
        .nav-item:hover {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }
        
        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: currentColor;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        
        .nav-item:hover::before {
          transform: scaleX(1);
        }
        
        .logo-glow {
          background: linear-gradient(45deg, #00FFFF, #993399);
          padding: 2px;
          border-radius: 8px;
        }
        
        .logo-text {
          background: linear-gradient(135deg, #ffffff 0%, #00FFFF 50%, #993399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .profile-avatar {
          background: linear-gradient(45deg, #00FFFF, #993399);
          border-radius: 50%;
          padding: 2px;
          transition: all 0.3s ease;
        }
        
        .profile-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(0,255,255,0.3);
        }
        
        .mobile-btn {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .mobile-btn:hover {
          background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,255,255,0.05));
          border: 1px solid rgba(0,255,255,0.3);
          box-shadow: 0 0 12px rgba(0,255,255,0.2);
        }
        
        .dropdown-menu {
          background: linear-gradient(135deg, rgba(15,15,15,0.98) 0%, rgba(8,8,8,0.99) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.4),
            0 0 30px rgba(0,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        
        .dropdown-item {
          background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s ease;
        }
        
        .dropdown-item:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,255,255,0.15);
          transform: translateX(2px);
        }
        
        .logout-btn {
          background: linear-gradient(135deg, rgba(220,53,69,0.1), rgba(220,53,69,0.05));
          border: 1px solid rgba(220,53,69,0.25);
          transition: all 0.2s ease;
        }
        
        .logout-btn:hover {
          background: linear-gradient(135deg, rgba(220,53,69,0.15), rgba(220,53,69,0.08));
          border: 1px solid rgba(220,53,69,0.4);
          transform: translateX(2px);
        }
      `}</style>
      
      <div className="p-6">
        <header className="max-w-7xl mx-auto">
          <div 
            className="backdrop-blur-xl border transition-all duration-300 hover:scale-[1.005]"
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(80px) saturate(200%)',
              WebkitBackdropFilter: 'blur(80px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 24px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Simple Modern Logo */}
                <Link href="/dashboard" className="group flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <span className="text-white font-black text-lg">C</span>
                  </div>
                  <div className="hidden sm:block">
                    <span 
                      className="text-xl font-bold tracking-wide"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      CryptoPlatform
                    </span>
                  </div>
                </Link>

                {/* Navigation - Button Style like Header */}
                <nav className="hidden lg:flex items-center space-x-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group px-4 py-2 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {item.name.toUpperCase()}
                    </Link>
                  ))}
                </nav>

                {/* Right Side */}
                <div className="flex items-center space-x-3">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2.5 text-white/70 hover:text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* Clean Profile Button */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '18px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <span className="text-sm font-bold text-white">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      <div className="hidden sm:block">
                        <span className="text-sm font-medium text-white/80">
                          {user?.username || 'User'}
                        </span>
                      </div>
                      
                      <svg 
                        className={`w-4 h-4 text-white/50 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                      <div 
                        className="fixed w-72 sm:w-80 p-4 z-[99999] top-16 right-4 sm:absolute sm:top-full sm:right-0 sm:mt-2"
                        style={{ 
                          background: 'rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(80px) saturate(200%)',
                          WebkitBackdropFilter: 'blur(80px) saturate(200%)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '20px',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 8px 32px rgba(0, 0, 0, 0.2)',
                          animation: 'fadeIn 0.2s ease'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Clean User Info */}
                        <div 
                          className="p-4 mb-3"
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <p className="text-white font-semibold text-base">
                            {user?.username || 'User'}
                          </p>
                          <p className="text-white/60 text-sm mt-1">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                        
                        {/* Settings */}
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-white/80 transition-all duration-300 group w-full mb-2 hover:text-white"
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                          onClick={() => setIsProfileMenuOpen(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(0px)';
                          }}
                        >
                          <svg className="w-4 h-4 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium text-sm">Settings</span>
                        </Link>
            
                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 transition-all duration-300 group w-full"
                          style={{
                            background: 'rgba(220, 53, 69, 0.08)',
                            borderRadius: '14px',
                            border: '1px solid rgba(220, 53, 69, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 53, 69, 0.15)';
                            e.currentTarget.style.border = '1px solid rgba(220, 53, 69, 0.3)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(220, 53, 69, 0.08)';
                            e.currentTarget.style.border = '1px solid rgba(220, 53, 69, 0.2)';
                            e.currentTarget.style.transform = 'translateX(0px)';
                          }}
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium text-sm">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="lg:hidden border-t border-white/5 pt-4 mt-4 pb-4">
                <nav className="px-6 space-y-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '18px'
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.15)';
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-white/80">
                          {item.icon}
                        </div>
                        <span className="text-white/90 font-black tracking-wide">
                          {item.name.toUpperCase()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </header>
      </div>
    </>
  );
}