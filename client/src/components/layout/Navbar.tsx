import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { api } from '../../api/client.js';
import { Bell, User, LogOut, Menu, Sparkles, Shield, Check, X } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenQuickObservation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenQuickObservation }) => {
  const { user, role, switchDemoRole, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res: any = await api.get('/notifications');
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // ignore
    }
  };

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'System Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    admissions: { label: 'Admissions Officer', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    coordinator: { label: 'Gurukula Coordinator', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    teacher: { label: 'Teacher / Mentor', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    management: { label: 'Management / Trustee', color: 'bg-stone-100 text-stone-800 border-stone-200' },
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EAE4D7] px-4 py-2.5 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center shadow-sm">
              <span className="text-amber-400 font-bold text-xs">शुभ</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-[#1B4332] tracking-tight leading-tight">
                Maitreyi Gurukula
              </h1>
              <p className="hidden sm:block text-[11px] text-stone-500 font-medium">Child Journey Tracking System</p>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Observation Button (Desktop) */}
          <button
            onClick={onOpenQuickObservation}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1B4332] text-amber-300 hover:bg-[#2D6A4F] transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Quick Observe</span>
          </button>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 transition-all ${
                role ? roleLabels[role]?.color : 'bg-gray-100 text-gray-700'
              }`}
              title="Click to switch demo role view"
            >
              <Shield className="w-3 h-3" />
              <span className="hidden xs:inline">{role ? roleLabels[role]?.label : 'Role'}</span>
              <span className="text-[10px] opacity-60">▼</span>
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-stone-200 p-2 z-50 text-xs">
                <div className="px-2 py-1 text-[11px] font-semibold text-stone-500 border-b border-stone-100 mb-1">
                  Switch Demo Role:
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={async () => {
                      setShowRoleSwitcher(false);
                      await switchDemoRole(r);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      role === r ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    {role === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-white shadow-xl border border-stone-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                  <span className="font-semibold text-stone-800">Support Action Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-center py-4 text-stone-400 text-xs">No notifications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-2 rounded-lg border transition-colors ${
                          n.isRead ? 'bg-stone-50/50 border-stone-100 text-stone-600' : 'bg-amber-50/60 border-amber-100 text-stone-900'
                        }`}
                      >
                        <p className="font-semibold text-[11px] text-emerald-900">{n.title}</p>
                        <p className="text-[11px] mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-stone-200">
            <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-stone-500 hover:text-red-700 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
