import React, { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Satellite, Globe, MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CityId, Language } from '../types';
import { CITIES_DATA } from '../data/cityData';
import { toast } from './NotificationToast';

interface NavbarProps {
  onToggleSidebar: () => void;
  selectedCity?: CityId;
  onSelectCity?: (city: CityId) => void;
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  selectedCity = 'bengaluru',
  onSelectCity,
  language = 'en',
  onSelectLanguage
}) => {
  const { isMock } = useAuth();
  const [time, setTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncText, setLastSyncText] = useState<string>('Synced 3h ago');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleForceSync = () => {
    setIsSyncing(true);
    toast.info('Initiating INSAT-3DR / Landsat-9 WMS telemetry handshake...');
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncText('Synced just now');
      toast.success('Satellite telemetry cache synchronized with Bhuvan NRSC servers.');
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-30 h-11 w-full bg-console-surface border-b border-console-border flex items-center justify-between px-4 sm:px-6 font-mono text-[10px] uppercase tracking-wider text-console-textSec">
      <div className="flex items-center space-x-3">
        {/* Toggle Drawer Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-[2px] border border-console-border text-console-textSec hover:text-console-text hover:border-console-orange focus:outline-none"
        >
          <Menu className="w-3.5 h-3.5" />
        </button>

        {/* Scalability City Switcher */}
        <div className="flex items-center space-x-1.5 bg-console-bg border border-console-border px-2 py-1 rounded-[2px]">
          <MapPin className="w-3 h-3 text-console-orange" />
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity && onSelectCity(e.target.value as CityId)}
            className="bg-transparent text-console-text focus:outline-none cursor-pointer font-bold text-[10px]"
          >
            {CITIES_DATA.map(c => (
              <option key={c.id} value={c.id} className="bg-console-surface text-console-text">
                {c.name.toUpperCase()} ({c.state})
              </option>
            ))}
          </select>
        </div>

        {/* Telemetry Satellite Sync Tracker */}
        <div className="hidden xl:flex items-center space-x-2 bg-console-bg border border-console-border px-2 py-1 rounded-[2px]">
          <Satellite className="w-3 h-3 text-console-orange" />
          <span>INSAT-3DR WMS // {lastSyncText}</span>
          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="ml-1 text-console-orange hover:text-slate-100 p-0.5 focus:outline-none"
            title="Force WMS Sync"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Right Items */}
      <div className="flex items-center space-x-4">
        {/* Multilingual Selector */}
        <div className="flex items-center space-x-1.5 bg-console-bg border border-console-border px-2 py-1 rounded-[2px]">
          <Globe className="w-3 h-3 text-console-orange" />
          <select
            value={language}
            onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value as Language)}
            className="bg-transparent text-console-text focus:outline-none cursor-pointer font-bold text-[10px]"
          >
            <option value="en" className="bg-console-surface text-console-text">ENGLISH (EN)</option>
            <option value="hi" className="bg-console-surface text-console-text">HINDI (हिन्दी)</option>
            <option value="kn" className="bg-console-surface text-console-text">KANNADA (ಕನ್ನಡ)</option>
            <option value="ta" className="bg-console-surface text-console-text">TAMIL (தமிழ்)</option>
            <option value="te" className="bg-console-surface text-console-text">TELUGU (తెలుగు)</option>
            <option value="bho" className="bg-console-surface text-console-text">BHOJPURI (भोजपुरी)</option>
          </select>
        </div>

        {/* UTC Time */}
        <div className="hidden md:block tracking-widest text-console-textSec">
          {time}
        </div>

        {/* Connection status */}
        <div className="hidden sm:flex items-center space-x-1.5">
          {isMock ? (
            <>
              <WifiOff className="w-3 h-3 text-console-orange" />
              <span className="text-console-orange font-semibold">STATE: CACHED_LOCK</span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 text-console-low" />
              <span className="text-console-low font-semibold">STATE: API_ONLINE</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
