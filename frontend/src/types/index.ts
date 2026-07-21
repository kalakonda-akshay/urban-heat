export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
}

export interface SpatialZone {
  id: number;
  name: string;
  description: string | null;
  geometry: any; // GeoJSON
  created_at: string;
}

export interface RasterIndex {
  id: number;
  filename: string;
  ndvi_avg: number;
  ndbi_avg: number;
  ndwi_avg: number;
  lst_avg: number;
  grid_data: GridPoint[];
  geometry: any;
  processed_at: string;
}

export interface GridPoint {
  lat: number;
  lon: number;
  ndvi: number;
  ndbi: number;
  ndwi: number;
  lst: number;
}

export interface MLPrediction {
  id: number;
  zone_id: number | null;
  model_name: string;
  heat_risk_score: number;
  heat_category: 'Low' | 'Medium' | 'High' | 'Extreme';
  heat_vulnerability: number;
  geometry: any;
  created_at: string;
}

export interface MitigationRecommendation {
  id: number;
  prediction_id: number | null;
  zone_id: number | null;
  mitigation_type: 'Tree Plantation' | 'Green Corridors' | 'Cool Roofs' | 'Water Body Restoration' | 'Open Spaces';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  geometry: any;
  created_at: string;
}

export interface WardReportMetric {
  zone_id: number;
  zone_name: string;
  avg_lst: number;
  avg_ndvi: number;
  avg_ndbi: number;
  avg_ndwi: number;
  avg_heat_risk: number;
  vulnerability_index: number;
  dominant_category: string;
  recommended_actions: string[];
  geometry: any;
}
