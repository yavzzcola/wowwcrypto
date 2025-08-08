import Link from 'next/link';

export default function Footer() {
  return (
    <>
      <style jsx>{`
        @keyframes noise {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .footer-glass {
          position: relative;
          overflow: hidden;
        }
        
        .footer-glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.03' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3Cpath d='M0 0l40 40M0 40L40 0'/%3E%3C/g%3E%3C/svg%3E");
          animation: noise 4s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        
        .footer-content {
          position: relative;
          z-index: 2;
        }
        
        .status-badge {
          transition: all 0.3s ease;
        }
      `}</style>
      
      <div className="p-6">
        <footer 
          className="max-w-7xl mx-auto relative overflow-hidden transition-all duration-500 hover:scale-[1.01] footer-glass"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(15,23,42,0.8) 100%)',
            backdropFilter: 'blur(40px)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '28px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 25px 50px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="px-8 py-6 footer-content">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-6">
                <p className="text-white/80 text-sm font-black tracking-wide">
                  © 2025 CRYPTOPLATFORM. ALL RIGHTS RESERVED.
                </p>
                <div className="hidden md:flex items-center space-x-3">
                  {/* Telegram */}
                  <a 
                    href="#"
                    className="flex items-center justify-center w-10 h-10 transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(42, 171, 238, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(42, 171, 238, 0.3)',
                      borderRadius: '20px',
                      color: 'rgb(42, 171, 238)'
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                    </svg>
                  </a>
                  {/* Twitter */}
                  <a 
                    href="#"
                    className="flex items-center justify-center w-10 h-10 transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(29, 161, 242, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(29, 161, 242, 0.3)',
                      borderRadius: '20px',
                      color: 'rgb(29, 161, 242)'
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-6">
                <div 
                  className="flex items-center space-x-2 px-4 py-2 transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '18px'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-white/90 text-sm font-black tracking-wide">PLATFORM ONLINE</span>
                </div>
                <div 
                  className="hidden md:flex items-center space-x-2 px-4 py-2 transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '18px'
                  }}
                >
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/70 text-sm font-medium tracking-wide">SUPPORT@CRYPTOPLATFORM.COM</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
