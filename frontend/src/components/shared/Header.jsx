import React, { useState } from 'react';
import { Menu, Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Header = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const roleColors = {
    student: 'from-blue-500 to-violet-600',
    teacher: 'from-emerald-500 to-cyan-600',
    admin: 'from-rose-500 to-orange-600',
  };
  const roleColor = roleColors[user?.role] || roleColors.student;

  return (
    <header
      className={clsx(
        'fixed top-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg',
        'border-b border-gray-100 dark:border-gray-800 z-20 flex items-center justify-between px-4 gap-4',
        'transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-[260px]'
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="btn-icon text-gray-500 dark:text-gray-400">
          <Menu size={20} />
        </button>

        {searchOpen ? (
          <div className="flex items-center gap-2 animate-slide-in-right">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, problems, jobs..."
              className="input py-1.5 w-64 text-sm"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="btn-icon">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="btn-icon text-gray-500 dark:text-gray-400 hidden sm:flex">
            <Search size={18} />
          </button>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="btn-icon text-gray-500 dark:text-gray-400 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
