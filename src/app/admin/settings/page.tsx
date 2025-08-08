'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface SettingItem {
  key: string;
  value: string;
  updated_at: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [items, setItems] = useState<SettingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }
        const response = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          router.push('/');
          return;
        }
        
        // Handle the settings data from admin API
        const settingsData = data.data?.settings || {};
        const entries = Object.entries(settingsData).map(([key, value]) => ({
          key,
          value: typeof value === 'string' ? value : String(value),
          updated_at: new Date().toISOString(),
        }));
        setItems(entries);
      } catch (e) {
        console.error(e);
        // Don't redirect on error, just show empty state
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    filterData();
  }, [items, searchTerm, currentPage]);

  const filterData = () => {
    let filtered = [...items];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.value?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredItems(filtered.slice(start, end));
  };

  const totalPages = Math.ceil(items.filter(s => {
    if (searchTerm && !(
      s.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.value?.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;
    return true;
  }).length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e12] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              System Settings
            </h1>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search settings by key or value..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full max-w-md px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-orange-400/50 transition-colors"
            />
          </div>

          {/* Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.05))', border: '1px solid rgba(251, 146, 60, 0.2)' }}>
              <div className="text-sm text-orange-400">Configuration Items</div>
              <div className="text-2xl font-bold">{items.length}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="text-sm text-red-400">Last Updated</div>
              <div className="text-lg font-medium">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div className="text-sm text-green-400">Status</div>
              <div className="text-lg font-medium">Active</div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <table className="w-full">
              <thead style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Setting Key</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Value</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.length > 0 ? filteredItems.map((s) => (
                  <tr key={s.key} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm">{s.key}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="break-all max-w-md">
                        <span className="px-2 py-1 rounded bg-white/5 text-sm font-mono">
                          {s.value}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs" style={{
                        background: 'rgba(251, 146, 60, 0.15)',
                        color: 'rgba(251, 146, 60, 1)'
                      }}>
                        {typeof s.value === 'string' && s.value.startsWith('{') ? 'JSON' : 'String'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                      {items.length === 0 ? 'No settings found' : 'No settings match your search'}
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

