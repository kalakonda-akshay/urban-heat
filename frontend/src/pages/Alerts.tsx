import React, { useState } from 'react';
import { Bell, ShieldAlert, AlertTriangle, Info, CheckCircle2, Filter, Search } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  zone: string;
  timestamp: string;
  temp: number;
  severityScore: number; // 0.0 to 1.0 (Gradient sorting)
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'DISPATCHED';
  details: string;
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'ALT-9042',
    title: 'Extreme Radiance Anomaly Lock',
    zone: 'Ward C - Whitefield Industrial Sector 4',
    timestamp: '2026-07-20 15:42:10 UTC',
    temp: 42.8,
    severityScore: 0.96,
    status: 'UNRESOLVED',
    details: 'Thermal infrared band detects land surface temp exceeding 42.8°C with 0.04 NDVI vegetation index. Vulnerable facility within 300m.'
  },
  {
    id: 'ALT-9039',
    title: 'High Heat Accumulation Warning',
    zone: 'Ward A - Koramangala Commercial Hub',
    timestamp: '2026-07-20 14:15:02 UTC',
    temp: 38.4,
    severityScore: 0.81,
    status: 'INVESTIGATING',
    details: 'Concrete fraction heat capacity causing persistent night-time temperature retention (+4.2°C above rural baseline).'
  },
  {
    id: 'ALT-9031',
    title: 'Sub-Urban Canopy Loss Alert',
    zone: 'Ward D - Indiranagar Residential Sub-Zone',
    timestamp: '2026-07-20 11:20:45 UTC',
    temp: 34.2,
    severityScore: 0.62,
    status: 'INVESTIGATING',
    details: 'NDVI vegetation drop detected across street trees along 12th Main Road (-14% chlorophyll index vs 2025 baseline).'
  },
  {
    id: 'ALT-9022',
    title: 'Moderate Urban Heat Island Trend',
    zone: 'Ward E - Ulsoor Lake Buffer Fringe',
    timestamp: '2026-07-20 09:05:12 UTC',
    temp: 31.0,
    severityScore: 0.44,
    status: 'DISPATCHED',
    details: 'Water body surface cooling dampening local LST buildup. Buffer zone restoration advisory dispatched to municipality.'
  },
  {
    id: 'ALT-9010',
    title: 'Low Thermal Risk Metric Lock',
    zone: 'Ward B - Cubbon Park Protected Reserve',
    timestamp: '2026-07-20 06:00:00 UTC',
    temp: 26.5,
    severityScore: 0.18,
    status: 'DISPATCHED',
    details: 'Dense tree canopy coverage maintaining low LST radiance (26.5°C). System lock nominal.'
  }
];

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [filterText, setFilterText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Severity color gradient helper based on continuous 0.0 - 1.0 score
  const getSeverityStyle = (score: number) => {
    if (score > 0.85) return { bg: 'bg-console-extremeBg', border: 'border-console-extremeBorder', text: 'text-console-extreme', dot: 'bg-console-extreme', label: 'EXTREME ANOMALY' };
    if (score > 0.70) return { bg: 'bg-console-highBg', border: 'border-console-highBorder', text: 'text-console-high', dot: 'bg-console-high', label: 'HIGH RISK' };
    if (score > 0.50) return { bg: 'bg-console-mediumBg', border: 'border-console-mediumBorder', text: 'text-console-medium', dot: 'bg-console-medium', label: 'ELEVATED HEAT' };
    if (score > 0.30) return { bg: 'bg-console-lowBg', border: 'border-console-lowBorder', text: 'text-console-low', dot: 'bg-console-low', label: 'MODERATE SHIFT' };
    return { bg: 'bg-console-bg', border: 'border-console-border', text: 'text-sky-400', dot: 'bg-sky-400', label: 'NOMINAL LOCK' };
  };

  const filteredAlerts = alerts
    .filter(a => statusFilter === 'ALL' || a.status === statusFilter)
    .filter(a => a.title.toLowerCase().includes(filterText.toLowerCase()) || a.zone.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => b.severityScore - a.severityScore); // Severity sorted

  const markResolved = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'DISPATCHED' } : a));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-console-extreme">
            <span className="w-1.5 h-1.5 rounded-full bg-console-extreme animate-pulse"></span>
            <span className="font-mono text-[9px] uppercase tracking-widest">LIVE_THERMAL_ALERT_DISPATCH</span>
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-console-text">
            THERMAL ALERT CONSOLE
          </h1>
          <p className="text-xs text-console-textSec font-mono mt-1">
            SEVERITY-SORTED GRADIENT SPECTRUM // ACTIVE LOCKS: {filteredAlerts.length}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 bg-console-surface border border-console-border p-1.5 rounded-[4px]">
          <div className="flex items-center space-x-2 px-2 bg-console-bg border border-console-border rounded-[2px]">
            <Search className="w-3.5 h-3.5 text-console-textSec" />
            <input
              type="text"
              placeholder="Search alert locks..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-transparent text-xs text-console-text placeholder-console-textSec focus:outline-none py-1 w-36 font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 font-mono text-[10px]">
            {['ALL', 'UNRESOLVED', 'INVESTIGATING', 'DISPATCHED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-[2px] transition-colors ${
                  statusFilter === st ? 'bg-console-orange text-slate-100 font-bold' : 'text-console-textSec hover:text-console-text'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Severity Ramp Bar Legend */}
      <div className="glass-panel p-4 rounded-[4px] border border-console-border shadow-none space-y-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-console-textSec">
          <span>SEVERITY GRADIENT RAMP (CONTINUOUS SPECTRUM SORTING)</span>
          <span>SCORE: 0.00 ➔ 1.00</span>
        </div>
        <div className="h-2.5 w-full bg-thermal-gradient rounded-[1px]"></div>
        <div className="flex justify-between text-[9px] font-mono text-console-textSec">
          <span className="text-sky-400">NOMINAL (&lt;0.3)</span>
          <span className="text-console-low">MODERATE (0.3 - 0.5)</span>
          <span className="text-console-medium">ELEVATED (0.5 - 0.7)</span>
          <span className="text-console-high">HIGH RISK (0.7 - 0.85)</span>
          <span className="text-console-extreme font-bold">EXTREME ANOMALY (&gt;0.85)</span>
        </div>
      </div>

      {/* Severity Sorted Alert Listings */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const style = getSeverityStyle(alert.severityScore);
          return (
            <div
              key={alert.id}
              className={`glass-panel p-5 rounded-[4px] border ${style.border} shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-console-orange`}
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  {/* Severity Badge */}
                  <span className={`px-2.5 py-0.5 rounded-[2px] border text-[9px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 ${style.bg} ${style.border} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                    <span>{style.label} ({(alert.severityScore * 100).toFixed(0)}%)</span>
                  </span>

                  <span className="text-xs font-mono font-bold text-console-orange">{alert.id}</span>
                  <span className="text-[10px] font-mono text-console-textSec">| {alert.timestamp}</span>
                </div>

                <h3 className="text-sm font-display font-semibold text-console-text">
                  {alert.title} — <span className="text-console-textSec font-normal">{alert.zone}</span>
                </h3>

                <p className="text-xs text-console-textSec font-sans leading-normal">
                  {alert.details}
                </p>
              </div>

              {/* Action buttons & temp display */}
              <div className="flex items-center space-x-4 flex-shrink-0 border-t md:border-t-0 border-console-border pt-3 md:pt-0">
                <div className="text-right font-mono">
                  <span className="text-[9px] text-console-textSec uppercase block">LST Radiance</span>
                  <span className={`text-xl font-bold ${style.text}`}>{alert.temp}°C</span>
                </div>

                {alert.status !== 'DISPATCHED' ? (
                  <button
                    onClick={() => markResolved(alert.id)}
                    className="px-3 py-1.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    DISPATCH ADVISORY
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-[2px] bg-console-bg border border-console-border text-console-low font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DISPATCHED</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
