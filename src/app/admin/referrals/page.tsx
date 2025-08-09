'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { DatabaseUser, Commission } from '@/types';

interface ReferralItem {
  id: number;
  user_id: number;
  username: string;
  referred_user: string;
  referred_email: string;
  referral_code?: string;
  reward_amount: number;
  total_deposits?: number;
  created_at: string;
}

export default function AdminReferralsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReferralItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    filterData();
  }, [items, searchTerm, currentPage]);

  const filterData = () => {
    let filtered = [...items];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referred_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referred_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredItems(filtered.slice(start, end));
  };

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      
      // Fetch from multiple sources
      const [referralsRes, usersRes] = await Promise.all([
        fetch('/api/referrals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const [referralsData, usersData] = await Promise.all([
        referralsRes.json(),
        usersRes.json()
      ]);
      
      // Combine referral data with user data
      const commissions = referralsData.data?.commission_history || [];
      const users = usersData.data?.users || [];
      
      // Create comprehensive referral list
      const allReferrals = users
        .filter((u: DatabaseUser) => u.referred_by)
        .map((u: DatabaseUser) => ({
          id: u.id,
          user_id: users.find((ref: DatabaseUser) => ref.referral_code === u.referred_by)?.id || 0,
          username: users.find((ref: DatabaseUser) => ref.referral_code === u.referred_by)?.username || 'Unknown',
          referred_user: u.username,
          referred_email: u.email,
          referral_code: u.referred_by,
          reward_amount: commissions.find((c: Commission) => c.external_id === u.id)?.amount || 0,
          total_deposits: u.total_deposits || 0,
          created_at: u.created_at
        }));
      
      setItems(allReferrals);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(items.filter(r => {
    if (searchTerm && !(
      r.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referred_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referred_email?.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  }).length / itemsPerPage);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e12] flex items-center justify-center">
        <div className="text-white">Loading referrals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Referral System
            </h1>
          </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by username, referred user or referral code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-md px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-400/50 transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05))', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            <div className="text-sm text-purple-400">Total Referrals</div>
            <div className="text-2xl font-bold">{items.length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div className="text-sm text-pink-400">Active Users</div>
            <div className="text-2xl font-bold">{new Set(items.map(r => r.username)).size}</div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table className="w-full">
            <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referrer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referred User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referral Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Reward</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Deposits</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length > 0 ? filteredItems.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm">{r.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{r.username || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{r.referred_user || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">{r.referred_email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-purple-400/10 text-purple-400 text-xs font-mono">
                      {r.referral_code || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{Number(r.reward_amount ?? 0).toFixed(8)}</td>
                  <td className="px-6 py-4 font-mono">{Number(r.total_deposits ?? 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No referrals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg disabled:opacity-50"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              Next
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

