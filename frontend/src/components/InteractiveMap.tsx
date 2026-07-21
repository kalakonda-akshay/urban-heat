import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Download, Trash2, Edit3, Layers, Navigation, HelpCircle } from 'lucide-react';
import { toast } from './NotificationToast';

// Fix Leaflet Marker icon issues in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapControlsProps {
  onMapClick: (lat: number, lon: number) => void;
  isDrawing: boolean;
  onAddPoint: (lat: number, lon: number) => void;
}

// Subcomponent to catch Map events
const MapEvents: React.FC<MapControlsProps> = ({ onMapClick, isDrawing, onAddPoint }) => {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint(e.latlng.lat, e.latlng.lng);
      } else {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

// Subcomponent to trigger map flyTo
const MapFlyTo: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

// Subcomponent to trigger map invalidateSize
const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

interface InteractiveMapProps {
  gridData?: Array<{ lat: number; lon: number; lst: number; ndvi: number; ndbi: number; ndwi: number }>;
  predictions?: Array<{ id: number; heat_risk_score: number; heat_category: string; geometry: any }>;
  recommendations?: Array<{ id: number; mitigation_type: string; description: string; priority: string; geometry: any }>;
  onSelectCoordinate?: (coords: { lat: number; lon: number }) => void;
  onPolygonComplete?: (polygonCoords: number[][][]) => void;
  onLocationSearch?: (name: string, coords: { lat: number; lon: number }) => void;
  bhuvanMetadata?: {
    satellite: string;
    sensor: string;
    pass_timestamp: string;
    processing_level: string;
    data_source: string;
    origin: 'LIVE' | 'LOCAL_CACHE' | 'OFFLINE_MOCK';
    cache_warning?: string;
  } | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  gridData = [],
  predictions = [],
  recommendations = [],
  onSelectCoordinate,
  onPolygonComplete,
  onLocationSearch,
  bhuvanMetadata = null
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bangalore
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  
  // GIS Multi-Layer Manager States
  const [showLayersDropdown, setShowLayersDropdown] = useState<boolean>(false);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([
    'LST', 'Heat', 'Recommendations', 'Buildings', 'Roads', 'Water'
  ]);

  const toggleOverlay = (key: string) => {
    setActiveOverlays(prev => 
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  };

  // Digital Twin simulated vectors calculator
  const getSimulatedGISData = (lat: number, lon: number) => {
    const buildings = [
      [
        [lon - 0.005, lat - 0.005],
        [lon - 0.003, lat - 0.005],
        [lon - 0.003, lat - 0.003],
        [lon - 0.005, lat - 0.003],
        [lon - 0.005, lat - 0.005]
      ],
      [
        [lon + 0.004, lat + 0.004],
        [lon + 0.007, lat + 0.004],
        [lon + 0.007, lat + 0.006],
        [lon + 0.004, lat + 0.006],
        [lon + 0.004, lat + 0.004]
      ],
      [
        [lon - 0.008, lat + 0.002],
        [lon - 0.006, lat + 0.002],
        [lon - 0.006, lat + 0.005],
        [lon - 0.008, lat + 0.005],
        [lon - 0.008, lat + 0.002]
      ]
    ].map(poly => poly.map(pt => [pt[1], pt[0]] as [number, number]));

    const roads = [
      [
        [lat - 0.015, lon - 0.01],
        [lat + 0.015, lon + 0.01]
      ],
      [
        [lat + 0.01, lon - 0.015],
        [lat - 0.01, lon + 0.015]
      ]
    ].map(line => line.map(pt => [pt[0], pt[1]] as [number, number]));

    const waterBodies = [
      [
        [lon + 0.002, lat - 0.008],
        [lon + 0.006, lat - 0.008],
        [lon + 0.005, lat - 0.004],
        [lon + 0.001, lat - 0.004],
        [lon + 0.002, lat - 0.008]
      ]
    ].map(poly => poly.map(pt => [pt[1], pt[0]] as [number, number]));

    return { buildings, roads, waterBodies };
  };

  const gisData = getSimulatedGISData(
    selectedCoords?.lat || mapCenter[0],
    selectedCoords?.lon || mapCenter[1]
  );
  
  // Basemap layer state: 'osm' or 'satellite'
  const [basemap, setBasemap] = useState<'osm' | 'satellite'>('osm');
  
  // Custom Draw Tool state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  // OpenStreetMap Tile Layer
  const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Esri World Imagery Satellite Tile Layer
  const satelliteUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const satelliteAttrib = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

  // Geocoding city search handler
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        const newCoords: [number, number] = [parsedLat, parsedLon];
        setMapCenter(newCoords);
        setZoomLevel(13);
        setSelectedCoords({ lat: parsedLat, lon: parsedLon });
        
        if (onSelectCoordinate) {
          onSelectCoordinate({ lat: parsedLat, lon: parsedLon });
        }
        
        if (onLocationSearch) {
          onLocationSearch(display_name.split(',')[0], { lat: parsedLat, lon: parsedLon });
        }

        const count = parseInt(localStorage.getItem('activity_searches_count') || '0') + 1;
        localStorage.setItem('activity_searches_count', count.toString());
        
        toast.success(`Panning to: ${display_name.split(',')[0]}`);
      } else {
        toast.error('City not found. Please try another query.');
      }
    } catch (error) {
      toast.error('Search failed. Check connection.');
    }
  };

  // Click on map handler (places pin)
  const handleMapClick = (lat: number, lon: number) => {
    setSelectedCoords({ lat, lon });
    if (onSelectCoordinate) {
      onSelectCoordinate({ lat, lon });
    }
  };

  // Draw Point handler
  const handleAddDrawPoint = (lat: number, lon: number) => {
    setDrawnPoints(prev => [...prev, [lat, lon]]);
  };

  // Complete drawing
  const finishDrawing = () => {
    if (drawnPoints.length < 3) {
      toast.error('Draw at least 3 points to complete a polygon.');
      return;
    }
    // Connect back to first point to close polygon
    const closed = [...drawnPoints, drawnPoints[0]];
    const geoJsonCoords = closed.map(pt => [pt[1], pt[0]]); // Lon, Lat
    
    if (onPolygonComplete) {
      onPolygonComplete([geoJsonCoords]);
    }

    const draws = parseInt(localStorage.getItem('activity_draws_count') || '0') + 1;
    localStorage.setItem('activity_draws_count', draws.toString());
    
    toast.success('Drawn area successfully bounded.');
    setIsDrawing(false);
  };

  // Clear drawn area
  const clearDrawnArea = () => {
    setDrawnPoints([]);
    setIsDrawing(false);
    toast.info('Map drawings cleared.');
  };

  // Export Area as GeoJSON
  const exportDrawnArea = () => {
    if (drawnPoints.length < 3) {
      toast.error('No polygon active to export.');
      return;
    }
    
    // Close coordinates
    const closed = [...drawnPoints, drawnPoints[0]];
    // Map to [Lon, Lat] GeoJSON format
    const formatCoordinates = closed.map(pt => [pt[1], pt[0]]);

    const geoJson = {
      type: "Feature",
      properties: {
        name: "UrbanHeatAI Selected Zone",
        created_at: new Date().toISOString()
      },
      geometry: {
        type: "Polygon",
        coordinates: [formatCoordinates]
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJson, null, 2));
    const downloads = parseInt(localStorage.getItem('activity_downloads_count') || '0') + 1;
    localStorage.setItem('activity_downloads_count', downloads.toString());

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `urbanheat_zone_${Date.now()}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Drawn boundaries exported as GeoJSON.');
  };

  // LST Heatmap Color code (Full Thermal Gradient Motif)
  const getLstColor = (lst: number) => {
    if (lst > 40) return '#DC2626'; // Extreme Red
    if (lst > 35) return '#F97316'; // High Orange
    if (lst > 30) return '#EAB308'; // Medium Yellow
    if (lst > 25) return '#22C55E'; // Green
    if (lst > 20) return '#06B6D4'; // Cyan
    if (lst > 15) return '#2563EB'; // Blue
    return '#4C1D95'; // Deep Purple
  };

  // ML Risk Color code
  const getRiskColor = (score: number) => {
    if (score > 0.8) return '#DC2626';
    if (score > 0.65) return '#F97316';
    if (score > 0.45) return '#EAB308';
    if (score > 0.3) return '#22C55E';
    if (score > 0.15) return '#06B6D4';
    return '#2563EB';
  };

  return (
    <div className="relative w-full h-[550px] rounded-[4px] overflow-hidden border border-console-border shadow-none bg-console-bg">
      {/* Search Header & Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 pointer-events-none">
        <form onSubmit={handleCitySearch} className="flex-1 max-w-sm pointer-events-auto flex items-center bg-console-surface/95 border border-console-border rounded-[2px] px-3 py-1.5 backdrop-blur-md">
          <Search className="w-4 h-4 text-console-textSec mr-2" />
          <input
            type="text"
            placeholder="Search city (e.g. Bangalore, Mumbai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-console-text placeholder-console-textSec focus:outline-none"
          />
          <button type="submit" className="hidden" />
        </form>

        {/* GIS Controls Toolbar */}
        <div className="pointer-events-auto flex items-center gap-1 bg-console-surface/95 border border-console-border rounded-[2px] p-1 backdrop-blur-md relative">
          <button
            onClick={() => setShowLayersDropdown(!showLayersDropdown)}
            title="GIS Layer Manager"
            className={`p-1.5 rounded-[2px] transition-colors ${showLayersDropdown ? 'text-console-orange bg-console-bg' : 'text-console-textSec hover:text-console-text'}`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayersDropdown && (
            <div className="absolute right-0 top-10 w-48 bg-console-surface border border-console-border rounded-[2px] p-2.5 font-mono text-[9px] text-console-textSec shadow-none space-y-1.5 z-[2000] backdrop-blur-md">
              <span className="text-console-orange font-bold uppercase tracking-wider block border-b border-console-border pb-1 mb-1">
                GIS Layer Panel
              </span>
              
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <label className="flex items-center space-x-2 cursor-pointer hover:text-console-text transition-colors">
                  <input
                    type="checkbox"
                    checked={basemap === 'satellite'}
                    onChange={() => setBasemap(b => b === 'osm' ? 'satellite' : 'osm')}
                    className="accent-console-orange"
                  />
                  <span>Esri Satellite Base</span>
                </label>

                <hr className="border-console-border my-1"/>

                {[
                  'NDVI (Vegetation)', 
                  'NDBI (Built-up)', 
                  'NDWI (Water)', 
                  'LST (Surface Temp)', 
                  'Heat Risk', 
                  'Population Density', 
                  'Buildings', 
                  'Roads', 
                  'Water Bodies', 
                  'Future Heat Prediction', 
                  'Recommendations'
                ].map(layerName => {
                  const key = layerName.split(' ')[0];
                  return (
                    <label key={layerName} className="flex items-center space-x-2 cursor-pointer hover:text-console-text transition-colors">
                      <input
                        type="checkbox"
                        checked={activeOverlays.includes(key)}
                        onChange={() => toggleOverlay(key)}
                        className="accent-console-orange"
                      />
                      <span>{layerName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="h-4 w-[1px] bg-console-border mx-1"></div>

          {isDrawing ? (
            <button
              onClick={finishDrawing}
              title="Finish drawing area"
              className="px-2.5 py-1 rounded-[2px] bg-console-orange text-slate-100 text-[10px] font-mono uppercase tracking-wider font-semibold hover:bg-[#d55424] transition-colors"
            >
              Finish
            </button>
          ) : (
            <button
              onClick={() => {
                setIsDrawing(true);
                setDrawnPoints([]);
                toast.info('Click on map to draw containment polygon.');
              }}
              title="Draw search boundary"
              className="p-1.5 rounded-[2px] hover:bg-console-bg text-console-textSec hover:text-console-orange transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {drawnPoints.length > 0 && (
            <>
              <button
                onClick={exportDrawnArea}
                title="Export GeoJSON"
                className="p-1.5 rounded-[2px] hover:bg-console-bg text-console-textSec hover:text-console-low transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearDrawnArea}
                title="Clear draw"
                className="p-1.5 rounded-[2px] hover:bg-console-bg text-console-textSec hover:text-console-extreme transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Signature Element: Thermal Gradient Legend Fixed to Map Corner */}
      <div className="absolute top-16 right-4 z-[1000] bg-console-surface/95 border border-console-border rounded-[2px] p-2 text-[9px] font-mono backdrop-blur-md pointer-events-auto w-48 space-y-1">
        <div className="flex items-center justify-between text-console-textSec text-[8px] uppercase tracking-wider font-semibold">
          <span>LST SPECTRUM</span>
          <span>°C RADIANCE</span>
        </div>
        <div className="h-2 w-full bg-thermal-gradient rounded-[1px]"></div>
        <div className="flex justify-between text-[8px] text-console-textSec">
          <span>15°C</span>
          <span>25°C</span>
          <span>35°C</span>
          <span>45°C+</span>
        </div>
      </div>

      {/* Coordinate & Telemetry overlay footer */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1 bg-console-surface/95 border border-console-border rounded-[2px] p-3 text-[10px] font-mono backdrop-blur-md pointer-events-auto">
        <div className="flex items-center space-x-1.5 text-console-textSec">
          <Navigation className="w-3.5 h-3.5 text-console-orange animate-spin" style={{ animationDuration: '6s' }} />
          <span>SYS_GEOLOCATION</span>
        </div>
        {selectedCoords ? (
          <div className="mt-1 text-console-orange">
            LAT: {selectedCoords.lat.toFixed(5)} <br/>
            LON: {selectedCoords.lon.toFixed(5)}
          </div>
        ) : (
          <div className="mt-1 text-console-textSec">
            Double click map <br/>
            to select coordinates.
          </div>
        )}
      </div>

      {/* Data Provenance Panel */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1 w-60 bg-console-surface/95 border border-console-border rounded-[2px] p-3 text-[10px] font-mono backdrop-blur-md pointer-events-auto">
        <div className="flex items-center justify-between border-b border-console-border pb-1.5 mb-1.5 flex-shrink-0">
          <span className="text-console-textSec font-bold uppercase tracking-wider text-[8px]">Data Provenance</span>
          {bhuvanMetadata ? (
            <span className={`px-1.5 py-0.5 rounded-[2px] text-[7px] font-bold uppercase ${
              bhuvanMetadata.origin === 'LIVE' 
                ? 'bg-console-lowBg border border-console-lowBorder text-console-low' 
                : bhuvanMetadata.origin === 'LOCAL_CACHE' 
                  ? 'bg-console-mediumBg border border-console-mediumBorder text-console-medium' 
                  : 'bg-console-extremeBg border border-console-extremeBorder text-console-extreme'
            }`}>
              {bhuvanMetadata.origin}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-[2px] text-[7px] font-bold uppercase bg-console-bg text-console-textSec border border-console-border">
              PENDING LOCK
            </span>
          )}
        </div>

        {bhuvanMetadata ? (
          <div className="space-y-1 text-console-text">
            <div><span className="text-console-textSec uppercase text-[7px] block">Platform</span>{bhuvanMetadata.satellite}</div>
            <div><span className="text-console-textSec uppercase text-[7px] block">Sensor</span>{bhuvanMetadata.sensor}</div>
            <div><span className="text-console-textSec uppercase text-[7px] block">Pass Time</span>{new Date(bhuvanMetadata.pass_timestamp).toLocaleString()}</div>
            <div><span className="text-console-textSec uppercase text-[7px] block">Processing</span>{bhuvanMetadata.processing_level}</div>
            {bhuvanMetadata.cache_warning && (
              <div className="text-console-extreme text-[7px] mt-1 italic leading-tight">
                {bhuvanMetadata.cache_warning}
              </div>
            )}
          </div>
        ) : (
          <div className="text-console-textSec py-3 text-center">
            Pan or double click map to load telemetry provenance.
          </div>
        )}
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        zoomControl={false} // Disable to use custom layout if desired, let's keep it default or custom
        className="w-full h-full"
      >
        <TileLayer
          url={basemap === 'osm' ? osmUrl : satelliteUrl}
          attribution={basemap === 'osm' ? osmAttrib : satelliteAttrib}
        />

        {/* Dynamic map zoom controls inside map frame */}
        <MapEvents onMapClick={handleMapClick} isDrawing={isDrawing} onAddPoint={handleAddDrawPoint} />
        <MapFlyTo center={mapCenter} zoom={zoomLevel} />
        <MapResizer />

        {/* Selected Coordinates marker */}
        {selectedCoords && (
          <Marker position={[selectedCoords.lat, selectedCoords.lon]}>
            <Popup>
              <div className="text-xs p-1 font-mono">
                <span className="font-semibold text-space-accent">Target Coordinate Point</span>
                <hr className="my-1 border-slate-800"/>
                Lat: {selectedCoords.lat.toFixed(6)} <br/>
                Lon: {selectedCoords.lon.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Live Polygon Draw Line */}
        {drawnPoints.length > 0 && (
          <Polygon
            positions={drawnPoints}
            pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.15, weight: 3, dashArray: '5, 5' }}
          />
        )}

        {/* Dynamic Digital Twin Vector Overlays */}
        {activeOverlays.includes('Buildings') && gisData.buildings.map((poly, i) => (
          <Polygon key={`build-${i}`} positions={poly} pathOptions={{ color: '#475569', fillColor: '#475569', fillOpacity: 0.5, weight: 1 }} />
        ))}

        {activeOverlays.includes('Roads') && gisData.roads.map((line, i) => (
          <Polyline key={`road-${i}`} positions={line} pathOptions={{ color: '#f97316', weight: 3.5, opacity: 0.7 }} />
        ))}

        {activeOverlays.includes('Water') && gisData.waterBodies.map((poly, i) => (
          <Polygon key={`lake-${i}`} positions={poly} pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.6, weight: 1 }} />
        ))}

        {/* Dynamic Raster Index Overlays */}
        {activeOverlays.includes('NDVI') && gridData.map((pt, i) => (
          <Circle key={`ndvi-${i}`} center={[pt.lat, pt.lon]} radius={320} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.35, weight: 1 }} />
        ))}

        {activeOverlays.includes('NDBI') && gridData.map((pt, i) => (
          <Circle key={`ndbi-${i}`} center={[pt.lat, pt.lon]} radius={300} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.35, weight: 1 }} />
        ))}

        {activeOverlays.includes('NDWI') && gridData.map((pt, i) => (
          <Circle key={`ndwi-${i}`} center={[pt.lat, pt.lon]} radius={290} pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.35, weight: 1 }} />
        ))}

        {activeOverlays.includes('Population') && gridData.map((pt, i) => (
          <Circle key={`pop-${i}`} center={[pt.lat + 0.001, pt.lon - 0.001]} radius={450} pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.25, weight: 1 }} />
        ))}

        {/* Future Climate Predictions */}
        {activeOverlays.includes('Future') && gridData.map((pt, i) => (
          <Circle key={`future-${i}`} center={[pt.lat, pt.lon]} radius={280} pathOptions={{ color: getLstColor(pt.lst + 2.0), fillColor: getLstColor(pt.lst + 2.0), fillOpacity: 0.5, weight: 1 }} />
        ))}

        {/* 1. Render computed Raster Index heat points */}
        {activeOverlays.includes('LST') && gridData.map((pt, i) => (
          <Circle
            key={`grid-${i}`}
            center={[pt.lat, pt.lon]}
            radius={280}
            pathOptions={{
              color: getLstColor(pt.lst),
              fillColor: getLstColor(pt.lst),
              fillOpacity: 0.5,
              weight: 1
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-semibold text-slate-200">Satellite Sensor Cell</span>
                <hr className="my-1 border-slate-800"/>
                LST: <span className="font-semibold text-rose-400">{pt.lst.toFixed(1)}°C</span> <br/>
                NDVI: <span className="font-semibold text-emerald-400">{pt.ndvi.toFixed(2)}</span> <br/>
                NDBI: <span className="font-semibold text-amber-500">{pt.ndbi.toFixed(2)}</span> <br/>
                NDWI: <span className="font-semibold text-sky-400">{pt.ndwi.toFixed(2)}</span>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* 2. Render ML Predictions overlay */}
        {activeOverlays.includes('Heat') && predictions.map((p, i) => {
          if (!p.geometry || p.geometry.type !== 'Polygon') return null;
          const leafletCoords = p.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]]);
          
          return (
            <Polygon
              key={`pred-${i}`}
              positions={leafletCoords}
              pathOptions={{
                color: getRiskColor(p.heat_risk_score),
                fillColor: getRiskColor(p.heat_risk_score),
                fillOpacity: 0.25,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <span className="font-semibold text-slate-200">Zone Pred: {p.heat_category} Risk</span>
                  <hr className="my-1 border-slate-800"/>
                  Risk Score: <span className="font-semibold">{p.heat_risk_score.toFixed(2)}</span> <br/>
                  Assessment: <span className="font-semibold uppercase tracking-wider">{p.heat_category}</span>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 3. Render Mitigation Recommendations overlay */}
        {activeOverlays.includes('Recommendations') && recommendations.map((r, i) => {
          if (!r.geometry || r.geometry.type !== 'Polygon') return null;
          const leafletCoords = r.geometry.coordinates[0].map((coord: any) => [coord[1], coord[0]]);
          
          const mitigationColor = {
            'Tree Plantation': '#10b981',
            'Green Corridors': '#059669',
            'Cool Roofs': '#06b6d4',
            'Water Body Restoration': '#0284c7',
            'Open Spaces': '#f59e0b'
          }[r.mitigation_type] || '#8b5cf6';

          return (
            <Polygon
              key={`rec-${i}`}
              positions={leafletCoords}
              pathOptions={{
                color: mitigationColor,
                fillColor: mitigationColor,
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '3, 4'
              }}
            >
              <Popup>
                <div className="text-xs p-1 max-w-xs">
                  <span className="font-semibold text-space-accent uppercase tracking-wider text-[10px]">{r.mitigation_type} Recommendation</span>
                  <hr className="my-1 border-slate-800"/>
                  <span className="font-semibold text-slate-200">Priority: </span>
                  <span className={`font-semibold ${r.priority === 'Critical' ? 'text-rose-400' : 'text-amber-400'}`}>{r.priority}</span>
                  <p className="mt-1 text-slate-400 leading-normal">{r.description}</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};
