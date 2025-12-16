
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Sun, 
  Wind, 
  CloudRain, 
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { ApiService } from '../services/api';
import { WeatherData, HealthStatus } from '../types';
import { MOCK_WEATHER } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';

export const OverviewDashboard: React.FC = () => {
  const { t, dir } = useLanguage();
  const { notifications } = useNotifications();
  
  // State
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Live Metrics State
  const [metrics, setMetrics] = useState({
    totalYield: 0,
    yieldTrend: 0,
    activeAlerts: 0,
    avgMoisture: 0,
    moistureTrend: 0,
    totalMilk: 0,
    milkTrend: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for all dashboard data sources
      const [weatherData, cropsData, animalsData] = await Promise.all([
        ApiService.getWeather(),
        ApiService.getCrops(),
        ApiService.getAnimals()
      ]);

      setWeather(weatherData);

      // --- Calculate Real-Time Agricultural Metrics ---

      // 1. Crop Metrics
      let yieldAccumulator = 0;
      let moistureAccumulator = 0;
      let cropAlerts = 0;

      cropsData.forEach(c => {
          // Estimate yield based on NDVI health (0.0 - 1.0) and crop type base potential
          // Wheat ~ 8 ton/ha, Corn ~ 12 ton/ha, Apples ~ 40 ton/ha. Assume 10ha field avg.
          let baseYieldPerField = 80; 
          if (c.type.toLowerCase().includes('corn')) baseYieldPerField = 120;
          if (c.type.toLowerCase().includes('apple')) baseYieldPerField = 400;
          
          // Adjust yield by health factor
          yieldAccumulator += baseYieldPerField * c.ndvi;
          
          moistureAccumulator += c.soilMoisture;
          
          if (c.status !== HealthStatus.HEALTHY) cropAlerts++;
      });

      const avgMoisture = cropsData.length > 0 ? Math.round(moistureAccumulator / cropsData.length) : 0;

      // 2. Livestock Metrics
      let milkAccumulator = 0;
      let animalAlerts = 0;

      animalsData.forEach(a => {
          // Estimate daily production based on health
          if (a.species.toLowerCase().includes('cow')) {
              milkAccumulator += 28 * (a.healthScore / 100); // ~28L avg for healthy cow
          } else if (a.species.toLowerCase().includes('goat')) {
              milkAccumulator += 3.5 * (a.healthScore / 100); // ~3.5L avg for healthy goat
          }

          if (a.status !== HealthStatus.HEALTHY) animalAlerts++;
      });

      // 3. Set Aggregated Metrics
      setMetrics({
          totalYield: Math.round(yieldAccumulator),
          yieldTrend: 5.2, // Simulated positive trend vs last season
          activeAlerts: cropAlerts + animalAlerts,
          avgMoisture: avgMoisture,
          moistureTrend: -2.1, // Slight drying trend
          totalMilk: Math.round(milkAccumulator),
          milkTrend: 1.8
      });

      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 5 minutes to keep weather and metrics fresh
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Filter for priority notifications (Warning/Critical)
  const priorityNotifications = notifications
    .filter(n => n.type === 'WARNING' || n.type === 'CRITICAL')
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('farm_overview')}</h1>
          <p className="text-slate-500">{t('welcome')}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
           <span>{t('updated')}: {lastUpdated.toLocaleTimeString()}</span>
           <button 
             onClick={fetchData} 
             disabled={loading}
             className={`p-2 rounded-full hover:bg-slate-100 ${loading ? 'animate-spin' : ''}`}
           >
             <RefreshCw size={16} />
           </button>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-sky-900/10 relative overflow-hidden">
        <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} p-4 opacity-10`}>
            <Sun size={120} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
            <div className={`flex items-center space-x-4 mb-4 md:mb-0 ${dir === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Sun size={48} className="text-yellow-300 animate-pulse" />
                <div>
                    <h2 className="text-3xl font-bold">{weather.temp}°C</h2>
                    <div className="flex items-center gap-2 text-sky-100">
                        <span className="font-medium">{weather.condition}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-sm"><MapPin size={12} /> {weather.location}</span>
                    </div>
                </div>
            </div>
            <div className={`flex space-x-8 text-center ${dir === 'rtl' ? 'space-x-reverse' : ''}`}>
                <div>
                    <div className="flex items-center justify-center space-x-1 text-sky-200 mb-1">
                        <Droplets size={16} /> <span className="text-xs uppercase">{t('weather_humidity')}</span>
                    </div>
                    <span className="font-semibold text-lg">{weather.humidity}%</span>
                </div>
                <div>
                    <div className="flex items-center justify-center space-x-1 text-sky-200 mb-1">
                        <Wind size={16} /> <span className="text-xs uppercase">{t('weather_wind')}</span>
                    </div>
                    <span className="font-semibold text-lg">{weather.windSpeed} km/h</span>
                </div>
                <div>
                    <div className="flex items-center justify-center space-x-1 text-sky-200 mb-1">
                        <CloudRain size={16} /> <span className="text-xs uppercase">{t('weather_rain')}</span>
                    </div>
                    <span className="font-semibold text-lg">{weather.rainfall} mm</span>
                </div>
            </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: t('stat_yield'), 
            value: `${metrics.totalYield.toLocaleString()} Tons`, 
            change: `+${metrics.yieldTrend}%`, 
            icon: TrendingUp, 
            color: 'emerald' 
          },
          { 
            label: t('stat_alerts'), 
            value: `${metrics.activeAlerts} Active`, 
            change: metrics.activeAlerts > 0 ? '+1 New' : 'Stable', 
            icon: AlertTriangle, 
            color: metrics.activeAlerts > 0 ? 'rose' : 'green' 
          },
          { 
            label: t('stat_moisture'), 
            value: `${metrics.avgMoisture}%`, 
            change: `${metrics.moistureTrend}%`, 
            icon: Droplets, 
            color: 'blue' 
          },
          { 
            label: t('stat_milk'), 
            value: `${metrics.totalMilk} L`, 
            change: `+${metrics.milkTrend}%`, 
            icon: ArrowUpRight, 
            color: 'indigo' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.change.startsWith('+') || stat.change === 'Stable' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">{t('priority_alerts')}</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">{t('view_all')}</button>
        </div>
        <div className="divide-y divide-slate-100">
            {priorityNotifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle size={48} className="mb-2 text-emerald-500 opacity-50" />
                    <p className="font-medium text-slate-600">All Systems Normal</p>
                    <p className="text-sm">No critical alerts detected on the farm.</p>
                </div>
            ) : (
                priorityNotifications.map((alert) => (
                    <div key={alert.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center space-x-4">
                            <div className={`w-2 h-2 rounded-full ${
                                alert.type === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : 
                                alert.type === 'WARNING' ? 'bg-amber-500' : 'bg-slate-400'
                            }`} />
                            <div className={dir === 'rtl' ? 'mr-3' : 'ml-3'}>
                                <p className="font-medium text-slate-800">{alert.title}</p>
                                <p className="text-sm text-slate-500 truncate max-w-md">{alert.message}</p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                            {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
