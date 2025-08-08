'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface Withdrawal {
  id: number;
  user_id: number;
  username: string;
  email: string;
  amount: number;
  currency: string;
  address: string;
  fee: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    filterData();
  }, [withdrawals, selectedStatus, searchTerm, currentPage]);

  const filterData = () => {
    let filtered = [...withdrawals];
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(w => w.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredWithdrawals(filtered.slice(start, end));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/admin/withdrawals?status=all&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        router.push('/');
        return;
      }

      setWithdrawals(data.data?.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Withdrawal approved successfully');
        await fetchWithdrawals(); // Refetch to update stats
      } else {
        alert('Error: ' + (data.message || 'Failed to approve withdrawal'));
      }
    } catch (error) {
      alert('Error approving withdrawal');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason || reason.trim().length < 3) {
      alert('Please provide a rejection reason (minimum 3 characters)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Withdrawal rejected successfully');
        await fetchWithdrawals(); // Refetch to update stats
      } else {
        alert('Error: ' + (data.message || 'Failed to reject withdrawal'));
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Error rejecting withdrawal. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e12] flex items-center justify-center">
        <div className="text-white">Loading withdrawals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Withdrawals Management
            </h1>
          </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by username, email or address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-blue-400/50 transition-colors"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-blue-400/50 transition-colors text-white"
            style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <option value="all" style={{ color: 'black' }}>All Statuses</option>
            <option value="pending" style={{ color: 'black' }}>Pending</option>
            <option value="approved" style={{ color: 'black' }}>Approved</option>
            <option value="completed" style={{ color: 'black' }}>Completed</option>
            <option value="rejected" style={{ color: 'black' }}>Rejected</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div className="text-sm text-blue-400">Total</div>
            <div className="text-2xl font-bold">{withdrawals.length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <div className="text-sm text-yellow-400">Pending</div>
            <div className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'pending').length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div className="text-sm text-green-400">Completed</div>
            <div className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'completed' || w.status === 'approved').length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="text-sm text-red-400">Rejected</div>
            <div className="text-2xl font-bold">{withdrawals.filter(w => w.status === 'rejected').length}</div>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table className="w-full">
            <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Fee</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Address</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWithdrawals.length > 0 ? filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm">{withdrawal.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{withdrawal.username || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">{withdrawal.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">{Number(withdrawal.amount ?? 0).toFixed(8)}</td>
                  <td className="px-6 py-4 font-mono text-sm">{Number(withdrawal.fee ?? 0).toFixed(8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs break-all max-w-[200px]">
                      {withdrawal.address || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      withdrawal.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                      withdrawal.status === 'approved' ? 'bg-blue-400/20 text-blue-400' :
                      withdrawal.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {withdrawal.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {withdrawal.created_at ? new Date(withdrawal.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(withdrawal.id)}
                          className="px-3 py-1 rounded-lg text-sm transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                            border: '1px solid rgba(34, 197, 94, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.2))';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))';
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(withdrawal.id)}
                          className="px-3 py-1 rounded-lg text-sm transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.2))';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))';
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No withdrawals found
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
              className="px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentPage === page 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : ''
                  }`}
                  style={{
                    background: currentPage === page ? '' : 'rgba(255, 255, 255, 0.05)',
                    border: currentPage === page ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {page}
                </button>
              );
            }).filter(Boolean)}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg disabled:opacity-50 transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
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