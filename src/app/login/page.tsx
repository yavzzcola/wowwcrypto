'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data.success) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        // User not authenticated, continue to login
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Get token from response headers or cookies
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
        
        if (tokenCookie) {
          const token = tokenCookie.split('=')[1];
          localStorage.setItem('token', token);
        }
        
        router.push(redirectTo);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url("/bg3.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        
        <div className="text-center">
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(0,255,255,0.2)',
            borderTop: '2px solid #00FFFF',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '16px', color: '#888', fontSize: '14px' }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.42) 50%, rgba(0,0,0,0.90) 100%), url("/bg3.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Subtle Background Effects */}
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .feature-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          transform: translateY(-2px);
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
        
        .login-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #00FFFF 0%, #993399 100%);
          transition: all 0.3s ease;
        }
        
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0,255,255,0.2);
        }
        
        .submit-btn:disabled {
          background: rgba(255,255,255,0.1);
          transform: none;
          box-shadow: none;
        }

        /* Mobile-first responsive design */
        @media (max-width: 1023px) {
          .welcome-section {
            display: none;
          }
          
          .login-section {
            max-width: 400px;
            margin: 0 auto;
          }
        }
      `}</style>
      
      <div style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Welcome Content (Hidden on mobile) */}
            <div className="welcome-section space-y-8 text-center lg:text-left">
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: 'rgba(0,255,255,0.1)',
                  border: '1px solid rgba(0,255,255,0.2)',
                  borderRadius: '24px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#00FFFF',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }} />
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#00FFFF', 
                    fontWeight: '900',
                    letterSpacing: '0.1em'
                  }}>
                    SECURE PLATFORM
                  </span>
                </div>
                
                <h1 style={{
                  fontSize: '4rem',
                  fontWeight: '900',
                  color: '#ffffff',
                  marginBottom: '24px',
                  letterSpacing: '-0.03em',
                  lineHeight: '0.9'
                }}>
                  WELCOME
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    BACK
                  </span>
                </h1>
                
                <p style={{
                  fontSize: '1.2rem',
                  color: '#ccc',
                  marginBottom: '40px',
                  lineHeight: '1.6',
                  maxWidth: '450px',
                  margin: '0 auto 40px auto',
                  fontWeight: '500'
                }} className="lg:mx-0">
                  Access your <span style={{ color: '#00FFFF', fontWeight: '900' }}>PORTFOLIO</span> and continue trading with our advanced crypto platform.
                </p>
                
                <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto lg:mx-0">
                  <div className="feature-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(0,123,255,0.1)',
                      border: '1px solid rgba(0,123,255,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#007BFF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '900', color: '#ffffff', fontSize: '15px', marginBottom: '4px', letterSpacing: '0.05em' }}>
                        PORTFOLIO ANALYTICS
                      </h3>
                      <p style={{ color: '#aaa', fontSize: '13px', fontWeight: '500' }}>
                        Track performance in real-time
                      </p>
                    </div>
                  </div>
                  
                  <div className="feature-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(40,167,69,0.1)',
                      border: '1px solid rgba(40,167,69,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#28A745' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '900', color: '#ffffff', fontSize: '15px', marginBottom: '4px', letterSpacing: '0.05em' }}>
                        BANK-LEVEL SECURITY
                      </h3>
                      <p style={{ color: '#aaa', fontSize: '13px', fontWeight: '500' }}>
                        Your assets are protected
                      </p>
                    </div>
                  </div>
                  
                  <div className="feature-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(153,51,153,0.1)',
                      border: '1px solid rgba(153,51,153,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#993399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '900', color: '#ffffff', fontSize: '15px', marginBottom: '4px', letterSpacing: '0.05em' }}>
                        LIGHTNING FAST
                      </h3>
                      <p style={{ color: '#aaa', fontSize: '13px', fontWeight: '500' }}>
                        Execute trades instantly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form (Always visible, centered on mobile) */}
            <div className="login-section space-y-6">
              <div className="text-center lg:text-left">
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: '900',
                  color: '#ffffff',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em'
                }}>
                  SIGN IN
                </h2>
                <p style={{ color: '#bbb', fontSize: '16px', fontWeight: '500' }}>
                  Enter your credentials to access your <span style={{ color: '#00FFFF', fontWeight: '900' }}>ACCOUNT</span>
                </p>
              </div>

              {/* Login Form Card */}
              <div className="login-card" style={{
                borderRadius: '16px',
                padding: '32px'
              }}>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '900',
                      color: '#00FFFF',
                      letterSpacing: '0.05em'
                    }}>
                      EMAIL ADDRESS
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}>
                        <svg style={{ width: '16px', height: '16px', color: '#888' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="input-field"
                        style={{
                          width: '100%',
                          paddingLeft: '40px',
                          paddingRight: '12px',
                          paddingTop: '12px',
                          paddingBottom: '12px',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '900',
                      color: '#00FFFF',
                      letterSpacing: '0.05em'
                    }}>
                      PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}>
                        <svg style={{ width: '16px', height: '16px', color: '#888' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        className="input-field"
                        style={{
                          width: '100%',
                          paddingLeft: '40px',
                          paddingRight: '40px',
                          paddingTop: '12px',
                          paddingBottom: '12px',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '12px',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg style={{ width: '16px', height: '16px', color: '#888' }} className="hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-6.415-6.414M21.536 21.536l-6.415-6.414M21.536 21.536a10.05 10.05 0 01-5.093-5.093" />
                          </svg>
                        ) : (
                          <svg style={{ width: '16px', height: '16px', color: '#888' }} className="hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div style={{
                      background: 'rgba(220,53,69,0.1)',
                      border: '1px solid rgba(220,53,69,0.3)',
                      color: '#ff6b7a',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '16px', height: '16px', color: '#dc3545', marginRight: '8px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="submit-btn"
                    style={{
                      width: '100%',
                      color: '#000000',
                      padding: '14px 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(0,0,0,0.3)',
                          borderTop: '2px solid #000000',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        <span style={{ fontWeight: '900', letterSpacing: '0.05em' }}>SIGNING IN...</span>
                      </>
                    ) : (
                      <>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span style={{ fontWeight: '900', letterSpacing: '0.05em' }}>SIGN IN</span>
                      </>
                    )}
                  </button>

                  {/* Forgot Password Link */}
                  <div style={{ textAlign: 'center' }}>
                    <Link
                      href="/forgot-password"
                      style={{
                        fontSize: '14px',
                        color: '#00FFFF',
                        textDecoration: 'none',
                        fontWeight: '900',
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:text-cyan-300 hover:underline"
                    >
                      FORGOT YOUR PASSWORD?
                    </Link>
                  </div>
                </form>
              </div>

              {/* Sign Up Link */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#bbb', fontSize: '15px', fontWeight: '500' }}>
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    style={{
                      color: '#00FFFF',
                      fontWeight: '900',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover:text-cyan-300 hover:underline"
                  >
                    CREATE ACCOUNT
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}