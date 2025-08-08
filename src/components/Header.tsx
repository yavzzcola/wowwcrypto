'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  user?: {
    username: string;
    role?: string;
    email?: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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
      await fetch('/api/auth/logout', { method: 'POST' });
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-6">
      <header className="max-w-7xl mx-auto">
        <div 
          className="backdrop-blur-xl border transition-all duration-300 hover:scale-[1.002]"
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
            <div className="flex items-center justify-between">
              {/* Logo - Dashboard Style */}
              <Link href="/" className="group flex items-center space-x-4">
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

              {/* Navigation - Desktop */}
              <nav className="hidden lg:flex items-center space-x-1">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="group px-4 py-2 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                      style={{
                        background: isActive('/dashboard') ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(30px)',
                        border: isActive('/dashboard') ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '16px',
                        color: isActive('/dashboard') ? 'rgba(0, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive('/dashboard')) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                        }
                        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive('/dashboard')) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        }
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      DASHBOARD
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="group px-4 py-2 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                        style={{
                          background: isActive('/admin') ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 165, 0, 0.02)',
                          backdropFilter: 'blur(30px)',
                          border: isActive('/admin') ? '1px solid rgba(255, 165, 0, 0.3)' : '1px solid rgba(255, 165, 0, 0.1)',
                          borderRadius: '16px',
                          color: isActive('/admin') ? 'rgba(255, 165, 0, 1)' : 'rgba(255, 165, 0, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive('/admin')) {
                            e.currentTarget.style.background = 'rgba(255, 165, 0, 0.06)';
                            e.currentTarget.style.border = '1px solid rgba(255, 165, 0, 0.2)';
                            e.currentTarget.style.color = 'rgba(255, 165, 0, 1)';
                          }
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 165, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive('/admin')) {
                            e.currentTarget.style.background = 'rgba(255, 165, 0, 0.02)';
                            e.currentTarget.style.border = '1px solid rgba(255, 165, 0, 0.1)';
                            e.currentTarget.style.color = 'rgba(255, 165, 0, 0.8)';
                          }
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ADMIN
                      </Link>
                    )}
                  </>
                ) : (
                  pathname === '/' && (
                    <>
                      {/* Home Page Section Links */}
                      <button
                        onClick={() => {
                          const element = document.getElementById('tokenomics');
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="group px-4 py-2 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        TOKENOMICS
                      </button>
                      <button
                        onClick={() => {
                          const element = document.querySelector('section:has([style*="Development Timeline"])');
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="group px-4 py-2 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ROADMAP
                      </button>
                      <button
                        onClick={() => {
                          const element = document.querySelector('section:has([style*="Got Questions?"])');
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="group px-4 py-2 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        FAQ
                      </button>
                    </>
                  )
                )}
              </nav>

              {/* Right Side */}
              <div className="flex items-center space-x-3">
                {!user ? (
                  <>
                    {/* Login/Sign Up Buttons for non-logged users */}
                    <div className="hidden lg:flex items-center space-x-3">
                      <Link 
                        href="/login" 
                        className="px-6 py-3 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          backdropFilter: 'blur(30px)',
                          border: '2px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '18px',
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                        }}
                      >
                        LOGIN
                      </Link>
                      <Link 
                        href="/register" 
                        className="group relative px-8 py-3 font-black transition-all duration-300 hover:scale-105 text-sm tracking-wide overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                          color: '#000',
                          borderRadius: '18px',
                          boxShadow: '0 8px 25px rgba(0, 255, 255, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 255, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 255, 0.3)';
                        }}
                      >
                        <span className="relative z-10">JOIN PRESALE</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      </Link>
                    </div>
                    
                    {/* Mobile Menu Button - Non-logged users */}
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                  </>
                ) : (
                  <>
                    {/* Mobile Menu Button - Logged users */}
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
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

                    {/* Profile Button for logged in users */}
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
                          {/* User Info */}
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
                            {user.role && (
                              <p className="text-white/40 text-xs mt-1 capitalize">
                                {user.role}
                              </p>
                            )}
                          </div>
                          
                          {/* Navigation Links */}
                          <Link
                            href="/dashboard"
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
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v4" />
                            </svg>
                            <span className="font-medium text-sm">Dashboard</span>
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
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-white/5 pt-4 mt-4 pb-4">
              <nav className="px-6 space-y-3">
                {!user ? (
                  <>
                    {pathname === '/' && (
                      <>
                        {/* Section Navigation - Mobile */}
                        <button
                          onClick={() => {
                            const element = document.getElementById('tokenomics');
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setIsMenuOpen(false);
                          }}
                          className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '18px'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-white/80">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <span className="text-white/90 font-black tracking-wide">TOKENOMICS</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            const element = document.querySelector('section:has([style*="Development Timeline"])');
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setIsMenuOpen(false);
                          }}
                          className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '18px'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-white/80">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3m0 2h2m-2 0V3m0 0V1" />
                              </svg>
                            </div>
                            <span className="text-white/90 font-black tracking-wide">ROADMAP</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            const element = document.querySelector('section:has([style*="Got Questions?"])');
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setIsMenuOpen(false);
                          }}
                          className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '18px'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-white/80">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-white/90 font-black tracking-wide">FAQ</span>
                          </div>
                        </button>
                        <div className="h-4" />
                      </>
                    )}
                    <Link
                      href="/login"
                      className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '18px'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-white/80">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="text-white/90 font-black tracking-wide">LOGIN</span>
                      </div>
                    </Link>
                    <Link
                      href="/register"
                      className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                        borderRadius: '18px',
                        color: '#000'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <span className="font-black tracking-wide">JOIN PRESALE</span>
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-4" style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <p className="text-white font-semibold">{user?.username || 'User'}</p>
                      {user?.email && <p className="text-white/60 text-sm">{user.email}</p>}
                      {user.role && <p className="text-white/40 text-xs capitalize">{user.role}</p>}
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '18px'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-white/80">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v4" />
                          </svg>
                        </div>
                        <span className="text-white/90 font-black tracking-wide">DASHBOARD</span>
                      </div>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                        style={{
                          background: 'rgba(255, 165, 0, 0.06)',
                          backdropFilter: 'blur(20px)',
                          border: '2px solid rgba(255, 165, 0, 0.3)',
                          borderRadius: '18px'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-orange-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-orange-400 font-black tracking-wide">ADMIN PANEL</span>
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full block px-5 py-4 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: 'rgba(220, 53, 69, 0.08)',
                        border: '1px solid rgba(220, 53, 69, 0.2)',
                        borderRadius: '18px'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-red-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="text-red-400 font-black tracking-wide">LOGOUT</span>
                      </div>
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
