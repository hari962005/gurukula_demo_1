import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { User, UserRole } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { canAdminister, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'system'>('users');
  const [isLoading, setIsLoading] = useState(true);

  // New User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('teacher');
  const [newCanHealth, setNewCanHealth] = useState(false);
  const [userModalError, setUserModalError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Seed feedback
  const [seedStatus, setSeedStatus] = useState('');

  useEffect(() => {
    if (canAdminister) {
      loadAdminData();
    }
  }, [canAdminister]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [uRes, aRes, hRes]: any = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
        api.get('/admin/system-health'),
      ]);
      if (uRes?.success) setUsers(uRes.data || []);
      if (aRes?.success) setAuditLogs(aRes.data || []);
      if (hRes?.success) setHealthData(hRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res: any = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId || (u as any)._id === userId ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Status toggle failed.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');
    setIsCreatingUser(true);

    try {
      await api.post('/admin/users', {
        email: newEmail.trim(),
        password: newPassword,
        fullName: newFullName.trim(),
        phone: newPhone.trim() || undefined,
        role: newRole,
        canViewHealthRecords: newCanHealth,
      });
      setShowUserModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewPhone('');
      loadAdminData();
    } catch (err: any) {
      setUserModalError(err.message || 'User creation failed.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-seed database with fresh Gurukula demo data?')) return;
    setSeedStatus('Seeding database...');
    try {
      const res: any = await api.post('/admin/seed-demo');
      if (res?.success) {
        setSeedStatus('Database re-seeded successfully!');
        loadAdminData();
        setTimeout(() => setSeedStatus(''), 2500);
      }
    } catch (err: any) {
      setSeedStatus(`Seed failed: ${err.message}`);
    }
  };

  if (!canAdminister) {
    return (
      <div className="p-8 max-w-md mx-auto text-center bg-white rounded-2xl border border-red-200 mt-10 text-xs">
        <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="font-bold text-stone-900 text-sm">System Administration Restricted</h3>
        <p className="text-stone-600 mt-1">Requires System Administrator role.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D7]">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>System Administration & Audit Controls</span>
          </h2>
          <p className="text-stone-500 text-[11px]">
            Manage institutional user accounts, access permissions, system health, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReseed}
            className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
            title="Reload realistic demo records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => setShowUserModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Staff User</span>
          </button>
        </div>
      </div>

      {seedStatus && (
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
          {seedStatus}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EAE4D7] pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-t-xl font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-[#1B4332] border-t-2 border-[#1B4332] shadow-sm' : 'text-stone-600'
          }`}
        >
          Staff User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-t-xl font-bold transition-all ${
            activeTab === 'audit' ? 'bg-white text-[#1B4332] border-t-2 border-[#1B4332] shadow-sm' : 'text-stone-600'
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3 py-1.5 rounded-t-xl font-bold transition-all ${
            activeTab === 'system' ? 'bg-white text-[#1B4332] border-t-2 border-[#1B4332] shadow-sm' : 'text-stone-600'
          }`}
        >
          System Health
        </button>
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-[#EAE4D7] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#EAE4D7] text-stone-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Health Access</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u: any) => (
                <tr key={u._id || u.id} className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 font-bold text-stone-900">{u.fullName}</td>
                  <td className="py-2.5 px-3 text-stone-600 font-mono text-[11px]">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-600">
                    {u.canViewHealthRecords || ['admin', 'coordinator'].includes(u.role) ? '✓ Authorized' : '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u._id || u.id)}
                      className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-[10px] font-semibold text-stone-700"
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[#EAE4D7] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[11px]">
            <thead className="bg-[#FAF7F0] border-b border-[#EAE4D7] text-stone-700 font-bold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">Staff Email</th>
                <th className="py-2.5 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {auditLogs.map((log: any) => (
                <tr key={log._id} className="hover:bg-stone-50">
                  <td className="py-2 px-3 text-stone-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-900">{log.action}</td>
                  <td className="py-2 px-3 text-stone-700">{log.resourceType}</td>
                  <td className="py-2 px-3 text-stone-600">{log.userEmail || 'system'}</td>
                  <td className="py-2 px-3 text-stone-400">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: System Health */}
      {activeTab === 'system' && (
        <div className="p-5 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-sm">Gurukula Backend Health Diagnostic</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#FDFBF7] border border-stone-200">
              <span className="text-stone-400 text-[10px]">Server Status</span>
              <p className="font-bold text-emerald-700 text-sm">{healthData?.status?.toUpperCase() || 'ONLINE'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FDFBF7] border border-stone-200">
              <span className="text-stone-400 text-[10px]">Node Version</span>
              <p className="font-bold text-stone-900 text-sm">{healthData?.nodeVersion}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FDFBF7] border border-stone-200">
              <span className="text-stone-400 text-[10px]">Heap Memory Used</span>
              <p className="font-bold text-stone-900 text-sm">{healthData?.memoryUsageMB?.heapUsed} MB</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FDFBF7] border border-stone-200">
              <span className="text-stone-400 text-[10px]">Server Uptime</span>
              <p className="font-bold text-stone-900 text-sm">{Math.floor((healthData?.uptimeSeconds || 0) / 60)} mins</p>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
          <div className="bg-[#FDFBF7] rounded-2xl shadow-2xl border border-[#EAE4D7] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
              <h3 className="font-serif font-bold text-sm text-[#1B4332]">Create Gurukula Staff Account</h3>
              <button onClick={() => setShowUserModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {userModalError && (
              <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-200">
                {userModalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Acharya Rameshwar"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rameshwar@gurukula.org"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="teacher">Teacher / Mentor</option>
                    <option value="coordinator">Academic Coordinator</option>
                    <option value="admissions">Admissions Officer</option>
                    <option value="management">Management / Trustee</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 94480 12345"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700 pt-1">
                  <input
                    type="checkbox"
                    checked={newCanHealth}
                    onChange={(e) => setNewCanHealth(e.target.checked)}
                    className="rounded text-[#1B4332] focus:ring-[#1B4332]"
                  />
                  <span>Authorize viewing sensitive Health & Well-being records</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F]"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
