import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  Sparkles,
  Compass,
  Trophy,
  Heart,
  Eye,
  CheckSquare,
  Home,
  Files,
  Milestone,
  FileBarChart2,
  BookOpen,
  Settings,
  ShieldAlert,
  X,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, canViewHealth, canManageAdmissions, canAdminister } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { label: 'Admissions', path: '/admissions', icon: UserPlus, highlight: canManageAdmissions },
    { label: 'Children Directory', path: '/children', icon: Users },
    { label: 'Academic Progress', path: '/academic', icon: BookOpen },
    { label: 'Growth & Skills', path: '/skills', icon: Sparkles },
    { label: 'Responsibilities', path: '/responsibilities', icon: Compass },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    {
      label: 'Health & Well-being',
      path: '/health',
      icon: Heart,
      restricted: !canViewHealth,
    },
    { label: 'Quick Observations', path: '/observations', icon: Eye },
    { label: 'Follow-ups & Actions', path: '/followups', icon: CheckSquare },
    { label: 'Family & Seva', path: '/family', icon: Home },
    { label: 'Document Vault', path: '/documents', icon: Files },
    { label: 'Journey Timeline', path: '/timeline', icon: Milestone, badge: 'Signature' },
    { label: 'Reports & Exports', path: '/reports', icon: FileBarChart2 },
    { label: 'Alumni Engagement', path: '/alumni', icon: GraduationCap },
    ...(canAdminister ? [{ label: 'Administration', path: '/admin', icon: ShieldAlert }] : []),
    { label: 'Profile & Settings', path: '/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#FAF7F0] border-r border-[#EAE4D7] text-[#1F2937]">
      {/* Gurukula Identity Header */}
      <div className="p-4 border-b border-[#EAE4D7] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1B4332] text-amber-300 flex items-center justify-center font-serif font-bold text-sm shadow-md">
            ॐ
          </div>
          <div>
            <div className="font-serif font-bold text-sm tracking-wide text-[#1B4332]">
              SHUBHAM KAROTI
            </div>
            <div className="text-[11px] text-[#B45309] font-medium tracking-tight">
              Maitreyi Gurukula
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-200"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all group ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-sm font-semibold'
                    : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-900 border border-amber-300">
                  {item.badge}
                </span>
              )}

              {item.restricted && (
                <Lock className="w-3 h-3 text-stone-400 group-hover:text-stone-600" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Current User Summary Footer */}
      <div className="p-3 border-t border-[#EAE4D7] bg-[#F4EFE6]/60 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1B4332] text-amber-300 font-bold flex items-center justify-center text-xs">
            {user?.fullName?.charAt(0) || 'G'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-stone-800 truncate leading-tight">{user?.fullName}</p>
            <p className="text-[11px] text-stone-500 truncate capitalize">{role} Account</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#FAF7F0] shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
