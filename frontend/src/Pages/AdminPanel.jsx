// frontend/src/Pages/AdminPanel.jsx - Administrative Portal & Moderation
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function AdminPanel() {
  const { user, showToast } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsData, usersData, reportsData] = await Promise.all([
        api.getAdminAnalytics().catch(() => ({ metrics: {} })),
        api.getAllUsersAdmin().catch(() => ({ users: [] })),
        api.getReports().catch(() => ({ reports: [] }))
      ]);
      setMetrics(analyticsData.metrics || {});
      setUsers(usersData.users || []);
      setReports(reportsData.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateUserStatus(targetUser.id, { status: newStatus });
      showToast(`User ${targetUser.name} marked as ${newStatus}`, 'info');
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await api.resolveReport(reportId, { resolution_status: 'RESOLVED', action_notes: 'Reviewed by admin' });
      showToast('Report resolved', 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-navy-200">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-xs text-[#5C6F84] mt-2">You must be a platform administrator to view this portal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div>
        <h1 className="text-3xl font-extrabold text-[#0B1E36]">Platform Administration</h1>
        <p className="text-sm text-[#5C6F84]">Manage user safety, oversee reciprocal skill matches, and resolve moderation flags.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-navy-200 shadow-sm">
          <div className="text-xs font-bold text-[#5C6F84] uppercase tracking-wider">Registered Users</div>
          <div className="text-3xl font-black text-[#0B1E36] mt-2">{metrics?.totalUsers || users.length || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Active platform members</div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-navy-200 shadow-sm">
          <div className="text-xs font-bold text-[#5C6F84] uppercase tracking-wider">Active Swaps</div>
          <div className="text-3xl font-black text-[#0066EE] mt-2">{metrics?.activeExchanges || 0}</div>
          <div className="text-[11px] text-navy-400 font-semibold mt-1">In progress contracts</div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-navy-200 shadow-sm">
          <div className="text-xs font-bold text-[#5C6F84] uppercase tracking-wider">Completed Exchanges</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{metrics?.completedSwaps || 0}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Verified bilateral swaps</div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-navy-200 shadow-sm">
          <div className="text-xs font-bold text-[#5C6F84] uppercase tracking-wider">Pending Flags</div>
          <div className="text-3xl font-black text-amber-500 mt-2">{metrics?.pendingReports || reports.length || 0}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Safety reports queued</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-[#0B1E36]">User Directory & Access Control</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-navy-100 text-[#5C6F84] uppercase tracking-wider">
              <tr>
                <th className="pb-3 font-bold">User</th>
                <th className="pb-3 font-bold">Email</th>
                <th className="pb-3 font-bold">Role</th>
                <th className="pb-3 font-bold">Karma</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-cream-50/60">
                  <td className="py-3 font-bold text-[#0B1E36]">{u.name}</td>
                  <td className="py-3 text-[#5C6F84]">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-[#0066EE]'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-emerald-600">{u.karma_score || 100}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] ${u.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
