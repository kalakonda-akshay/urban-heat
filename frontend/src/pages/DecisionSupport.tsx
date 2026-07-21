import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, RadialBarChart, RadialBar, AreaChart, Area 
} from 'recharts';
import { 
  Thermometer, Trees, Building2, Droplet, ArrowRight, Compass, Cpu, AlertTriangle,
  Calendar, Play, Pause, Send, FileDown, DollarSign, Leaf, LineChart as LineChartIcon, 
  HelpCircle, ShieldCheck, Activity, Heart, Eye, BellRing, Sparkles
} from 'lucide-react';
import { toast } from '../components/NotificationToast';

interface SimulationParams {
  treePlantation: number; // 0-50%
  coolRoofs: number; // 0-100%
  waterBodies: number; // 0-5
  builtupReduction: number; // 0-30%
  permeableSurfaces: number; // 0-40%
}

interface WardData {
  id: number;
  name: string;
  lst: number;
  ndvi: number;
  ndbi: number;
  ndwi: number;
  population: number; // density / sq km
  roadDensity: number; // km / sq km
  buildingDensity: number; // percentage
}

const INITIAL_WARDS: WardData[] = [
  { id: 101, name: 'Ward A - Koramangala Core', lst: 37.4, ndvi: 0.12, ndbi: 0.58, ndwi: -0.21, population: 14500, roadDensity: 12.4, buildingDensity: 74 },
  { id: 102, name: 'Ward B - Cubbon Park Belt', lst: 26.8, ndvi: 0.65, ndbi: 0.12, ndwi: 0.25, population: 3200, roadDensity: 4.8, buildingDensity: 18 },
  { id: 103, name: 'Ward C - Whitefield Ind.', lst: 40.5, ndvi: 0.04, ndbi: 0.74, ndwi: -0.28, population: 18200, roadDensity: 16.1, buildingDensity: 82 },
  { id: 104, name: 'Ward D - Indiranagar Res.', lst: 31.8, ndvi: 0.35, ndbi: 0.32, ndwi: -0.06, population: 9800, roadDensity: 8.5, buildingDensity: 48 },
  { id: 105, name: 'Ward E - Ulsoor Lake Border', lst: 29.5, ndvi: 0.42, ndbi: 0.24, ndwi: 0.31, population: 11200, roadDensity: 9.1, buildingDensity: 38 }
];

export const DecisionSupport: React.FC = () => {
  // Timeline State (Feature 10)
  const [timelineYear, setTimelineYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playTimer = useRef<any>(null);

  // Simulation parameters (Feature 1)
  const [params, setParams] = useState<SimulationParams>({
    treePlantation: 10,
    coolRoofs: 20,
    waterBodies: 1,
    builtupReduction: 5,
    permeableSurfaces: 15
  });

  // Selected Ward for Explainable AI & Detailed Planning
  const [selectedWardId, setSelectedWardId] = useState<number>(103); // Default to Whitefield Ind.

  // Emergency Incident alert trigger state
  const [alertIncidents, setAlertIncidents] = useState<Array<{ time: string; target: string; message: string }>>([]);

  // AI Chat Assistant state (Feature 8)
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Welcome to the ISRO BAH 2026 Climate Decision Center. Ask me about hottest zones, vulnerable hospitals, next year projections, or SHAP prediction importance ratios.' }
  ]);

  // Handle timeline animation player
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setTimelineYear(prev => {
          if (prev === 2016) return 2026;
          if (prev === 2026) return 2030;
          if (prev === 2030) return 2040;
          return 2016; // Loop back
        });
      }, 2500);
    } else {
      if (playTimer.current) clearInterval(playTimer.current);
    }
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying]);

  const selectedWard = INITIAL_WARDS.find(w => w.id === selectedWardId) || INITIAL_WARDS[0];

  // Calculations: Expected reductions based on slider parameters (Feature 1 Heuristics)
  const calculateSimulatedMetrics = (ward: WardData) => {
    // Sliders effect factors
    const treeCooling = (params.treePlantation / 50) * 2.8; // Max -2.8C
    const coolRoofCooling = (params.coolRoofs / 100) * 1.5; // Max -1.5C
    const waterCooling = (params.waterBodies / 5) * 1.0; // Max -1.0C
    const builtupCooling = (params.builtupReduction / 30) * 1.2; // Max -1.2C
    const permeableCooling = (params.permeableSurfaces / 40) * 0.8; // Max -0.8C

    const totalCooling = treeCooling + coolRoofCooling + waterCooling + builtupCooling + permeableCooling;
    
    // Time Series factor modification
    let timelineOffset = 0;
    if (timelineYear === 2016) timelineOffset = -1.2;
    if (timelineYear === 2030) timelineOffset = 0.8;
    if (timelineYear === 2040) timelineOffset = 2.1;

    const baseLst = Math.max(20, ward.lst + timelineOffset);
    const simulatedLst = Math.max(20, baseLst - totalCooling);
    
    // Risk scores (0.0 to 1.0)
    const baseScore = Math.min(1.0, Math.max(0.0, 0.4 * ((baseLst - 22) / 24) + 0.3 * (ward.ndbi) - 0.2 * (ward.ndvi) + 0.1 * (ward.population / 20000)));
    const simulatedScore = Math.min(1.0, Math.max(0.0, baseScore - (totalCooling * 0.08)));

    // Green cover (0.0 to 1.0)
    const baseGreen = ward.ndvi;
    const simulatedGreen = Math.min(1.0, baseGreen + (params.treePlantation / 150));

    // UHI Intensity scale
    const baseUhi = baseLst - 24.0; // Comparison against rural reference
    const simulatedUhi = Math.max(0, baseUhi - totalCooling);

    return {
      baseLst,
      simulatedLst,
      baseScore,
      simulatedScore,
      baseGreen,
      simulatedGreen,
      baseUhi,
      simulatedUhi,
      totalCooling
    };
  };

  const simResult = calculateSimulatedMetrics(selectedWard);

  // Heat Vulnerability Index (Feature 2)
  const calculateHVI = (ward: WardData) => {
    const lstNorm = (ward.lst - 24) / 18; 
    const ndviInverse = 1.0 - ward.ndvi;
    const ndbiNorm = ward.ndbi;
    const popNorm = Math.min(1.0, ward.population / 20000);
    const roadNorm = Math.min(1.0, ward.roadDensity / 20);
    const buildingNorm = ward.buildingDensity / 100;

    const hvi = (0.25 * lstNorm + 0.15 * ndviInverse + 0.15 * ndbiNorm + 0.2 * popNorm + 0.15 * buildingNorm + 0.1 * roadNorm) * 100;
    
    let category = 'Moderate';
    if (hvi > 80) category = 'Very High';
    else if (hvi > 60) category = 'High';
    else if (hvi > 40) category = 'Moderate';
    else if (hvi > 20) category = 'Low';
    else category = 'Very Low';

    return {
      hvi: Math.min(100, Math.max(0, hvi)),
      category
    };
  };

  // Ward Ranks & Prioritization (Feature 5)
  const sortedWards = [...INITIAL_WARDS].map(w => {
    const hviResult = calculateHVI(w);
    const budgetLevel = hviResult.hvi > 75 ? 'Critical (High Allocation)' : (hviResult.hvi > 50 ? 'Moderate' : 'Minimum');
    const roadmapStep = hviResult.hvi > 75 ? 'Phase 1 Action Required' : 'Phase 2 Deferred';
    return {
      ...w,
      hvi: hviResult.hvi,
      category: hviResult.category,
      budgetLevel,
      roadmapStep
    };
  }).sort((a, b) => b.hvi - a.hvi);

  // Sustainability Index score (Feature 7)
  const getSustainabilityScore = (ward: WardData, isSimulated = false) => {
    let greenVal = ward.ndvi;
    let builtVal = ward.ndbi;
    let tempVal = ward.lst;
    
    if (isSimulated) {
      greenVal = Math.min(1.0, greenVal + (params.treePlantation / 150));
      builtVal = Math.max(0, builtVal - (params.builtupReduction / 120));
      tempVal = Math.max(20, tempVal - simResult.totalCooling);
    }

    const greenPart = greenVal * 40; 
    const builtPart = (1.0 - builtVal) * 30; 
    const tempPart = Math.max(0, 1.0 - ((tempVal - 22) / 20)) * 30; 

    return Math.min(100, Math.max(0, greenPart + builtPart + tempPart));
  };

  const currentSust = getSustainabilityScore(selectedWard, false);
  const simulatedSust = getSustainabilityScore(selectedWard, true);
  const sustImprovement = ((simulatedSust - currentSust) / currentSust) * 100;

  // AI Confidence indicator (Feature 11)
  const calculateConfidence = (score: number) => {
    const probability = 0.96 - Math.abs(0.05 * Math.sin(score * 10));
    return {
      probability: Math.round(probability * 100),
      reliability: probability > 0.9 ? 'High Reliability Node' : 'Adequate Threshold'
    };
  };

  const confidenceData = calculateConfidence(simResult.simulatedScore);

  // Trigger Emergency Alerts (Advanced Feature 15)
  const triggerEmergencyAlert = () => {
    const time = new Date().toLocaleTimeString();
    const target = `${selectedWard.name.split(' - ')[1]}`;
    const message = `THERMAL ALERT: Land Surface Temp exceeded critical threshold at ${simResult.baseLst.toFixed(1)}°C. Broadcast dispatched to regional Hospitals, Schools, and Cooling Centers.`;
    
    setAlertIncidents(prev => [{ time, target, message }, ...prev.slice(0, 4)]);
    toast.error(`Emergency Heat Broadcast dispatched for ${target}!`);
  };

  // Advanced Budget & Carbon calculators (Advanced Features 13 & 14)
  const getMitigationsList = (ward: WardData) => {
    const isHigh = ward.lst > 32;
    return [
      { 
        type: 'Tree Plantation', 
        priority: isHigh ? 'Critical' : 'Medium', 
        difficulty: 'Easy', 
        reduction: '1.2°C', 
        cost: '₹4.5 Lakhs', 
        carbon: '18.5 tons CO₂/yr',
        duration: '3 Months',
        roi: 'High (24%)' 
      },
      { 
        type: 'Cool Roofs Coating', 
        priority: isHigh ? 'High' : 'Medium', 
        difficulty: 'Easy', 
        reduction: '1.8°C', 
        cost: '₹2.8 Lakhs', 
        carbon: '8.2 tons CO₂/yr',
        duration: '1 Month',
        roi: 'Instant (35%)' 
      },
      { 
        type: 'Green Corridors', 
        priority: 'High', 
        difficulty: 'Hard', 
        reduction: '2.5°C', 
        cost: '₹22.0 Lakhs', 
        carbon: '45.0 tons CO₂/yr',
        duration: '9 Months',
        roi: 'Moderate (18%)' 
      },
      { 
        type: 'Water Body Restoration', 
        priority: 'Critical', 
        difficulty: 'Medium', 
        reduction: '3.0°C', 
        cost: '₹14.5 Lakhs', 
        carbon: '12.0 tons CO₂/yr',
        duration: '6 Months',
        roi: 'Excellent (40%)' 
      },
      { 
        type: 'Reflective Pavements', 
        priority: 'Medium', 
        difficulty: 'Medium', 
        reduction: '0.8°C', 
        cost: '₹8.0 Lakhs', 
        carbon: '4.5 tons CO₂/yr',
        duration: '2 Months',
        roi: 'Adequate (15%)' 
      }
    ];
  };

  // Vulnerable Public structures (Advanced Feature 16)
  const getPublicHealthRiskList = (wardId: number) => {
    if (wardId === 103) {
      return [
        { name: 'Vyas Memorial School', type: 'School', risk: 'Extreme Exposure', coolingCenter: 'UHI Shelter Block A' },
        { name: 'Sakra Health Center', type: 'Hospital', risk: 'High Vulnerability', coolingCenter: 'Main AC Lobby' },
        { name: 'Swasti Care Home', type: 'Old Age Home', risk: 'Extreme Exposure', coolingCenter: 'Swasti Basement Wing' }
      ];
    }
    return [
      { name: 'St. Teresa School', type: 'School', risk: 'Moderate Exposure', coolingCenter: 'School Gym' },
      { name: 'Apollo Clinic', type: 'Hospital', risk: 'Low Risk', coolingCenter: 'Main Clinic Lobby' },
      { name: 'Udaya Care Shelter', type: 'Old Age Home', risk: 'Moderate Exposure', coolingCenter: 'Shelter Hall' }
    ];
  };

  const healthAssets = getPublicHealthRiskList(selectedWardId);

  // AI Chat responses (Feature 8)
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let botText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('hottest') || textLower.includes('highest heat')) {
        const topWard = sortedWards[0];
        botText = `The hottest sector recorded in telemetry registry is ${topWard.name} with average LST of ${topWard.lst.toFixed(1)}°C and building coefficient of ${topWard.buildingDensity}%.`;
      } else if (textLower.includes('hospital') || textLower.includes('school') || textLower.includes('vulnerable')) {
        botText = `In the active ward, ${healthAssets.map(h => `${h.name} (${h.risk})`).join(', ')} are registered as vulnerable. Target backup cooling centers: ${healthAssets[0].coolingCenter}.`;
      } else if (textLower.includes('predict') || textLower.includes('next year') || textLower.includes('future')) {
        botText = `Timeline models project a baseline global urban temperature escalation of +0.8°C by year 2030 and +2.1°C by 2040 if albedo changes are not executed.`;
      } else if (textLower.includes('cool roof') || textLower.includes('mitigation')) {
        botText = `Reflective polymer cool roofs coatings yield a high return (ROI 35%) with immediate temperature relief of -1.8°C for residential zones.`;
      } else if (textLower.includes('why') && (textLower.includes('risk') || textLower.includes('vulnerable'))) {
        botText = `Vulnerability categorization is formulated via weights: 25% thermal sensor outputs, 20% population index clusters, 15% structural voids, and 10% road network structures.`;
      } else {
        botText = `Under active planning: selected ward LST is ${simResult.baseLst.toFixed(1)}°C. Mitigation recommendations include cool roofs coating, expanding tree plantation cover, and linear green corridors.`;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: botText }]);
    }, 800);
  };

  // Download planning report (Feature 9)
  const downloadReport = () => {
    const timestamp = new Date().toLocaleString();
    const logTitle = "ISRO URBAN CLIMATE DECISION SUPPORT REPORT\n";
    const divider = "=======================================================================\n\n";
    
    let logBody = `${logTitle}Generated on: ${timestamp}\n${divider}`;
    logBody += `SIMULATED SCENARIO CONFIGURATION:\n`;
    logBody += `- Target Ward: ${selectedWard.name}\n`;
    logBody += `- Tree Plantation Increase: +${params.treePlantation}%\n`;
    logBody += `- Cool Roof Coating Adoption: ${params.coolRoofs}%\n`;
    logBody += `- Restored Reservoirs: ${params.waterBodies} zones\n`;
    logBody += `- Built-up Density Reductions: -${params.builtupReduction}%\n\n`;

    logBody += `CLIMATE ESTIMATION SUMMARY:\n`;
    logBody += `- Base Surface Temp: ${simResult.baseLst.toFixed(1)}°C\n`;
    logBody += `- Expected Simulated Temp: ${simResult.simulatedLst.toFixed(1)}°C\n`;
    logBody += `- Cooling Offset: -${simResult.totalCooling.toFixed(2)}°C\n`;
    logBody += `- Sustainability Index Gain: ${currentSust.toFixed(1)} -> ${simulatedSust.toFixed(1)} (+${sustImprovement.toFixed(1)}%)\n\n`;

    logBody += `VULNERABLE PUBLIC ASSETS IN ACTIVE ZONE:\n`;
    healthAssets.forEach(h => {
      logBody += `- ${h.name} | Type: ${h.type} | Risk: ${h.risk} | Shelter: ${h.coolingCenter}\n`;
    });
    logBody += `\n`;

    logBody += `PRIORITY WARD RANKING MATRIX:\n`;
    sortedWards.forEach((w, idx) => {
      logBody += `${idx + 1}. ${w.name} | HVI Score: ${w.hvi.toFixed(1)} | Allocation: ${w.budgetLevel}\n`;
    });

    const blob = new Blob([logBody], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `isro_decision_support_report_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Professional planning report downloaded.');
  };

  // Mock SHAP data for XAI (Feature 3)
  const shapData = [
    { name: 'Surface Temp (LST)', value: selectedWard.lst * 0.6, fill: '#ef4444' },
    { name: 'Built-up Index (NDBI)', value: selectedWard.ndbi * 45, fill: '#f97316' },
    { name: 'Population Density', value: (selectedWard.population / 20000) * 30, fill: '#eab308' },
    { name: 'Road Infrastructure', value: (selectedWard.roadDensity / 20) * 15, fill: '#64748b' },
    { name: 'Vegetation (NDVI)', value: (1.0 - selectedWard.ndvi) * -20, fill: '#10b981' }
  ];

  // Compare chart data before vs after (Feature 6)
  const comparisonChartData = [
    { name: 'LST Temp (°C)', Current: parseFloat(simResult.baseLst.toFixed(1)), Simulated: parseFloat(simResult.simulatedLst.toFixed(1)) },
    { name: 'Heat Risk Score (%)', Current: Math.round(simResult.baseScore * 100), Simulated: Math.round(simResult.simulatedScore * 100) },
    { name: 'Green Cover (%)', Current: Math.round(simResult.baseGreen * 100), Simulated: Math.round(simResult.simulatedGreen * 100) },
    { name: 'UHI Intensity (x10)', Current: Math.round(simResult.baseUhi * 10), Simulated: Math.round(simResult.simulatedUhi * 10) }
  ];

  // 10-Year historical to future timeline data (Feature 10)
  const timelineChartData = [
    { year: '2016 (Hist)', Temp: parseFloat((selectedWard.lst - 1.2).toFixed(1)), Risk: 42 },
    { year: '2026 (Curr)', Temp: parseFloat(selectedWard.lst.toFixed(1)), Risk: 65 },
    { year: '2030 (Proj)', Temp: parseFloat((selectedWard.lst + 0.8).toFixed(1)), Risk: 76 },
    { year: '2040 (Future)', Temp: parseFloat((selectedWard.lst + 2.1).toFixed(1)), Risk: 92 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-console-text flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-console-orange animate-pulse" />
            <span>AI URBAN CLIMATE DECISION SUPPORT CENTER</span>
          </h1>
          <p className="text-xs text-console-textSec font-mono mt-1">
            SYS_PLANNING_ENGINE: SIMULATION_AND_ROADMAPS // YEAR: {timelineYear}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3 bg-console-surface border border-console-border p-1.5 rounded-[4px]">
          {/* Time Series timeline player controls */}
          <div className="flex items-center space-x-1.5 px-3 border-r border-console-border">
            <Calendar className="w-3.5 h-3.5 text-console-orange" />
            <span className="text-xs font-bold font-mono text-console-text w-10 text-center">{timelineYear}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-[2px] hover:bg-console-bg text-console-textSec hover:text-console-orange transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={timelineYear === 2016 ? 0 : (timelineYear === 2026 ? 1 : (timelineYear === 2030 ? 2 : 3))}
              onChange={(e) => {
                const vals = [2016, 2026, 2030, 2040];
                setTimelineYear(vals[parseInt(e.target.value)]);
              }}
              className="w-20 accent-console-orange h-1.5 bg-thermal-gradient rounded-[2px] appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={downloadReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono font-bold uppercase tracking-wider transition-colors text-[10px]"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT ROADMAP REPORT</span>
          </button>
        </div>
      </div>

      {/* Target Selector: Horizontal Scrollable Chip Row with Heat Risk Color per Ward */}
      <div className="glass-panel p-4 rounded-[4px] border border-console-border shadow-none">
        <label className="text-[10px] text-console-textSec font-mono uppercase tracking-wider block mb-2">
          Target Ward Focus Area (Mini Heatmap Selector)
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {INITIAL_WARDS.map(w => {
            const isSelected = selectedWardId === w.id;
            let badgeBg = 'bg-console-lowBg border-console-lowBorder text-console-low';
            let dotColor = 'bg-console-low';
            if (w.lst > 38) {
              badgeBg = 'bg-console-extremeBg border-console-extremeBorder text-console-extreme';
              dotColor = 'bg-console-extreme';
            } else if (w.lst > 33) {
              badgeBg = 'bg-console-highBg border-console-highBorder text-console-high';
              dotColor = 'bg-console-high';
            } else if (w.lst > 28) {
              badgeBg = 'bg-console-mediumBg border-console-mediumBorder text-console-medium';
              dotColor = 'bg-console-medium';
            }

            return (
              <button
                key={w.id}
                onClick={() => setSelectedWardId(w.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-[2px] text-xs font-mono whitespace-nowrap border transition-colors ${badgeBg} ${
                  isSelected ? 'ring-1 ring-console-orange font-bold' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                <span>{w.name}</span>
                <span className="font-semibold">{w.lst}°C</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 1: AI Planner Simulators & Digital Twin Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Container */}
        <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Compass className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                AI Urban Planning Simulators
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-console-textSec flex items-center"><Trees className="w-3 h-3 text-console-low mr-1"/>Tree Plantation</span>
                  <span className="text-console-orange font-semibold">+{params.treePlantation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={params.treePlantation}
                  onChange={(e) => setParams(prev => ({ ...prev, treePlantation: parseInt(e.target.value) }))}
                  className="w-full accent-console-orange h-1.5 bg-thermal-gradient rounded-[2px] appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-console-textSec flex items-center"><Building2 className="w-3 h-3 text-sky-400 mr-1"/>Cool Roofs Adoption</span>
                  <span className="text-console-orange font-semibold">{params.coolRoofs}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.coolRoofs}
                  onChange={(e) => setParams(prev => ({ ...prev, coolRoofs: parseInt(e.target.value) }))}
                  className="w-full accent-console-orange h-1.5 bg-thermal-gradient rounded-[2px] appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-console-textSec flex items-center"><Droplet className="w-3 h-3 text-sky-400 mr-1"/>Water Reservoirs</span>
                  <span className="text-console-orange font-semibold">{params.waterBodies} zones</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={params.waterBodies}
                  onChange={(e) => setParams(prev => ({ ...prev, waterBodies: parseInt(e.target.value) }))}
                  className="w-full accent-console-orange h-1.5 bg-thermal-gradient rounded-[2px] appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-console-textSec">Permeable Surface Gains</span>
                  <span className="text-console-orange font-semibold">+{params.permeableSurfaces}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={params.permeableSurfaces}
                  onChange={(e) => setParams(prev => ({ ...prev, permeableSurfaces: parseInt(e.target.value) }))}
                  className="w-full accent-console-orange h-1.5 bg-thermal-gradient rounded-[2px] appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-console-textSec">Reduce Built-up Density</span>
                  <span className="text-console-orange font-semibold">-{params.builtupReduction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={params.builtupReduction}
                  onChange={(e) => setParams(prev => ({ ...prev, builtupReduction: parseInt(e.target.value) }))}
                  className="w-full accent-console-orange h-1.5 bg-thermal-gradient rounded-[2px] appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-console-border pt-4 mt-6 flex justify-between text-xs font-mono">
            <span className="text-console-textSec">Total Simulated Cooling Impact</span>
            <span className="text-console-extreme font-semibold">-{simResult.totalCooling.toFixed(1)}°C</span>
          </div>
        </div>

        {/* Digital Twin Viewport */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-[4px] border border-console-border shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Eye className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                Urban Digital Twin 3D Viewport
              </h2>
            </div>
            <span className="text-[10px] text-console-textSec font-mono uppercase tracking-wider">
              Selected: {selectedWard.name.split(' - ')[1]}
            </span>
          </div>

          {/* Interactive isometric Twin canvas visualization simulation */}
          <div className="w-full h-[220px] bg-console-bg border border-console-border rounded-[2px] relative overflow-hidden flex items-center justify-center p-4">
            {/* Background grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2937_1px,transparent_1px),linear-gradient(to_bottom,#1F2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
            
            {/* Stylized isometric Twin components */}
            <div className="relative flex flex-wrap gap-4 items-center justify-center max-w-md w-full z-10 transition-all duration-300">
              {/* Render Building Tower components */}
              <div 
                className="w-16 bg-console-surface border border-console-border rounded-[2px] p-2 flex flex-col items-center justify-center transition-all duration-500 hover:border-console-orange"
                style={{ height: `${Math.max(40, 100 - params.builtupReduction * 2)}px` }}
              >
                <Building2 className="w-6 h-6 text-console-textSec mb-1" />
                <span className="text-[7px] text-console-textSec font-mono uppercase">Concrete</span>
              </div>

              {/* Cool Roof block */}
              <div 
                className="w-16 bg-console-surface border border-sky-500/20 rounded-[2px] p-2 flex flex-col items-center justify-center transition-all duration-500"
                style={{ height: '80px', opacity: 0.3 + (params.coolRoofs / 100) * 0.7 }}
              >
                <div className="w-10 h-1 bg-sky-400 rounded-full mb-2" />
                <Building2 className="w-6 h-6 text-sky-400 mb-1" />
                <span className="text-[7px] text-sky-400 font-mono uppercase">Cool Roof</span>
              </div>

              {/* Render Tree blocks depending on plantation cover */}
              {params.treePlantation > 5 && (
                <div className="w-16 bg-console-surface border border-console-lowBorder rounded-[2px] p-2 flex flex-col items-center justify-center transition-all duration-500">
                  <Trees className="w-6 h-6 text-console-low mb-1 animate-pulse" />
                  <span className="text-[7px] text-console-low font-mono uppercase">Canopy</span>
                </div>
              )}

              {/* Water reservoir block */}
              {params.waterBodies > 0 && (
                <div 
                  className="w-16 bg-console-surface border border-sky-500/20 rounded-[2px] p-2 flex flex-col items-center justify-center transition-all duration-500"
                  style={{ transform: `scale(${1.0 + params.waterBodies * 0.05})` }}
                >
                  <Droplet className="w-6 h-6 text-sky-400 mb-1" />
                  <span className="text-[7px] text-sky-400 font-mono uppercase">Water</span>
                </div>
              )}
            </div>

            {/* Twin telemetry details */}
            <div className="absolute bottom-2 left-2 font-mono text-[9px] text-console-textSec bg-console-surface border border-console-border p-2 rounded-[2px]">
              Twin Density Index: { (selectedWard.buildingDensity - params.builtupReduction).toFixed(0) }% <br/>
              Simulated LST: <span className="text-console-extreme font-bold">{ simResult.simulatedLst.toFixed(1) }°C</span>
            </div>
          </div>

          <div className="text-[10px] text-console-textSec font-mono leading-relaxed border-t border-console-border pt-3 mt-3">
            Planners can adjust sliders on the left to simulate physical canopy and structural density parameters.
          </div>
        </div>
      </div>

      {/* Row 2: Before/After & Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Before vs After comparison */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
          <div className="flex items-center space-x-3 mb-6">
            <LineChartIcon className="w-5 h-5 text-console-orange" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
              Before vs After Mitigation comparison
            </h2>
          </div>
          <div className="w-full h-[240px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--console-border)" />
                <XAxis dataKey="name" stroke="var(--console-textSec)" tick={{ fontSize: 10, fill: 'var(--console-textSec)' }} />
                <YAxis stroke="var(--console-textSec)" tick={{ fill: 'var(--console-textSec)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--console-surface)', borderColor: 'var(--console-border)', borderRadius: '4px' }}
                  labelStyle={{ color: 'var(--console-text)', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: 'var(--console-textSec)' }} />
                <Bar name="Current Scenario" dataKey="Current" fill="#8B95A7" radius={[2, 2, 0, 0]} />
                <Bar name="Simulated Scenario" dataKey="Simulated" fill="#E8622C" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 10-Year Decadal Heat & Risk trends */}
        <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-5 h-5 text-console-orange" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
              Timeline Climate Projections
            </h2>
          </div>
          <div className="w-full h-[240px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--console-border)" />
                <XAxis dataKey="year" stroke="var(--console-textSec)" tick={{ fill: 'var(--console-textSec)' }} />
                <YAxis stroke="var(--console-textSec)" tick={{ fill: 'var(--console-textSec)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--console-surface)', borderColor: 'var(--console-border)', borderRadius: '4px' }}
                  labelStyle={{ color: 'var(--console-text)', fontWeight: 'bold' }}
                />
                <Legend />
                <Area type="monotone" name="Proj. LST (°C)" dataKey="Temp" stroke="#DC2626" fillOpacity={1} fill="url(#colorTemp)" />
                <Line type="monotone" name="Risk Index (%)" dataKey="Risk" stroke="#E8622C" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: XAI SHAP, Sustainability, and Emergency Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Explainable AI */}
        <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-console-orange" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                  SHAP Diagnostics (XAI)
                </h2>
              </div>
              <div className="bg-console-lowBg border border-console-lowBorder text-console-low font-mono text-[9px] px-2 py-0.5 rounded-[2px]">
                {confidenceData.probability}% CONFIDENT
              </div>
            </div>
            
            <div className="w-full h-[180px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" 
                  barSize={8} data={shapData}
                >
                  <RadialBar background dataKey="value" />
                  <Legend iconSize={6} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 8, color: 'var(--console-textSec)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border-t border-console-border pt-3 mt-4 text-[10px] text-console-textSec leading-relaxed font-mono">
            <span className="text-console-orange font-semibold block uppercase mb-1">Inference Rationale</span>
            UHI category is driven by concrete building density factors (+{selectedWard.buildingDensity}%) and poor NDVI moisture reservoirs.
          </div>
        </div>

        {/* Sustainability Score Gauge */}
        <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Leaf className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                Sustainability Score Index
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-console-textSec uppercase font-mono block">Current Score</span>
                  <span className="text-2xl font-display font-semibold text-console-text">{currentSust.toFixed(1)} / 100</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-console-textSec uppercase font-mono block">Simulated Score</span>
                  <span className="text-2xl font-display font-semibold text-console-orange">{simulatedSust.toFixed(1)}</span>
                </div>
              </div>

              {/* Progress gauge visual bars */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-console-textSec font-mono">
                  <span>Target Improvement Ratio</span>
                  <span className="text-console-low">+{sustImprovement.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-console-bg h-2 rounded-[2px] overflow-hidden border border-console-border">
                  <div 
                    className="bg-thermal-gradient h-full transition-all duration-500" 
                    style={{ width: `${simulatedSust}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-console-textSec font-mono leading-normal border-t border-console-border pt-4 mt-6">
            Composite metrics aggregated from vegetation cover densities, water indexing structures, and concrete coefficients.
          </div>
        </div>

        {/* Emergency Alert Panel */}
        <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BellRing className="w-5 h-5 text-console-extreme" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-extreme">
                  Emergency Heat Alert
                </h2>
              </div>
              {simResult.baseLst > 35 && (
                <span className="bg-console-extremeBg border border-console-extremeBorder text-console-extreme text-[8px] font-mono font-bold px-2 py-0.5 rounded-[2px] animate-pulse">
                  CRITICAL LST LEVEL
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-450 leading-relaxed mb-4 font-mono">
              Temperature limits exceed safety norms in the active zone. Trigger emergency broadcast alerts to public authorities, hospitals, and schools.
            </p>

            {alertIncidents.length > 0 ? (
              <div className="space-y-2 max-h-24 overflow-y-auto font-mono text-[8px]">
                {alertIncidents.map((inc, i) => (
                  <div key={i} className="p-1.5 rounded bg-rose-950/10 border border-rose-500/20 text-rose-400">
                    [{inc.time}] {inc.target}: ALERT DISPATCHED
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-600 font-mono text-[9px]">
                No alert dispatches in this session.
              </div>
            )}
          </div>

          <button
            onClick={triggerEmergencyAlert}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-bold transition-all text-[10px] mt-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>TRIGGER BROADCAST ALERT</span>
          </button>
        </div>
      </div>

      {/* Row 4: Public Health & Vulnerable Assets (Advanced Feature 16) */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 shadow-glass-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="w-5 h-5 text-space-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Public Health Vulnerability Registry
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px]">
          {healthAssets.map((asset, idx) => (
            <div key={idx} className="bg-space-950/40 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                  <span className="font-bold text-slate-200">{asset.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    asset.risk.includes('Extreme') ? 'bg-rose-950/40 border border-rose-500/20 text-rose-400' : 'bg-amber-950/40 border border-amber-500/20 text-amber-400'
                  }`}>
                    {asset.risk}
                  </span>
                </div>
                <p className="text-slate-400 mb-2">Type: <strong className="text-slate-300">{asset.type}</strong></p>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-900/60 pt-3">
                <span>Cooling Center: <strong className="text-space-accent">{asset.coolingCenter}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5: Ward Prioritization & AI Chat (Feature 5, Feature 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ward Rankings Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 shadow-glass-shadow overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-5 h-5 text-space-accent" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Ward Prioritization ranking Matrix
            </h2>
          </div>
          
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 uppercase text-[9px] bg-slate-900/40">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Ward Focus Area</th>
                  <th className="py-2.5 px-3 text-center">Vulnerability HVI (0-100)</th>
                  <th className="py-2.5 px-3">Budget allocation</th>
                  <th className="py-2.5 px-3">Roadmap Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40">
                {sortedWards.map((w, idx) => (
                  <tr 
                    key={w.id} 
                    onClick={() => setSelectedWardId(w.id)}
                    className={`hover:bg-slate-900/30 cursor-pointer transition-colors ${selectedWardId === w.id ? 'bg-space-accent/5' : ''}`}
                  >
                    <td className="py-2.5 px-3 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{w.name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-400">{w.hvi.toFixed(1)}</td>
                    <td className={`py-2.5 px-3 uppercase text-[9px] ${w.budgetLevel.includes('Critical') ? 'text-rose-450 text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {w.budgetLevel}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{w.roadmapStep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Chat Assistant */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between h-[320px]">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <HelpCircle className="w-5 h-5 text-space-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                AI Urban planning Assistant
              </h2>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[180px] text-[10px] font-mono pr-1">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-2 rounded leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-space-accent/10 border border-space-accent/20 text-slate-200 ml-6 text-right' 
                      : 'bg-slate-950/60 border border-slate-850 text-slate-300 mr-6 text-left'
                  }`}
                >
                  <span className="text-[8px] text-slate-500 block uppercase mb-1 font-bold">
                    {msg.sender === 'user' ? 'Planner Query' : 'System Insight'}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendChatMessage} className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-1.5 mt-4">
            <input
              type="text"
              placeholder="Ask for highest risk, projections or clinics..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="w-full bg-transparent px-2 py-1 text-[10px] font-mono text-slate-100 placeholder-slate-550 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 rounded bg-space-accent text-space-950 hover:bg-cyan-400 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Row 6: Budget Planner & Carbon Calculators Matrix (Advanced Feature 13 & 14) */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 shadow-glass-shadow overflow-hidden">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="w-5 h-5 text-space-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Mitigation Costing & Carbon Impact Calculator
          </h2>
        </div>
        
        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 uppercase text-[9px] bg-slate-900/40">
                <th className="py-2.5 px-3">Cooling Strategy</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Expected LST Drop</th>
                <th className="py-2.5 px-3">Estimated Budget</th>
                <th className="py-2.5 px-3">Expected CO₂ Offset</th>
                <th className="py-2.5 px-3">Completion Time</th>
                <th className="py-2.5 px-3">ROI Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/40">
              {getMitigationsList(selectedWard).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30">
                  <td className="py-2.5 px-3 text-slate-200 font-semibold">{item.type}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      item.priority === 'Critical' ? 'text-rose-400 bg-rose-950/20' : 'text-amber-400 bg-amber-950/20'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">-{item.reduction}</td>
                  <td className="py-2.5 px-3 text-space-accent font-semibold">{item.cost}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-semibold">{item.carbon}</td>
                  <td className="py-2.5 px-3 text-slate-450">{item.duration}</td>
                  <td className="py-2.5 px-3 text-space-solar">{item.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
