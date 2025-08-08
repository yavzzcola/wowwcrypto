'use client';

interface StatsCardsProps {
  coinBalance: number;
  referralEarnings: number;
  referralCount: number;
  coinSymbol: string;
}

export default function StatsCards({ 
  coinBalance, 
  referralEarnings, 
  referralCount, 
  coinSymbol 
}: StatsCardsProps) {
  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        
        @keyframes glass-shimmer {
          0% { 
            background-position: -200% 0; 
          }
          100% { 
            background-position: 200% 0; 
          }
        }
        
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(0, 0, 0, 0.3),
              0 4px 40px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 30px rgba(0, 0, 0, 0.4),
              0 8px 50px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }
        }
        
        .futuristic-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .glass-card {
          background: rgba(15, 15, 20, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 0 20px rgba(0, 0, 0, 0.3),
            0 4px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.02) 0%,
            rgba(255, 255, 255, 0.05) 25%,
            rgba(255, 255, 255, 0.02) 50%,
            rgba(255, 255, 255, 0.05) 75%,
            rgba(255, 255, 255, 0.02) 100%
          );
          background-size: 400% 400%;
          pointer-events: none;
          z-index: 1;
        }
        
        .glass-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.02),
            transparent
          );
          transform: rotate(45deg);
          transition: all 0.6s ease;
          opacity: 0;
          pointer-events: none;
          z-index: 2;
        }
        
        .glass-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.15);
          animation: glow-pulse 3s ease-in-out infinite;
        }
        
        .glass-card:hover::before {
          animation: glass-shimmer 2s ease-in-out infinite;
        }
        
        .glass-card:hover::after {
          opacity: 1;
          animation: glass-shimmer 1.5s ease-in-out infinite;
        }
        
        .glass-blue {
          background: rgba(15, 20, 35, 0.6);
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.1),
            0 4px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(59, 130, 246, 0.1);
        }
        
        .glass-blue:hover {
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 
            0 0 40px rgba(59, 130, 246, 0.2),
            0 8px 50px rgba(59, 130, 246, 0.1),
            inset 0 1px 0 rgba(59, 130, 246, 0.2);
        }
        
        .glass-purple {
          background: rgba(25, 15, 35, 0.6);
          border-color: rgba(168, 85, 247, 0.2);
          box-shadow: 
            0 0 20px rgba(168, 85, 247, 0.1),
            0 4px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(168, 85, 247, 0.1);
        }
        
        .glass-purple:hover {
          border-color: rgba(168, 85, 247, 0.4);
          box-shadow: 
            0 0 40px rgba(168, 85, 247, 0.2),
            0 8px 50px rgba(168, 85, 247, 0.1),
            inset 0 1px 0 rgba(168, 85, 247, 0.2);
        }
        
        .glass-green {
          background: rgba(15, 35, 25, 0.6);
          border-color: rgba(34, 197, 94, 0.2);
          box-shadow: 
            0 0 20px rgba(34, 197, 94, 0.1),
            0 4px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(34, 197, 94, 0.1);
        }
        
        .glass-green:hover {
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 
            0 0 40px rgba(34, 197, 94, 0.2),
            0 8px 50px rgba(34, 197, 94, 0.1),
            inset 0 1px 0 rgba(34, 197, 94, 0.2);
        }
        
        .holographic-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.4s ease;
          backdrop-filter: blur(10px);
        }
        
        .holographic-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.1)
          );
          background-size: 200% 200%;
          transition: all 0.4s ease;
        }
        
        .icon-blue {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }
        
        .icon-purple {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #c084fc;
        }
        
        .icon-green {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }
        
        .glass-card:hover .holographic-icon {
          animation: subtle-float 2s ease-in-out infinite;
          transform: scale(1.05);
        }
        
        .glass-card:hover .holographic-icon::before {
          animation: glass-shimmer 2s ease-in-out infinite;
        }
        
        .cyber-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.75rem;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #ffffff;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          position: relative;
        }
        
        .cyber-value::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 30%;
          height: 2px;
          background: linear-gradient(90deg, currentColor, transparent);
          opacity: 0.6;
        }
        
        .label-text {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }
        
        .metric-text {
          font-size: 1rem;
          font-weight: 500;
          margin-top: 0.75rem;
          opacity: 0.9;
        }
        
        .status-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          backdrop-filter: blur(10px);
          border: 1px solid;
          position: relative;
          overflow: hidden;
        }
        
        .status-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .status-badge:hover::before {
          left: 100%;
        }
        
        .badge-active {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border-color: rgba(34, 197, 94, 0.3);
        }
        
        .badge-earning {
          background: rgba(168, 85, 247, 0.1);
          color: #c084fc;
          border-color: rgba(168, 85, 247, 0.3);
        }
        
        .badge-network {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .content-wrapper {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .cyber-value {
            font-size: 2.25rem;
          }
        }
      `}</style>

      <div className="futuristic-container">
        <div className="stats-grid">
          {/* Token Balance */}
          <div className="glass-card glass-blue">
            <div className="p-8">
              <div className="content-wrapper">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="holographic-icon icon-blue">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                      </svg>
                    </div>
                    <div className="status-badge badge-active">◉ LIVE</div>
                  </div>
                  
                  <div className="label-text text-blue-300">Wallet Balance</div>
                  <div className="cyber-value text-blue-100">{coinBalance.toLocaleString()}</div>
                </div>
                
                <div className="metric-text text-blue-200">
                  {coinSymbol} Available
                </div>
              </div>
            </div>
          </div>

          {/* Network Rewards */}
          <div className="glass-card glass-purple">
            <div className="p-8">
              <div className="content-wrapper">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="holographic-icon icon-purple">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                    </div>
                    <div className="status-badge badge-earning">↗ +15.2%</div>
                  </div>
                  
                  <div className="label-text text-purple-300">Network Rewards</div>
                  <div className="cyber-value text-purple-100">{referralEarnings.toLocaleString()}</div>
                </div>
                
                <div className="metric-text text-purple-200">
                  {coinSymbol} Total Earned
                </div>
              </div>
            </div>
          </div>

          {/* Network Size */}
          <div className="glass-card glass-green">
            <div className="p-8">
              <div className="content-wrapper">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="holographic-icon icon-green">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                    <div className="status-badge badge-network">⟡ ACTIVE</div>
                  </div>
                  
                  <div className="label-text text-green-300">Network Scale</div>
                  <div className="cyber-value text-green-100">{referralCount}</div>
                </div>
                
                <div className="metric-text text-green-200">
                  Connected Nodes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}