import React, { useState } from 'react';
import { HelpCircle, TreePine, Warehouse, Waves, HeartHandshake, Compass, CheckCircle2, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { MitigationRecommendation, MLPrediction } from '../types';
import { toast } from './NotificationToast';

interface RecommendationListProps {
  prediction: MLPrediction | null;
  recommendations: MitigationRecommendation[];
  onRecommendationsGenerated: (recs: MitigationRecommendation[]) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const RecommendationList: React.FC<RecommendationListProps> = ({
  prediction,
  recommendations,
  onRecommendationsGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fetchRecommendations = async () => {
    if (!prediction) return;
    setIsGenerating(true);
    toast.info('Synthesizing mitigation scenarios...');

    try {
      const response = await axios.post(`${API_URL}/recommendations`, {
        prediction_id: prediction.id
      });
      toast.success('Spatial recommendations generated.');
      onRecommendationsGenerated(response.data);
    } catch (error) {
      console.warn('API recommendations failed, creating mock recommendations locally', error);
      
      // Simulate mitigation items based on prediction category
      setTimeout(() => {
        const mockRecs: MitigationRecommendation[] = [];
        const cat = prediction.heat_category;
        
        // 1. Tree Plantation
        mockRecs.push({
          id: 201,
          prediction_id: prediction.id,
          zone_id: null,
          mitigation_type: 'Tree Plantation',
          description: `Expand canopy shade in this area. Target planting native broadleaf trees to increase local cooling dynamics and provide canopy shelter in this ${cat} heat zone.`,
          priority: cat === 'Extreme' || cat === 'High' ? 'Critical' : (cat === 'Medium' ? 'Medium' : 'Low'),
          geometry: prediction.geometry,
          created_at: new Date().toISOString()
        });

        // 2. Green Corridors
        mockRecs.push({
          id: 202,
          prediction_id: prediction.id,
          zone_id: null,
          mitigation_type: 'Green Corridors',
          description: "Establish continuous green paths along major road corridors to facilitate air movement and reduce linear concrete heat island channels.",
          priority: cat === 'Extreme' || cat === 'High' ? 'High' : 'Medium',
          geometry: prediction.geometry,
          created_at: new Date().toISOString()
        });

        // 3. Cool Roofs
        mockRecs.push({
          id: 203,
          prediction_id: prediction.id,
          zone_id: null,
          mitigation_type: 'Cool Roofs',
          description: "Encourage cool roof coatings (reflective paint) and install green roofs to limit building structural heat conduction and reduce ambient air temps.",
          priority: cat === 'Extreme' ? 'Critical' : (cat === 'High' ? 'High' : (cat === 'Medium' ? 'Medium' : 'Low')),
          geometry: prediction.geometry,
          created_at: new Date().toISOString()
        });

        // 4. Water Body Restoration
        if (cat !== 'Low') {
          mockRecs.push({
            id: 204,
            prediction_id: prediction.id,
            zone_id: null,
            mitigation_type: 'Water Body Restoration',
            description: "Evaporative cooling zone recommendation. Restore local retention basins and check-dams to maximize spatial humidity cooling offsets.",
            priority: cat === 'Extreme' || cat === 'High' ? 'High' : 'Medium',
            geometry: prediction.geometry,
            created_at: new Date().toISOString()
          });
        }

        // 5. Open Spaces
        if (cat === 'Low' || cat === 'Medium') {
          mockRecs.push({
            id: 205,
            prediction_id: prediction.id,
            zone_id: null,
            mitigation_type: 'Open Spaces',
            description: "Designate shade-canopied parks and public squares to offer relief centers during dry summer diurnal peak heating periods.",
            priority: 'Low',
            geometry: prediction.geometry,
            created_at: new Date().toISOString()
          });
        }

        toast.success('Simulation: Mitigations generated.');
        onRecommendationsGenerated(mockRecs);
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  const getMitigationIcon = (type: string) => {
    switch (type) {
      case 'Tree Plantation':
      case 'TreePine':
        return <TreePine className="w-4 h-4 text-console-low" />;
      case 'Cool Roofs':
      case 'Warehouse':
        return <Warehouse className="w-4 h-4 text-sky-400" />;
      case 'Water Body Restoration':
      case 'Waves':
        return <Waves className="w-4 h-4 text-sky-400" />;
      case 'Green Corridors':
        return <Compass className="w-4 h-4 text-console-low" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-console-orange" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    return {
      'Low': 'bg-console-lowBg border border-console-lowBorder text-console-low',
      'Medium': 'bg-console-mediumBg border border-console-mediumBorder text-console-medium',
      'High': 'bg-console-highBg border border-console-highBorder text-console-high',
      'Critical': 'bg-console-extremeBg border border-console-extremeBorder text-console-extreme animate-pulse'
    }[priority] || 'bg-console-bg border border-console-border text-console-textSec';
  };

  return (
    <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none h-full flex flex-col justify-between font-sans">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <HeartHandshake className="w-5 h-5 text-console-orange" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
            Spatial Mitigations
          </h2>
        </div>

        {/* Generate Button if empty */}
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-console-textSec mb-6 leading-normal">
              Heuristic engines calculate location-specific targets like cool roofs, tree canopy expansion, and waterbody restoration once heat scores are computed.
            </p>
            <button
              onClick={fetchRecommendations}
              disabled={!prediction || isGenerating}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
            >
              <span>{isGenerating ? 'ANALYZING...' : 'RESOLVE MITIGATIONS'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {recommendations.map((item, idx) => (
              <div
                key={idx}
                className="bg-console-bg border border-console-border hover:border-console-orange/50 rounded-[2px] p-3.5 flex items-start space-x-3.5 transition-colors"
              >
                <div className="bg-console-surface p-2 rounded-[2px] border border-console-border flex-shrink-0">
                  {getMitigationIcon(item.mitigation_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-console-text truncate">
                      {item.mitigation_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase ${getPriorityClass(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-console-textSec leading-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-console-border text-[10px] text-console-textSec font-mono flex items-center justify-center space-x-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-console-low flex-shrink-0" />
        <span>REPAIRS METRICS RESOLVED SPATIALLY</span>
      </div>
    </div>
  );
};
