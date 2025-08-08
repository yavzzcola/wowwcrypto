'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number | string;
  referral_code: string;
  role: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [coinSymbol, setCoinSymbol] = useState('ABC');
  const [coinName, setCoinName] = useState('ABC System');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    emailAlerts: true,
    twoFactor: false
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const userResponse = await fetch('/api/user/profile');
      const userData = await userResponse.json();
      
      if (!userData.success) {
        router.push('/login');
        return;
      }

      const userInfo = userData.data || userData.user;
      setUser(userInfo);
      setFormData(prev => ({
        ...prev,
        username: userInfo.username || '',
        email: userInfo.email || ''
      }));

      try {
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setCoinName(settingsData.settings.coin_name || 'ABC System');
          setCoinSymbol(settingsData.settings.coin_symbol || 'ABC');
        }
      } catch (error) {
        console.log('Settings not available, using defaults');
      }
      
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    // Mock update profile
    console.log('Updating profile...');
  };

  const handleChangePassword = async () => {
    // Mock change password
    console.log('Changing password...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Loading Settings...</p>
        </div>
      </div>
    );
  }

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
        }
      `}</style>

      <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
        {/* Background Image - Fixed/Static */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: "url('/bg3.jpg')",
            backgroundAttachment: 'fixed'
          }}
        ></div>
        {/* Dark overlay for better readability */}
        <div className="fixed inset-0 bg-black/30 z-[1]"></div>
        
        
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
                ACCOUNT SETTINGS
              </h1>
              <p className="text-gray-300 text-base font-medium">
                Manage your <span className="text-blue-400 font-black">ACCOUNT PREFERENCES</span> and security settings
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto relative">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div 
                  className="backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-8 animate-professional-fade"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="space-y-2">
                    {[
                      { 
                        id: 'profile', 
                        name: 'Profile', 
                        icon: (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )
                      },
                      { 
                        id: 'security', 
                        name: 'Security', 
                        icon: (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        )
                      }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                          activeTab === tab.id ? 'selected' : ''
                        }`}
                        style={activeTab === tab.id
                          ? {
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: 'rgb(147, 197, 253)',
                              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
                            } 
                          : {
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: 'rgb(209, 213, 219)'
                            }
                        }
                      >
                        <span className="flex-shrink-0">{tab.icon}</span>
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 animate-professional-fade">
                    <div 
                      className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01] animate-smooth-scale"
                      style={{
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
                      </div>
                      
                      <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 relative z-10">
                        <span className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                          👤
                        </span>
                        <span>Profile Information</span>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Username
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all duration-300 input-field"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(20px)',
                              outline: 'none'
                            }}
                          />
                          <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed transition-all duration-300 input-field"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(20px)',
                              outline: 'none'
                            }}
                          />
                          <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Referral Code
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={user?.referral_code || ''}
                              readOnly
                              className="w-full px-4 py-3 rounded-xl text-white font-mono transition-all duration-300 input-field"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)',
                                outline: 'none'
                              }}
                            />
                            <button 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-300 hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                color: 'rgb(52, 211, 153)'
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleUpdateProfile}
                        className="mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 relative z-10"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)'
                        }}
                      >
                        Update Profile
                      </button>
                    </div>
      
                    <div 
                      className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01] animate-smooth-scale"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(40px)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        animationDelay: '0.2s'
                      }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          💰
                        </span>
                        <span>Account Balance</span>
                      </h3>
                      
                      <div className="text-center py-4">
                        <div className="text-4xl font-bold text-emerald-400 mb-2 animate-subtle-float">
                          {typeof user?.balance === 'string' ? parseFloat(user.balance).toLocaleString() : user?.balance?.toLocaleString() || '0'}
                        </div>
                        <div className="text-gray-400">{coinSymbol} Tokens</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6 animate-professional-fade">
                    <div 
                      className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01] animate-smooth-scale"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(40px)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {/* Professional Ambient Particles */}
                      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                        <div className="absolute top-6 right-10 w-0.5 h-0.5 bg-red-200/40 rounded-full animate-elegant-pulse"></div>
                        <div className="absolute top-12 right-6 w-1 h-1 bg-orange-300/35 rounded-full animate-gentle-glow" style={{animationDelay: '2.5s'}}></div>
                        <div className="absolute top-4 right-16 w-0.5 h-0.5 bg-pink-200/50 rounded-full animate-elegant-pulse" style={{animationDelay: '1.8s'}}></div>
                        <div className="absolute top-8 left-8 w-1 h-1 bg-red-200/30 rounded-full animate-gentle-glow" style={{animationDelay: '3.2s'}}></div>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 relative z-10">
                        <span className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center">
                          🔒
                        </span>
                        <span>Change Password</span>
                      </h2>
                      
                      <div className="space-y-6 relative z-10">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none input-field"
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
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none input-field"
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
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none input-field"
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
                        </div>
                      </div>
                      
                      <button
                        onClick={handleChangePassword}
                        className="mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 relative z-10"
                        style={{
                          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)'
                        }}
                      >
                        Change Password
                      </button>
                    </div>
      
                    <div 
                      className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.01] animate-smooth-scale"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(40px)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        animationDelay: '0.2s'
                      }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          🔐
                        </span>
                        <span>Two-Factor Authentication</span>
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 mb-1">Secure your account with 2FA</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.twoFactor}
                            onChange={(e) => setFormData({...formData, twoFactor: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-400/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
        
        <div className="relative z-[10]">
          <Footer />
        </div>
      </div>
    </>
  );
}
