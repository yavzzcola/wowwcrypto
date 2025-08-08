'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DashboardHeader from './DashboardHeader';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number | string;
  referral_code: string;
  role: string;
}

export default function GlobalHeader() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  // Dashboard pages that should show the header
  const dashboardPages = ['/dashboard', '/dashboard/buy', '/dashboard/withdraw', '/dashboard/history', '/dashboard/settings'];
  const shouldShowHeader = dashboardPages.some(page => pathname?.startsWith(page));

  useEffect(() => {
    if (shouldShowHeader) {
      fetchUserData();
    }
  }, [shouldShowHeader, pathname]);

  const fetchUserData = async () => {
    try {
      const userResponse = await fetch('/api/user/profile');
      const userData = await userResponse.json();
      
      if (userData.success) {
        setUser(userData.data || userData.user);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-black/20 backdrop-blur-sm">
      <DashboardHeader user={user} />
    </div>
  );
}
