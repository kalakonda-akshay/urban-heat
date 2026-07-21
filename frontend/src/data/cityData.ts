import { CityConfig } from '../types';

export const CITIES_DATA: CityConfig[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lon: 77.5946,
    zoom: 12,
    baselineTemp: 27.5,
    population: '13.6 Million',
    wards: [
      {
        zone_id: 1,
        zone_name: 'Ward A - Koramangala Commercial Core',
        avg_lst: 38.4,
        avg_ndvi: 0.12,
        avg_ndbi: 0.74,
        avg_ndwi: 0.05,
        avg_heat_risk: 0.81,
        vulnerability_index: 0.68,
        dominant_category: 'High',
        recommended_actions: ['Cool Roofs', 'Green Corridors'],
        vulnerability: {
          elderlyDensityPct: 18.5,
          informalSettlementPct: 24.0,
          canopyDeficitPct: 62.0,
          sviScore: 0.68,
          realWorldRiskScore: 41.2
        },
        anomaly: {
          isAnomaly: false,
          expectedLst: 37.1,
          deltaSpike: 1.3,
          possibleCause: 'High urban concrete absorption'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[77.61, 12.92], [77.64, 12.92], [77.64, 12.95], [77.61, 12.95], [77.61, 12.92]]]
        }
      },
      {
        zone_id: 2,
        zone_name: 'Ward B - Cubbon Park Protected Zone',
        avg_lst: 26.5,
        avg_ndvi: 0.78,
        avg_ndbi: 0.11,
        avg_ndwi: 0.22,
        avg_heat_risk: 0.18,
        vulnerability_index: 0.15,
        dominant_category: 'Low',
        recommended_actions: ['Tree Plantation Maintenance'],
        vulnerability: {
          elderlyDensityPct: 8.2,
          informalSettlementPct: 2.0,
          canopyDeficitPct: 5.0,
          sviScore: 0.15,
          realWorldRiskScore: 23.1
        },
        anomaly: {
          isAnomaly: false,
          expectedLst: 26.2,
          deltaSpike: 0.3,
          possibleCause: 'Nominal canopy cooling'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[77.58, 12.97], [77.60, 12.97], [77.60, 12.98], [77.58, 12.98], [77.58, 12.97]]]
        }
      },
      {
        zone_id: 3,
        zone_name: 'Ward C - Whitefield Industrial Sector 4',
        avg_lst: 42.8,
        avg_ndvi: 0.04,
        avg_ndbi: 0.88,
        avg_ndwi: 0.02,
        avg_heat_risk: 0.96,
        vulnerability_index: 0.89,
        dominant_category: 'Extreme',
        recommended_actions: ['Tree Plantation', 'Cool Roofs', 'Water Body Restoration'],
        vulnerability: {
          elderlyDensityPct: 22.4,
          informalSettlementPct: 41.5,
          canopyDeficitPct: 84.0,
          sviScore: 0.89,
          realWorldRiskScore: 47.9
        },
        anomaly: {
          isAnomaly: true,
          expectedLst: 38.5,
          deltaSpike: 4.3,
          possibleCause: 'Unexplained industrial heat discharge & illegal canopy removal'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[77.72, 12.96], [77.76, 12.96], [77.76, 12.99], [77.72, 12.99], [77.72, 12.96]]]
        }
      }
    ]
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lon: 80.2707,
    zoom: 12,
    baselineTemp: 31.0,
    population: '11.5 Million',
    wards: [
      {
        zone_id: 101,
        zone_name: 'Zone 9 - T. Nagar Commercial Corridor',
        avg_lst: 41.2,
        avg_ndvi: 0.08,
        avg_ndbi: 0.82,
        avg_ndwi: 0.03,
        avg_heat_risk: 0.91,
        vulnerability_index: 0.82,
        dominant_category: 'Extreme',
        recommended_actions: ['Cool Roofs', 'Shade Structures'],
        vulnerability: {
          elderlyDensityPct: 24.1,
          informalSettlementPct: 35.0,
          canopyDeficitPct: 78.0,
          sviScore: 0.82,
          realWorldRiskScore: 45.3
        },
        anomaly: {
          isAnomaly: true,
          expectedLst: 37.8,
          deltaSpike: 3.4,
          possibleCause: 'High humidity thermal trapping & asphalt paving'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[80.22, 13.03], [80.25, 13.03], [80.25, 13.06], [80.22, 13.06], [80.22, 13.03]]]
        }
      },
      {
        zone_id: 102,
        zone_name: 'Zone 13 - Adyar Estuary Buffer',
        avg_lst: 29.4,
        avg_ndvi: 0.62,
        avg_ndbi: 0.25,
        avg_ndwi: 0.45,
        avg_heat_risk: 0.32,
        vulnerability_index: 0.38,
        dominant_category: 'Low',
        recommended_actions: ['Mangrove Wetland Protection'],
        vulnerability: {
          elderlyDensityPct: 12.0,
          informalSettlementPct: 14.0,
          canopyDeficitPct: 22.0,
          sviScore: 0.38,
          realWorldRiskScore: 28.5
        },
        anomaly: {
          isAnomaly: false,
          expectedLst: 29.1,
          deltaSpike: 0.3,
          possibleCause: 'Coastal sea breeze & mangrove cooling'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[80.24, 13.00], [80.27, 13.00], [80.27, 13.03], [80.24, 13.03], [80.24, 13.00]]]
        }
      }
    ]
  },
  {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9252,
    lon: 78.1198,
    zoom: 13,
    baselineTemp: 33.5,
    population: '1.8 Million',
    wards: [
      {
        zone_id: 201,
        zone_name: 'Ward 45 - Meenakshi Temple Core',
        avg_lst: 39.8,
        avg_ndvi: 0.05,
        avg_ndbi: 0.79,
        avg_ndwi: 0.01,
        avg_heat_risk: 0.88,
        vulnerability_index: 0.76,
        dominant_category: 'High',
        recommended_actions: ['Reflective Paving', 'Misting Stations'],
        vulnerability: {
          elderlyDensityPct: 26.0,
          informalSettlementPct: 28.0,
          canopyDeficitPct: 82.0,
          sviScore: 0.76,
          realWorldRiskScore: 43.1
        },
        anomaly: {
          isAnomaly: false,
          expectedLst: 38.9,
          deltaSpike: 0.9,
          possibleCause: 'High solar radiation on granite structures'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[78.10, 9.91], [78.13, 9.91], [78.13, 9.94], [78.10, 9.94], [78.10, 9.91]]]
        }
      }
    ]
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lon: 78.4867,
    zoom: 12,
    baselineTemp: 30.0,
    population: '10.5 Million',
    wards: [
      {
        zone_id: 301,
        zone_name: 'HITEC City - Cyberabad Tech Cluster',
        avg_lst: 40.5,
        avg_ndvi: 0.15,
        avg_ndbi: 0.81,
        avg_ndwi: 0.04,
        avg_heat_risk: 0.89,
        vulnerability_index: 0.58,
        dominant_category: 'High',
        recommended_actions: ['Green Roof Mandate', 'Urban Forestry'],
        vulnerability: {
          elderlyDensityPct: 10.5,
          informalSettlementPct: 18.0,
          canopyDeficitPct: 70.0,
          sviScore: 0.58,
          realWorldRiskScore: 39.8
        },
        anomaly: {
          isAnomaly: true,
          expectedLst: 36.9,
          deltaSpike: 3.6,
          possibleCause: 'Deccan rocky terrain reflection & glass facade heat rejection'
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[78.36, 17.43], [78.40, 17.43], [78.40, 17.47], [78.36, 17.47], [78.36, 17.43]]]
        }
      }
    ]
  }
];
