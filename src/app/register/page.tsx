'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referral_code: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const cookies = document.cookie;
      const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));

      if (tokenCookie) {
        try {
          const response = await fetch('/api/user/profile');
          const data = await response.json();
          
          if (data.success) {
            router.push('/dashboard');
            return;
          } else {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          }
        } catch (error) {
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  // Set referral code from URL parameter
  useEffect(() => {
    if (referralCode && !formData.referral_code) {
      setFormData(prev => ({ ...prev, referral_code: referralCode }));
    }
  }, [referralCode]);

  // Calculate password strength
  useEffect(() => {
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 6) strength += 1;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };
    
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return '#dc3545';
    if (passwordStrength <= 2) return '#ffc107';
    if (passwordStrength <= 3) return '#007bff';
    return '#28a745';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

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
    setSuccess('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          referral_code: formData.referral_code || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Account created successfully! Please login to continue.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0, 0, 0, 0.42) 50%, rgba(0,0,0,0.90) 100%), url("/bg3.jpg")',
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
      background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(26,26,46,0.85) 50%, rgba(0,0,0,0.90) 100%), url("/bg3.jpg")',
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
        
        .submit-btn:hover:not(:disabled) {
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
          
          .register-section {
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
                    JOIN 100K+ TRADERS
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
                  START YOUR
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #00FFFF 0%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    JOURNEY
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
                  Join the future of <span style={{ color: '#00FFFF', fontWeight: '900' }}>CRYPTOCURRENCY TRADING</span> with our advanced platform built for everyone.
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
                      background: 'rgba(40,167,69,0.1)',
                      border: '1px solid rgba(40,167,69,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#28A745' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#ffffff', fontSize: '14px', marginBottom: '2px' }}>
                        Free To Start
                      </h3>
                      <p style={{ color: '#888', fontSize: '12px' }}>
                        No hidden fees or charges
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
                      background: 'rgba(0,123,255,0.1)',
                      border: '1px solid rgba(0,123,255,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#007BFF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#ffffff', fontSize: '14px', marginBottom: '2px' }}>
                        Advanced Tools
                      </h3>
                      <p style={{ color: '#888', fontSize: '12px' }}>
                        Professional trading suite
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
                      background: 'rgba(255,193,7,0.1)',
                      border: '1px solid rgba(255,193,7,0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg style={{ width: '18px', height: '18px', color: '#FFC107' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#ffffff', fontSize: '14px', marginBottom: '2px' }}>
                        24/7 Support
                      </h3>
                      <p style={{ color: '#888', fontSize: '12px' }}>
                        Always here to help you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Register Form (Always visible, centered on mobile) */}
            <div className="register-section space-y-6">
              <div className="text-center lg:text-left">
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: '900',
                  color: '#ffffff',
                  marginBottom: '12px',
                  letterSpacing: '-0.02em'
                }}>
                  CREATE ACCOUNT
                </h2>
                <p style={{ color: '#bbb', fontSize: '16px', fontWeight: '500' }}>
                  Fill in your details to <span style={{ color: '#00FFFF', fontWeight: '900' }}>GET STARTED</span>
                </p>
              </div>

              {/* Register Form Card */}
              <div className="login-card" style={{
                borderRadius: '16px',
                padding: '32px'
              }}>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label htmlFor="username" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '900',
                      color: '#00FFFF',
                      letterSpacing: '0.05em'
                    }}>
                      USERNAME
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
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
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

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
                        autoComplete="new-password"
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
                        placeholder="Create a strong password"
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
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '4px' }}>
                            <div
                              style={{
                                height: '4px',
                                borderRadius: '4px',
                                background: getPasswordStrengthColor(),
                                width: `${(passwordStrength / 5) * 100}%`,
                                transition: 'all 0.3s ease'
                              }}
                            />
                          </div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: getPasswordStrengthColor()
                          }}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '900',
                      color: '#00FFFF',
                      letterSpacing: '0.05em'
                    }}>
                      CONFIRM PASSWORD
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
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
                          outline: 'none',
                          borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'rgba(220,53,69,0.5)' 
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? 'rgba(40,167,69,0.5)'
                            : 'rgba(255,255,255,0.1)'
                        }}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
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
                    {formData.confirmPassword && (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                        {formData.password === formData.confirmPassword ? (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#28a745', fontSize: '12px' }}>
                            <svg style={{ width: '14px', height: '14px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Passwords match
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#dc3545', fontSize: '12px' }}>
                            <svg style={{ width: '14px', height: '14px', marginRight: '6px' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Passwords don't match
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Referral Code Field (Optional) */}
                  <div className="space-y-2">
                    <label htmlFor="referral_code" style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#00FFFF'
                    }}>
                      Referral Code (Optional)
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                      </div>
                      <input
                        id="referral_code"
                        name="referral_code"
                        type="text"
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
                        placeholder="Enter referral code"
                        value={formData.referral_code}
                        onChange={handleChange}
                      />
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

                  {/* Success Message */}
                  {success && (
                    <div style={{
                      background: 'rgba(40,167,69,0.1)',
                      border: '1px solid rgba(40,167,69,0.3)',
                      color: '#4ade80',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '16px', height: '16px', color: '#28a745', marginRight: '8px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || formData.password !== formData.confirmPassword || !formData.username || !formData.email || !formData.password}
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
                      opacity: (isLoading || formData.password !== formData.confirmPassword || !formData.username || !formData.email || !formData.password) ? 0.5 : 1
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
                        <span style={{ fontWeight: '900', letterSpacing: '0.05em' }}>CREATING ACCOUNT...</span>
                      </>
                    ) : (
                      <>
                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span style={{ fontWeight: '900', letterSpacing: '0.05em' }}>CREATE ACCOUNT</span>
                      </>
                    )}
                  </button>

                  {/* Terms and Privacy */}
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#888', 
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" style={{ color: '#00FFFF', textDecoration: 'none' }} className="hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" style={{ color: '#00FFFF', textDecoration: 'none' }} className="hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </div>

              {/* Sign In Link */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#bbb', fontSize: '15px', fontWeight: '500' }}>
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    style={{
                      color: '#00FFFF',
                      fontWeight: '900',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover:text-cyan-300 hover:underline"
                  >
                    SIGN IN
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