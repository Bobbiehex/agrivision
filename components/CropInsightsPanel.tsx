
import React from 'react';
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  Zap, 
  TrendingUp, 
  Bug, 
  Leaf, 
  BarChart3, 
  History,
  Layers
} from 'lucide-react';
import { CropData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CropInsightsPanelProps {
  crop: CropData;
}

export const CropInsightsPanel: React.FC<CropInsightsPanelProps> = ({ crop }) => {
  const { t } = useLanguage();
  const insights = crop.insights;

  if (!insights) return null;

  const insightItems = [
    {
      id: 1,
      title: t('insight_ndvi_ndre'),
      icon: <Layers className="text-emerald-500" size={20} />,
      value: `NDVI: ${crop.ndvi} | NDRE: ${insights.ndre} | VARI: ${insights.vari}`,
      description: "Assessing crop health and vigor through multispectral data.",
      status: crop.ndvi > 0.6 ? 'Optimal' : 'Attention'
    },
    {
      id: 2,
      title: t('insight_growth_stage'),
      icon: <Activity className="text-blue-500" size={20} />,
      value: insights.growthStage,
      description: "Identifying plant development phases for optimized input application.",
      status: 'Normal'
    },
    {
      id: 3,
      title: t('insight_water_stress'),
      icon: <Droplets className="text-cyan-500" size={20} />,
      value: `${insights.waterStress ?? 0}% Stress Level`,
      description: "Highlighting areas suffering from drought or poor irrigation.",
      status: (insights.waterStress ?? 0) < 20 ? 'Low' : 'Warning'
    },
    {
      id: 4,
      title: t('insight_pest_disease'),
      icon: <Bug className="text-rose-500" size={20} />,
      value: `Pests: ${insights.pestPressure ?? 'N/A'} | Disease: ${insights.diseaseRisk ?? 'N/A'}`,
      description: "Early identification of fungal infections, viral issues, or pest damage.",
      status: insights.pestPressure === 'Low' ? 'Safe' : 'Monitor'
    },
    {
      id: 5,
      title: t('insight_thermal_stress'),
      icon: <Thermometer className="text-orange-500" size={20} />,
      value: `${insights.thermalStress ?? 0}% Thermal Variation`,
      description: "Identifying temperature variations affecting plant performance.",
      status: (insights.thermalStress ?? 0) < 15 ? 'Stable' : 'High'
    },
    {
      id: 6,
      title: t('insight_nutrients'),
      icon: <Zap className="text-yellow-500" size={20} />,
      value: `N: ${insights.nutrientStatus?.nitrogen ?? 'N/A'} | P: ${insights.nutrientStatus?.phosphorus ?? 'N/A'} | K: ${insights.nutrientStatus?.potassium ?? 'N/A'}`,
      description: "Spotting symptoms of nitrogen, potassium, or other nutrient shortages.",
      status: insights.nutrientStatus?.nitrogen === 'Optimal' ? 'Balanced' : 'Deficient'
    },
    {
      id: 7,
      title: t('insight_yield'),
      icon: <TrendingUp className="text-indigo-500" size={20} />,
      value: `${insights.yieldForecast ?? 0} Tons/Hectare`,
      description: "Predicting harvest outcomes using crop structure and index trends.",
      status: 'Projected'
    },
    {
      id: 8,
      title: t('insight_weed'),
      icon: <Leaf className="text-amber-600" size={20} />,
      value: `${insights.weedDensity ?? 0}% Infestation`,
      description: "Identifying weed-infested zones for targeted herbicide use.",
      status: (insights.weedDensity ?? 0) < 10 ? 'Clean' : 'Treatment Needed'
    },
    {
      id: 9,
      title: t('insight_canopy'),
      icon: <BarChart3 className="text-green-600" size={20} />,
      value: `${insights.canopyCover ?? 0}% Coverage`,
      description: "Measuring leaf area density and light interception efficiency.",
      status: (insights.canopyCover ?? 0) > 70 ? 'Dense' : 'Sparse'
    },
    {
      id: 10,
      title: t('insight_historical'),
      icon: <History className="text-slate-500" size={20} />,
      value: crop.history.length > 0 ? "Data Available" : "No History",
      description: "Comparing current crop health to previous seasons for trend analysis.",
      status: 'Analyzed'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="text-emerald-500" size={18} />
          {t('insights_title')}
        </h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {insightItems.map((item) => (
          <div key={item.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    item.status === 'Optimal' || item.status === 'Balanced' || item.status === 'Safe' || item.status === 'Clean' || item.status === 'Dense' || item.status === 'Stable' || item.status === 'Normal'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : item.status === 'Warning' || item.status === 'Attention' || item.status === 'Monitor' || item.status === 'Deficient' || item.status === 'Treatment Needed' || item.status === 'High'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{item.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
