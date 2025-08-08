'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface PaymentItem {
  id: number;
  user_id: number;
  username: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'referral_commission' | 'payment' | string;
  amount: number;
  currency: string;
  status: string;
  txid?: string;
  created_at: string;
  // Payment table specific fields
  checkout_url?: string;
  status_url?: string;
  qrcode_url?: string;
  address?: string;
  buyer_email?: string;
  buyer_name?: string;
  currency1?: string;
  currency2?: string;
  // Referral information
  referral_code?: string;
  referred_by?: string;
  referred_by_username?: string;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterData();
  }, [items, searchTerm, selectedType, selectedStatus, currentPage]);

  const filterData = () => {
    let filtered = [...items];
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.txid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.currency?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredItems(filtered.slice(start, end));
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      
      // Fetch from admin payments endpoint
      const response = await fetch('/api/admin/payments', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to fetch payments:', data.message);
        router.push('/');
        return;
      }
      
      setItems(data.data?.payments || []);
    } catch (e) {
      console.error('Error fetching payments:', e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(items.filter(p => {
    if (selectedType !== 'all' && p.type !== selectedType) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (searchTerm && !(
      p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.txid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.currency?.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  }).length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e12] flex items-center justify-center">
        <div className="text-white">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Payment Transactions
            </h1>
          </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by username, TXID or currency..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-green-400/50 transition-colors"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-green-400/50 text-white"
            style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <option value="all" style={{ color: 'black' }}>All Types</option>
            <option value="deposit" style={{ color: 'black' }}>Deposit</option>
            <option value="withdrawal" style={{ color: 'black' }}>Withdrawal</option>
            <option value="purchase" style={{ color: 'black' }}>Purchase</option>
            <option value="referral_commission" style={{ color: 'black' }}>Referral</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-green-400/50 text-white"
            style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <option value="all" style={{ color: 'black' }}>All Statuses</option>
            <option value="pending" style={{ color: 'black' }}>Pending</option>
            <option value="completed" style={{ color: 'black' }}>Completed</option>
            <option value="failed" style={{ color: 'black' }}>Failed</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div className="text-sm text-green-400">Total Volume</div>
            <div className="text-2xl font-bold">
              {items.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount ?? 0), 0).toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div className="text-sm text-blue-400">Deposits</div>
            <div className="text-2xl font-bold">{items.filter(p => p.type === 'deposit').length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <div className="text-sm text-yellow-400">Pending</div>
            <div className="text-2xl font-bold">{items.filter(p => p.status === 'pending').length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05))', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            <div className="text-sm text-purple-400">Referrals</div>
            <div className="text-2xl font-bold">{items.filter(p => p.type === 'referral_commission').length}</div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table className="w-full">
            <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Currency</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">TXID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length > 0 ? filteredItems.map((p) => (
                <tr key={`${p.id}-${p.type}`} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm">{p.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{p.username || `User #${p.user_id}`}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      p.type === 'deposit' ? 'bg-blue-400/20 text-blue-400' :
                      p.type === 'payment' ? 'bg-green-400/20 text-green-400' :
                      p.type === 'referral_commission' ? 'bg-purple-400/20 text-purple-400' :
                      'bg-gray-400/20 text-gray-400'
                    }`}>
                      {p.type === 'referral_commission' ? 'referral' : p.type || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{Number(p.amount ?? 0).toFixed(8)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-white/5 text-xs">
                      {p.currency || 'ABC'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'completed' ? 'bg-green-400/20 text-green-400' : 
                      p.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' : 
                      'bg-gray-400/20 text-gray-400'
                    }`}>
                      {p.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs break-all max-w-[150px]">
                      {p.txid || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1 rounded-lg text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Detail Modal */}
        {showDetailModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="w-full max-w-3xl mx-4 rounded-2xl p-6" style={{
              background: 'rgba(15,15,18,0.96)', 
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)'
            }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Payment Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-cyan-400 border-b border-cyan-400/20 pb-2">Basic Information</h4>
                  
                  <div>
                    <label className="text-sm text-gray-400">Payment ID</label>
                    <div className="text-white font-mono">{selectedPayment.id}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">User</label>
                    <div className="text-white">{selectedPayment.username || `User #${selectedPayment.user_id}`}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        selectedPayment.type === 'deposit' ? 'bg-blue-400/20 text-blue-400' :
                        selectedPayment.type === 'payment' ? 'bg-green-400/20 text-green-400' :
                        selectedPayment.type === 'referral_commission' ? 'bg-purple-400/20 text-purple-400' :
                        'bg-gray-400/20 text-gray-400'
                      }`}>
                        {selectedPayment.type === 'referral_commission' ? 'referral' : selectedPayment.type}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Amount</label>
                    <div className="text-white font-mono text-lg">{Number(selectedPayment.amount ?? 0).toFixed(8)} {selectedPayment.currency || 'ABC'}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedPayment.status === 'completed' ? 'bg-green-400/20 text-green-400' : 
                        selectedPayment.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' : 
                        'bg-gray-400/20 text-gray-400'
                      }`}>
                        {selectedPayment.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Created At</label>
                    <div className="text-white">{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-green-400 border-b border-green-400/20 pb-2">Payment Details</h4>
                  
                  {selectedPayment.txid && (
                    <div>
                      <label className="text-sm text-gray-400">Transaction ID</label>
                      <div className="text-white font-mono text-sm break-all bg-gray-800/50 p-2 rounded">{selectedPayment.txid}</div>
                    </div>
                  )}
                  
                  {selectedPayment.address && (
                    <div>
                      <label className="text-sm text-gray-400">Address</label>
                      <div className="text-white font-mono text-sm break-all bg-gray-800/50 p-2 rounded">{selectedPayment.address}</div>
                    </div>
                  )}
                  
                  {selectedPayment.currency2 && (
                    <div>
                      <label className="text-sm text-gray-400">Payment Currency</label>
                      <div className="text-white">{selectedPayment.currency2}</div>
                    </div>
                  )}
                  
                  {selectedPayment.buyer_email && (
                    <div>
                      <label className="text-sm text-gray-400">Buyer Email</label>
                      <div className="text-white">{selectedPayment.buyer_email}</div>
                    </div>
                  )}
                  
                  {selectedPayment.buyer_name && (
                    <div>
                      <label className="text-sm text-gray-400">Buyer Name</label>
                      <div className="text-white">{selectedPayment.buyer_name}</div>
                    </div>
                  )}
                </div>

                {/* Reference Information */}
                {(selectedPayment.referral_code || selectedPayment.referred_by) && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-orange-400 border-b border-orange-400/20 pb-2">Reference Information</h4>
                    
                    {selectedPayment.referral_code && (
                      <div>
                        <label className="text-sm text-gray-400">User's Referral Code</label>
                        <div className="text-white font-mono bg-gray-800/50 p-2 rounded">{selectedPayment.referral_code}</div>
                      </div>
                    )}
                    
                    {selectedPayment.referred_by && (
                      <div>
                        <label className="text-sm text-gray-400">Referred By</label>
                        <div className="text-white bg-gray-800/50 p-2 rounded">
                          <div className="font-mono text-orange-300">{selectedPayment.referred_by}</div>
                          {selectedPayment.referred_by_username && (
                            <div className="text-gray-300 text-sm mt-1">User: {selectedPayment.referred_by_username}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedPayment.type === 'referral_commission' && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-purple-300 text-sm font-medium">This is a referral commission payment</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* URLs Section */}
              {(selectedPayment.checkout_url || selectedPayment.status_url || selectedPayment.qrcode_url) && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-purple-400 border-b border-purple-400/20 pb-2 mb-4">Payment URLs</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedPayment.checkout_url && (
                      <div>
                        <label className="text-sm text-gray-400">Checkout URL</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            readOnly 
                            value={selectedPayment.checkout_url} 
                            className="flex-1 text-white font-mono text-sm bg-gray-800/50 p-2 rounded border-none" 
                          />
                          <button 
                            onClick={() => window.open(selectedPayment.checkout_url, '_blank')}
                            className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedPayment.status_url && (
                      <div>
                        <label className="text-sm text-gray-400">Status URL</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            readOnly 
                            value={selectedPayment.status_url} 
                            className="flex-1 text-white font-mono text-sm bg-gray-800/50 p-2 rounded border-none" 
                          />
                          <button 
                            onClick={() => window.open(selectedPayment.status_url, '_blank')}
                            className="px-3 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedPayment.qrcode_url && (
                      <div>
                        <label className="text-sm text-gray-400">QR Code URL</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            readOnly 
                            value={selectedPayment.qrcode_url} 
                            className="flex-1 text-white font-mono text-sm bg-gray-800/50 p-2 rounded border-none" 
                          />
                          <button 
                            onClick={() => window.open(selectedPayment.qrcode_url, '_blank')}
                            className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                          >
                            View QR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
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

