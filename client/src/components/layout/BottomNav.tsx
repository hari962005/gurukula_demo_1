import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, CheckSquare, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenQuickObservation: () => void;
  onOpenSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenQuickObservation, onOpenSidebar }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE4D7] px-3 py-1.5 flex items-center justify-around shadow-lg">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#1B4332] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`
        }
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/children"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#1B4332] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`
        }
      >
        <Users className="w-4 h-4 mb-0.5" />
        <span>Children</span>
      </NavLink>

      {/* Floating Center Action Button for Mobile Quick Observation */}
      <button
        onClick={onOpenQuickObservation}
        className="-mt-5 w-12 h-12 rounded-full bg-[#1B4332] text-amber-300 flex flex-col items-center justify-center shadow-lg active:scale-95 border-2 border-white focus:outline-none transition-transform"
        aria-label="Quick observation"
      >
        <Sparkles className="w-5 h-5 text-amber-400" />
      </button>

      <NavLink
        to="/followups"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
            isActive ? 'text-[#1B4332] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`
        }
      >
        <CheckSquare className="w-4 h-4 mb-0.5" />
        <span>Actions</span>
      </NavLink>

      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center py-1 px-2 text-[10px] font-medium text-stone-500 hover:text-stone-800"
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
