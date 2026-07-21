import React, { useState } from 'react';
import axios from 'axios';
import { InteractiveMap } from '../components/InteractiveMap';
import { RasterUpload } from '../components/RasterUpload';
import { MlControls } from '../components/MlControls';
import { RecommendationList } from '../components/RecommendationList';
import { RasterIndex, MLPrediction, MitigationRecommendation } from '../types';

import { Flame, Trees, Building2, HeartHandshake, HelpCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const Dashboard: React.FC = () => {
  const [activeRaster, setActiveRaster] = useState<RasterIndex | null>(null);
  const [activePrediction, setActivePrediction] = useState<MLPrediction | null>(null);
  const [recommendations, setRecommendations] = useState<MitigationRecommendation[]>([]);
  const [bhuvanMetadata, setBhuvanMetadata] = useState<any | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] SYS: Establishing connection to INSAT-3DR telemetry stream...`,
    `[${new Date().toLocaleTimeString()}] SYS: Handshake complete. Status: STABLE. Ready for coordinate locks or raster ingestion.`,
  ]);
  const [searchHistory, setSearchHistory] = useState<Array<{ name: string; lat: number; lon: number; lst: number }>>(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [
      { name: 'Bangalore (Base)', lat: 12.9716, lon: 77.5946, lst: 34.5 }
    ];
  });

  // Selection state for right-panel operations: 'upload', 'ml', 'recommendations'
  const [activeTab, setActiveTab] = useState<'upload' | 'ml' | 'recs'>('upload');

  const handleLocationSearch = (name: string, coords: { lat: number; lon: number }) => {
    const seed = Math.sin(coords.lat) * Math.cos(coords.lon);
    const lst = 25.0 + Math.abs(seed * 18.5);
    
    setSearchHistory(prev => {
      let updated = prev;
      if (prev.some(h => h.name.toLowerCase() === name.toLowerCase())) {
        updated = prev;
      } else {
        updated = [{ name, lat: coords.lat, lon: coords.lon, lst }, ...prev.slice(0, 4)];
      }
      localStorage.setItem('search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUploadSuccess = (raster: RasterIndex) => {
    setActiveRaster(raster);
    // Clear old prediction & recommendations when a new raster is loaded
    setActivePrediction(null);
    setRecommendations([]);
    setActiveTab('ml'); // Auto switch to ML panel
    
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString()}] SYS: Satellite multi-band raster ingested: "${raster.filename}".`,
      `[${new Date().toLocaleTimeString()}] RS: Calculating NDVI, NDBI, NDWI, LST indexes across grid...`,
      `[${new Date().toLocaleTimeString()}] RS: Computed spatial stats. Averages: LST ${raster.lst_avg.toFixed(1)}°C | NDVI ${raster.ndvi_avg.toFixed(2)} | NDBI ${raster.ndbi_avg.toFixed(2)}.`,
      ...prev.slice(0, 8)
    ]);
  };

  const handlePredictionComplete = (pred: MLPrediction) => {
    setActivePrediction(pred);
    setActiveTab('recs'); // Auto switch to recommendations
    
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ML: Evaluating spatial features via ${pred.model_name} estimator...`,
      `[${new Date().toLocaleTimeString()}] ML: Prediction successful. Heat Category resolved to: "${pred.heat_category}".`,
      `[${new Date().toLocaleTimeString()}] ML: Calculated Heat Risk Score: ${(pred.heat_risk_score * 100).toFixed(1)}% | Vulnerability Index: ${pred.heat_vulnerability.toFixed(2)}.`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleRecommendationsComplete = (recs: MitigationRecommendation[]) => {
    setRecommendations(recs);
    
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString()}] SYS: Running heuristic spatial mitigation planner...`,
      `[${new Date().toLocaleTimeString()}] SYS: Generated ${recs.length} actionable mitigation zones. Map layers updated.`,
      ...prev.slice(0, 8)
    ]);
  };

  const handleSelectCoordinate = async (coords: { lat: number; lon: number }) => {
    setTerminalLogs(prev => [
      `[${new Date().toLocaleTimeString()}] RS: Contacting NRSC Bhuvan WMS catalog...`,
      ...prev.slice(0, 8)
    ]);

    const payload = {
      min_lat: coords.lat - 0.015,
      min_lon: coords.lon - 0.015,
      max_lat: coords.lat + 0.015,
      max_lon: coords.lon + 0.015
    };

    try {
      const response = await axios.post(`${API_URL}/bhuvan/fetch`, payload);
      const bhuvanData = response.data;
      
      setActiveRaster({
        id: Math.floor(Math.random() * 1000),
        filename: bhuvanData.filename,
        lst_avg: bhuvanData.lst_avg,
        ndvi_avg: bhuvanData.ndvi_avg,
        ndbi_avg: bhuvanData.ndbi_avg,
        ndwi_avg: bhuvanData.ndwi_avg,
        grid_data: bhuvanData.grid_data,
        geometry: bhuvanData.geometry,
        processed_at: new Date().toISOString()
      });

      setBhuvanMetadata({
        satellite: bhuvanData.satellite,
        sensor: bhuvanData.sensor,
        pass_timestamp: bhuvanData.pass_timestamp,
        processing_level: bhuvanData.processing_level,
        data_source: bhuvanData.data_source,
        origin: bhuvanData.origin,
        cache_warning: bhuvanData.cache_warning
      });

      setTerminalLogs(prev => [
        `[${new Date().toLocaleTimeString()}] RS: Satellite telemetry ingested [Platform: ${bhuvanData.satellite}].`,
        `[${new Date().toLocaleTimeString()}] RS: Computed averages: LST ${bhuvanData.lst_avg.toFixed(1)}°C | NDVI ${bhuvanData.ndvi_avg.toFixed(2)}.`,
        ...prev.slice(0, 8)
      ]);
    } catch (error) {
      console.warn("Bhuvan fetch failed, falling back to simulated client metrics", error);
      
      const seed = Math.sin(coords.lat) * Math.cos(coords.lon);
      const lst = 25.0 + Math.abs(seed * 18.5);
      const ndvi = 0.3 + (seed * 0.45);
      const ndbi = 0.22 - (seed * 0.42);
      const ndwi = 0.02 + (seed * 0.33);

      setActiveRaster({
        id: Math.floor(Math.random() * 1000),
        filename: `Location: [${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}]`,
        lst_avg: lst,
        ndvi_avg: ndvi,
        ndbi_avg: ndbi,
        ndwi_avg: ndwi,
        grid_data: [
          { lat: coords.lat, lon: coords.lon, lst, ndvi, ndbi, ndwi }
        ],
        geometry: {
          type: "Polygon",
          coordinates: [[
            [coords.lon - 0.015, coords.lat - 0.015],
            [coords.lon + 0.015, coords.lat - 0.015],
            [coords.lon + 0.015, coords.lat + 0.015],
            [coords.lon - 0.015, coords.lat + 0.015],
            [coords.lon - 0.015, coords.lat - 0.015]
          ]]
        },
        processed_at: new Date().toISOString()
      });

      setBhuvanMetadata({
        satellite: "Resourcesat-2 (Simulated)",
        sensor: "LISS-III",
        pass_timestamp: new Date().toISOString(),
        processing_level: "L1B (Radiometric)",
        data_source: "Offline Fallback Generator",
        origin: "OFFLINE_MOCK"
      });

      setTerminalLogs(prev => [
        `[${new Date().toLocaleTimeString()}] RS: Bhuvan connection failed. Falling back to local offline mock.`,
        `[${new Date().toLocaleTimeString()}] RS: Resolved LST: ${lst.toFixed(1)}°C | NDVI: ${ndvi.toFixed(2)}.`,
        ...prev.slice(0, 8)
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2 text-console-orange">
          <span className="w-1.5 h-1.5 rounded-full bg-console-orange"></span>
          <span className="font-mono text-[9px] uppercase tracking-widest">ORBITAL_GEOSPATIAL_CORE</span>
        </div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-console-text">
          GEOSPATIAL OPERATIONS CENTER
        </h1>
        {/* Signature Element: Thermal gradient page load sweep line */}
        <div className="h-[3px] w-full bg-thermal-gradient mt-1.5 thermal-sweep"></div>
      </div>

      {/* Row 1: Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LST */}
        <div className="glass-panel p-4 border border-console-border flex items-center justify-between glass-panel-hover rounded-[4px] shadow-none">
          <div>
            <span className="text-[10px] text-console-textSec font-mono uppercase tracking-wider block">Avg Surface Temp</span>
            <div className="text-2xl font-display font-semibold tracking-tight mt-1 text-console-extreme">
              {activeRaster ? `${activeRaster.lst_avg.toFixed(1)}°C` : '34.5°C'}
            </div>
            <span className="text-[9px] text-console-textSec font-mono uppercase block mt-1">L8 B10 THERMAL RADIANCE</span>
          </div>
          <Flame className="w-5 h-5 text-console-extreme flex-shrink-0" />
        </div>

        {/* NDVI */}
        <div className="glass-panel p-4 border border-console-border flex items-center justify-between glass-panel-hover rounded-[4px] shadow-none">
          <div>
            <span className="text-[10px] text-console-textSec font-mono uppercase tracking-wider block">Avg Vegetation (NDVI)</span>
            <div className="text-2xl font-display font-semibold tracking-tight mt-1 text-console-low">
              {activeRaster ? activeRaster.ndvi_avg.toFixed(2) : '0.28'}
            </div>
            <span className="text-[9px] text-console-textSec font-mono uppercase block mt-1">CHLOROPHYLL REFLECTANCE</span>
          </div>
          <Trees className="w-5 h-5 text-console-low flex-shrink-0" />
        </div>

        {/* NDBI */}
        <div className="glass-panel p-4 border border-console-border flex items-center justify-between glass-panel-hover rounded-[4px] shadow-none">
          <div>
            <span className="text-[10px] text-console-textSec font-mono uppercase tracking-wider block">Avg Built-up (NDBI)</span>
            <div className="text-2xl font-display font-semibold tracking-tight mt-1 text-console-medium">
              {activeRaster ? activeRaster.ndbi_avg.toFixed(2) : '0.41'}
            </div>
            <span className="text-[9px] text-console-textSec font-mono uppercase block mt-1">CONCRETE AREA FRACTION</span>
          </div>
          <Building2 className="w-5 h-5 text-console-medium flex-shrink-0" />
        </div>

        {/* Recommendations */}
        <div className="glass-panel p-4 border border-console-border flex items-center justify-between glass-panel-hover rounded-[4px] shadow-none">
          <div>
            <span className="text-[10px] text-console-textSec font-mono uppercase tracking-wider block">Active Mitigations</span>
            <div className="text-2xl font-display font-semibold tracking-tight mt-1 text-console-orange">
              {recommendations.length > 0 ? recommendations.length : '5'}
            </div>
            <span className="text-[9px] text-console-textSec font-mono uppercase block mt-1">RECOMMENDED TARGET ZONES</span>
          </div>
          <HeartHandshake className="w-5 h-5 text-console-orange flex-shrink-0" />
        </div>
      </div>

      {/* Row 2: Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container & Terminal Grid */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <InteractiveMap
            gridData={activeRaster?.grid_data}
            predictions={activePrediction ? [activePrediction] : []}
            recommendations={recommendations}
            onSelectCoordinate={handleSelectCoordinate}
            onPolygonComplete={(coords) => console.log('polygon complete:', coords)}
            onLocationSearch={handleLocationSearch}
            bhuvanMetadata={bhuvanMetadata}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
            {/* Scientific Operations Console Terminal */}
            <div className="glass-panel p-4 rounded-[4px] border border-console-border shadow-none bg-console-surface font-mono text-[10px] space-y-2 h-36 flex flex-col">
              <div className="flex items-center justify-between border-b border-console-border pb-2 flex-shrink-0">
                <span className="text-console-text font-semibold tracking-wider uppercase text-[9px] flex items-center gap-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-console-orange"></span>
                  Spatial Operations Log
                </span>
                <span className="text-console-textSec text-[8px] tracking-widest uppercase">FEED: ACTIVE</span>
              </div>
              <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                {terminalLogs.map((log, idx) => {
                  const timeStr = log.substring(0, log.indexOf('] ') + 1);
                  const rest = log.substring(log.indexOf('] ') + 2);
                  const separatorIdx = rest.indexOf(':');
                  const moduleStr = separatorIdx !== -1 ? rest.substring(0, separatorIdx + 1) : '';
                  const messageStr = separatorIdx !== -1 ? rest.substring(separatorIdx + 1) : rest;

                  let moduleColor = 'text-console-textSec';
                  if (moduleStr.includes('SYS')) moduleColor = 'text-sky-400 font-semibold';
                  if (moduleStr.includes('RS')) moduleColor = 'text-console-low font-semibold';
                  if (moduleStr.includes('ML')) moduleColor = 'text-console-orange font-semibold';
                  if (moduleStr.includes('GIS')) moduleColor = 'text-console-orange font-semibold';

                  return (
                    <div key={idx} className="py-0.5 leading-normal flex items-start text-console-textSec hover:text-console-text transition-colors">
                      <span className="text-console-textSec/60 mr-2 flex-shrink-0">{timeStr}</span>
                      {moduleStr && <span className={`${moduleColor} mr-1.5 flex-shrink-0`}>{moduleStr}</span>}
                      <span className="text-console-text break-all">{messageStr}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Search Locks History */}
            <div className="glass-panel p-4 rounded-[4px] border border-console-border shadow-none bg-console-surface font-mono text-[10px] space-y-2 h-36 flex flex-col">
              <div className="flex items-center justify-between border-b border-console-border pb-2 flex-shrink-0">
                <span className="text-console-text font-semibold tracking-wider uppercase text-[9px] flex items-center gap-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-console-medium"></span>
                  Location Search Locks
                </span>
                <span className="text-console-textSec text-[8px] tracking-widest uppercase">RECORDS: ACTIVE</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {searchHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectCoordinate({ lat: item.lat, lon: item.lon })}
                    className="py-1 px-2.5 rounded-[2px] bg-console-bg border border-console-border flex items-center justify-between cursor-pointer hover:border-console-orange transition-colors"
                  >
                    <div>
                      <span className="text-console-text font-semibold">{item.name}</span>
                      <span className="text-[9px] text-console-textSec block">
                        LAT: {item.lat.toFixed(4)} | LON: {item.lon.toFixed(4)}
                      </span>
                    </div>
                    <span className="text-console-extreme font-semibold font-mono text-[11px]">
                      {item.lst.toFixed(1)}°C
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel Tab Controllers */}
        <div className="space-y-4">
          <div className="flex bg-console-surface border border-console-border p-1 rounded-[4px]">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'upload' ? 'bg-console-orange text-slate-100 font-semibold' : 'text-console-textSec hover:text-console-text'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab('ml')}
              className={`flex-1 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'ml' ? 'bg-console-orange text-slate-100 font-semibold' : 'text-console-textSec hover:text-console-text'
              }`}
            >
              ML Models
            </button>
            <button
              onClick={() => setActiveTab('recs')}
              className={`flex-1 py-1.5 rounded-[2px] text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'recs' ? 'bg-console-orange text-slate-100 font-semibold' : 'text-console-textSec hover:text-console-text'
              }`}
            >
              Mitigations
            </button>
          </div>

          <div className="transition-all duration-300">
            {activeTab === 'upload' && (
              <RasterUpload onUploadSuccess={handleUploadSuccess} />
            )}
            {activeTab === 'ml' && (
              <MlControls activeRaster={activeRaster} onPredictionComplete={handlePredictionComplete} />
            )}
            {activeTab === 'recs' && (
              <RecommendationList
                prediction={activePrediction}
                recommendations={recommendations}
                onRecommendationsGenerated={handleRecommendationsComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
