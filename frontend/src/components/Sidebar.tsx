import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileBarChart, ShieldCheck, LogOut, Radio, Globe2, Compass, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { logout, user } = useAuth();

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-[240px] bg-console-surface border-r border-console-border flex flex-col justify-between font-sans`}>
      <div className="py-6 flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-8 px-5">
          <div className="relative flex-shrink-0">
            <Radio className="w-7 h-7 text-console-orange" />
            <Globe2 className="w-3.5 h-3.5 text-console-textSec absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-md font-display font-semibold tracking-tight text-console-text">
              URBANHEAT AI
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-console-textSec font-mono block">
              ISRO BAH Platform
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-3 pl-5 pr-4 py-3 text-[11px] font-mono uppercase tracking-wider transition-colors duration-150 ${
                isActive
                  ? 'text-console-text relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-thermal-gradient'
                  : 'text-console-textSec hover:text-console-text'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>GIS Dashboard</span>
          </NavLink>

          <NavLink
            to="/decision-support"
            className={({ isActive }) =>
              `flex items-center space-x-3 pl-5 pr-4 py-3 text-[11px] font-mono uppercase tracking-wider transition-colors duration-150 ${
                isActive
                  ? 'text-console-text relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-thermal-gradient'
                  : 'text-console-textSec hover:text-console-text'
              }`
            }
          >
            <Compass className="w-4 h-4 flex-shrink-0" />
            <span>Decision Support</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center space-x-3 pl-5 pr-4 py-3 text-[11px] font-mono uppercase tracking-wider transition-colors duration-150 ${
                isActive
                  ? 'text-console-text relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-thermal-gradient'
                  : 'text-console-textSec hover:text-console-text'
              }`
            }
          >
            <FileBarChart className="w-4 h-4 flex-shrink-0" />
            <span>Reports & Exports</span>
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `flex items-center space-x-3 pl-5 pr-4 py-3 text-[11px] font-mono uppercase tracking-wider transition-colors duration-150 ${
                isActive
                  ? 'text-console-text relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-thermal-gradient'
                  : 'text-console-textSec hover:text-console-text'
              }`
            }
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span>Alert Console</span>
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center space-x-3 pl-5 pr-4 py-3 text-[11px] font-mono uppercase tracking-wider transition-colors duration-150 ${
                  isActive
                    ? 'text-console-text relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-thermal-gradient'
                    : 'text-console-textSec hover:text-console-text'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Admin Config</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-console-border bg-console-bg/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-[2px] bg-console-bg border border-console-border flex items-center justify-center font-bold text-console-orange text-xs font-mono">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-console-text">{user?.full_name}</p>
            <p className="text-[9px] font-mono text-console-textSec uppercase tracking-wider">{user?.role} Mode</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-console-border hover:border-rose-900 hover:text-rose-400 text-console-textSec text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
};
