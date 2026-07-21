import React, { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Satellite } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { isMock } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-11 w-full bg-console-surface border-b border-console-border flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-wider text-console-textSec">
      <div className="flex items-center space-x-4">
        {/* Toggle Drawer Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-[2px] border border-console-border text-console-textSec hover:text-console-text hover:border-console-orange focus:outline-none"
        >
          <Menu className="w-3.5 h-3.5" />
        </button>

        {/* Telemetry/Satellite Info */}
        <div className="hidden sm:flex items-center space-x-2">
          <Satellite className="w-3.5 h-3.5 text-console-orange" />
          <span>SYS_LOCK // SOURCE: ISRO_BHUVAN_WMS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Right Items */}
      <div className="flex items-center space-x-5">
        {/* UTC Time */}
        <div className="hidden md:block tracking-widest">
          {time}
        </div>

        {/* Divider */}
        <span className="hidden md:inline text-console-border">|</span>

        {/* Connection status */}
        <div className="flex items-center space-x-1.5">
          {isMock ? (
            <>
              <WifiOff className="w-3 h-3 text-console-orange" />
              <span className="text-console-orange font-semibold">STATE: OFFLINE_MOCK</span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">STATE: API_ONLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
