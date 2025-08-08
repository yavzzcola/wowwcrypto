'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface CounterSettings {
  id: number;
  stage_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminCounterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<CounterSettings | null>(null);
  const [stageName, setStageName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  // Update countdown display every second
  useEffect(() => {
    if (!endDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const targetTime = new Date(endDate).getTime();
      const distance = targetTime - now;

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
  }, [endDate]);

  const checkAuthAndFetchData = async () => {
    try {
      // First check if user is admin
      const userResponse = await fetch('/api/user/profile');
      const userData = await userResponse.json();
      
      if (!userData.success || userData.data?.role !== 'admin') {
        router.push('/');
        return;
      }

      // Fetch current counter settings
      await fetchCounterSettings();
      
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounterSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/counter-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success && data.settings) {
        const settings = data.settings;
        setCurrentSettings(settings);
        setStageName(settings.stage_name || '');
        setStartDate(settings.start_date ? new Date(settings.start_date).toISOString().slice(0, 16) : '');
        setEndDate(settings.end_date ? new Date(settings.end_date).toISOString().slice(0, 16) : '');
        setIsActive(settings.is_active === 1);
      } else {
        // Set default values if no settings exist
        const now = new Date();
        const defaultEnd = new Date();
        defaultEnd.setDate(defaultEnd.getDate() + 30);
        
        setStageName('ICO Presale Phase 1');
        setStartDate(now.toISOString().slice(0, 16));
        setEndDate(defaultEnd.toISOString().slice(0, 16));
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error fetching counter settings:', error);
    }
  };

  const handleSave = async () => {
    if (!stageName.trim() || !endDate) {
      alert('Please fill in stage name and end date');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stageName: stageName.trim(),
          startDate: startDate || new Date().toISOString(),
          endDate,
          isActive
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Counter settings updated successfully!');
        await fetchCounterSettings();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving counter settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e12] flex items-center justify-center">
        <div className="text-white">Loading counter settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Counter Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage presale countdown timer for homepage and dashboard</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Form */}
            <div className="rounded-2xl overflow-hidden" style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.06)' 
            }}>
              <div className="p-6" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                <h2 className="text-xl font-bold text-white mb-2">Counter Configuration</h2>
                <p className="text-gray-400 text-sm">Set up the presale countdown timer</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Stage Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="ICO Presale Phase 1"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                    required
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      Counter Status
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Enable/disable the countdown display</p>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isActive ? 'bg-cyan-400' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                        isActive ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: saving 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))'
                      : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="rounded-2xl p-6" style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.06)' 
              }}>
                <h3 className="text-lg font-bold text-white mb-4">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Stage:</span>
                    <span className="text-white font-medium">{stageName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className={`font-medium ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">End Date:</span>
                    <span className="text-white font-medium">
                      {endDate ? new Date(endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Countdown Preview */}
              {endDate && isActive && (
                <div className="rounded-2xl p-6" style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.06)' 
                }}>
                  <h3 className="text-lg font-bold text-white mb-4">Live Preview</h3>
                  
                  <div className="text-center mb-4">
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      PRESALE ENDS IN
                    </h4>
                    <p className="text-gray-300 text-sm">{stageName}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-xl" style={{
                      background: 'linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,255,255,0.05))',
                      border: '1px solid rgba(0,255,255,0.2)'
                    }}>
                      <div className="text-2xl font-bold text-cyan-400 font-mono">
                        {timeLeft.days.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">DAYS</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))',
                      border: '1px solid rgba(59,130,246,0.2)'
                    }}>
                      <div className="text-2xl font-bold text-blue-400 font-mono">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">HOURS</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))',
                      border: '1px solid rgba(139,92,246,0.2)'
                    }}>
                      <div className="text-2xl font-bold text-purple-400 font-mono">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">MINUTES</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{
                      background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(236,72,153,0.05))',
                      border: '1px solid rgba(236,72,153,0.2)'
                    }}>
                      <div className="text-2xl font-bold text-pink-400 font-mono">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-300 uppercase tracking-wide">SECONDS</div>
                    </div>
                  </div>

                  {timeLeft.isExpired && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-center">
                      <span className="text-red-400 font-medium">⚠️ Counter has expired</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}