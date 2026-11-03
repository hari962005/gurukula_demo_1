import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api/client.js';
import { Settings, User, Lock, KeyRound, Check, AlertCircle } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, role } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setIsUpdating(true);
    try {
      const res: any = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res?.success) {
        setStatusMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Password update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl animate-fade-in text-xs">
      <div className="pb-3 border-b border-[#EAE4D7]">
        <h2 className="text-base sm:text-lg font-serif font-bold text-[#1B4332] flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" />
          <span>Staff Profile & Security Settings</span>
        </h2>
        <p className="text-stone-500 text-[11px]">
          Manage your personal account credentials, role permissions, and active session.
        </p>
      </div>

      {/* Account Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-3">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-[#1B4332]" />
          <span>Profile Summary</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FDFBF7] border border-stone-100">
          <div>
            <span className="text-stone-400 text-[10px]">Full Name</span>
            <p className="font-bold text-stone-900">{user?.fullName}</p>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Email Address</span>
            <p className="font-mono text-stone-800">{user?.email}</p>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Assigned Role</span>
            <p className="font-bold text-[#1B4332] uppercase">{role}</p>
          </div>
          <div>
            <span className="text-stone-400 text-[10px]">Health & Well-being Authorization</span>
            <p className="text-stone-800">
              {user?.canViewHealthRecords || ['admin', 'coordinator'].includes(role || '')
                ? '✓ Authorized'
                : '— Restricted'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE4D7] shadow-sm space-y-3">
        <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>Change Password</span>
        </h3>

        {statusMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-[#FDFBF7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-[#FDFBF7]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-[#1B4332] text-amber-300 font-bold hover:bg-[#2D6A4F] transition-all shadow-sm"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* PWA & Mobile Info */}
      <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#EAE4D7] space-y-2">
        <h4 className="font-bold text-stone-800">Mobile PWA & Android Installation</h4>
        <p className="text-stone-600 leading-relaxed text-[11px]">
          This application is designed as an Android-friendly responsive PWA with full touch targets and offline-first asset caching. You can install it on any mobile device via the browser menu ("Add to Home Screen"). For a native Android APK build, the codebase is architected for seamless packaging with Capacitor.
        </p>
      </div>
    </div>
  );
};
