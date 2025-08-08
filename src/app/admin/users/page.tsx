'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  referral_code: string;
  referred_by: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    username: '',
    email: '',
    role: 'user',
    referred_by: '',
    referral_code: '',
    balanceValue: '',
    balanceMode: 'set' as 'set' | 'add' | 'subtract',
    saving: false,
    error: '' as string | null,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchUsers();
  }, []);

  useEffect(() => {
    filterData();
  }, [users, selectedRole, searchTerm, currentPage]);

  const filterData = () => {
    let filtered = [...users];
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredUsers(filtered.slice(start, end));
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const tokenOrRedirect = (): string | null => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/');
      return null;
    }
    return token;
  };

  const checkAuthAndFetchUsers = async () => {
    try {
      const token = tokenOrRedirect();
      if (!token) return;

      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (!data.success) {
        router.push('/');
        return;
      }
      setUsers(data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
      referred_by: user.referred_by || '',
      referral_code: user.referral_code || '',
      balanceValue: '',
      balanceMode: 'set',
      saving: false,
      error: null,
    });
    setShowModal(true);
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    const token = tokenOrRedirect();
    if (!token) return;
    try {
      setForm((f) => ({ ...f, saving: true, error: null }));
      const body: any = {
        username: form.username,
        email: form.email,
        role: form.role,
        referred_by: form.referred_by,
        referral_code: form.referral_code,
      };

      if (form.balanceValue !== '') {
        const val = parseFloat(form.balanceValue);
        if (!isNaN(val)) {
          if (form.balanceMode === 'set') {
            body.balance = val;
            body.adjustBalance = false;
          } else {
            body.balance = form.balanceMode === 'add' ? val : -val;
            body.adjustBalance = true;
          }
        }
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        setForm((f) => ({ ...f, saving: false, error: data.message || 'Save failed' }));
        return;
      }

      // update list
      setUsers((list) => list.map((u) => (u.id === selectedUser.id ? { ...u, ...data.data } : u)));
      setShowModal(false);
    } catch (e: any) {
      setForm((f) => ({ ...f, saving: false, error: 'Unexpected error' }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e12] flex items-center justify-center">
        <div className="text-white">Loading admin panel...</div>
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
              Users Management
            </h1>
          </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by username, email or referral code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-blue-400/50 transition-colors"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-blue-400/50 transition-colors text-white"
            style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <option value="all" style={{ color: 'black' }}>All Roles</option>
            <option value="user" style={{ color: 'black' }}>Users</option>
            <option value="admin" style={{ color: 'black' }}>Admins</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div className="text-sm text-blue-400">Total Users</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div className="text-sm text-green-400">Regular Users</div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div className="text-sm text-red-400">Admins</div>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05))', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            <div className="text-sm text-purple-400">With Referrals</div>
            <div className="text-2xl font-bold">{users.filter(u => u.referred_by).length}</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table className="w-full">
            <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Balance (ABC)</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referral Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referred By</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm">{user.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono">{Number(user.balance ?? 0).toFixed(8)}</td>
                  <td className="px-6 py-4 font-mono text-sm">{user.referral_code}</td>
                  <td className="px-6 py-4 font-mono text-sm">{user.referred_by || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-400/20 text-red-400' : 'bg-blue-400/20 text-blue-400'
                    }`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEdit(user)}
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
                      Edit
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No users found
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

        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="w-full max-w-2xl mx-4 rounded-2xl p-6"
                 style={{ background: 'rgba(15,15,18,0.96)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xl font-bold mb-4">Edit User</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-sm text-white/70">Username</span>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
                    placeholder="username"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-white/70">Email</span>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
                    placeholder="email@example.com"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-white/70">Role</span>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 text-white"
                      style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <option value="user" style={{ color: 'black' }}>user</option>
                      <option value="admin" style={{ color: 'black' }}>admin</option>
                    </select>
                </label>
                <label className="space-y-1">
                  <span className="text-sm text-white/70">Referred By</span>
                  <input
                    value={form.referred_by}
                    onChange={(e) => setForm({ ...form, referred_by: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
                    placeholder="referral code"
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-white/70">Referral Code</span>
                  <input
                    value={form.referral_code}
                    onChange={(e) => setForm({ ...form, referral_code: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
                    placeholder="REF12345"
                  />
                </label>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm text-white/70">Balance ({Number(selectedUser.balance ?? 0).toFixed(8)} ABC)</span>
                    <input
                      value={form.balanceValue}
                      onChange={(e) => setForm({ ...form, balanceValue: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30"
                      placeholder="Amount"
                      inputMode="decimal"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-white/70">Mode</span>
                    <select
                      value={form.balanceMode}
                      onChange={(e) => setForm({ ...form, balanceMode: e.target.value as any })}
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 text-white"
                      style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <option value="set" style={{ color: 'black' }}>Set</option>
                      <option value="add" style={{ color: 'black' }}>Add</option>
                      <option value="subtract" style={{ color: 'black' }}>Subtract</option>
                    </select>
                  </label>
                </div>
              </div>

              {form.error && (
                <div className="mt-3 text-sm text-red-400">{form.error}</div>
              )}

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveUser}
                  disabled={form.saving}
                  className="px-4 py-2 rounded disabled:opacity-60"
                  style={{ background: 'rgba(0,200,120,0.25)', border: '1px solid rgba(0,200,120,0.35)' }}
                >
                  {form.saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
