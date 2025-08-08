'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface CryptoItem {
  id: number;
  symbol: string;
  name: string;
  is_active: number;
  min_amount: number;
  max_amount: number;
  sort_order: number;
  logo_url?: string;
  created_at: string;
}

export default function AdminCryptocurrenciesPage() {
  const router = useRouter();
  const [items, setItems] = useState<CryptoItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CryptoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCryptocurrencies();
  }, []);

  const fetchCryptocurrencies = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      
      const response = await fetch('/api/admin/cryptocurrencies', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to fetch cryptocurrencies:', data.message);
        router.push('/');
        return;
      }
      
      setItems(data.data?.cryptocurrencies || []);
    } catch (e) {
      console.error('Error fetching cryptocurrencies:', e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [items, searchTerm, statusFilter, currentPage]);

  const filterData = () => {
    let filtered = [...items];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => statusFilter === 'active' ? c.is_active === 1 : c.is_active === 0);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredItems(filtered.slice(start, end));
  };

  const totalPages = Math.ceil(items.filter(c => {
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active' ? c.is_active === 1 : c.is_active === 0;
      if (!isActive) return false;
    }
    if (searchTerm && !(
      c.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  }).length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading cryptocurrencies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Cryptocurrency Management
            </h1>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-yellow-400/50 text-white"
              style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <option value="all" style={{ color: 'black' }}>All Status</option>
              <option value="active" style={{ color: 'black' }}>Active</option>
              <option value="inactive" style={{ color: 'black' }}>Inactive</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div className="text-sm text-yellow-400">Total Cryptocurrencies</div>
              <div className="text-2xl font-bold">{items.length}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div className="text-sm text-green-400">Active</div>
              <div className="text-2xl font-bold">{items.filter(c => c.is_active === 1).length}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="text-sm text-red-400">Inactive</div>
              <div className="text-2xl font-bold">{items.filter(c => c.is_active === 0).length}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="text-sm text-blue-400">Last Updated</div>
              <div className="text-lg font-medium">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <table className="w-full">
              <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Symbol</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Min Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Max Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.length > 0 ? filteredItems.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-400/10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-yellow-400 font-bold text-sm">{c.symbol?.slice(0,2)}</span>
                        </div>
                        <span className="font-mono font-medium">{c.symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{c.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono">{Number(c.min_amount ?? 0).toFixed(8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono">{Number(c.max_amount ?? 0).toFixed(8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        c.is_active === 1 ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {c.is_active === 1 ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      {items.length === 0 ? 'No cryptocurrencies found' : 'No cryptocurrencies match your search'}
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

