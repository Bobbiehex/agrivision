
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  TrendingUp, 
  Users, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Map as MapIcon,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t, dir } = useLanguage();

  const stats = [
    { label: 'Total Area', value: '1,240 Ha', change: '+2.5%', icon: MapIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Active Drones', value: '12', change: 'Stable', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Crop Health', value: '94%', change: '+1.2%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Team Members', value: '24', change: '+3', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_dashboard')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back to your agricultural command center.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <Calendar size={18} className="text-slate-400" />
            <span className="text-sm font-medium">March 11, 2026</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={14} /> : null}
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visual Insights */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">Field Surveillance & NDVI</h2>
              <button className="text-sm text-emerald-600 font-semibold hover:underline">View Map</button>
            </div>
            <div className="aspect-video relative bg-slate-100 dark:bg-slate-900">
              {/* This is where the user's images should go */}
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" 
                alt="Field Map" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-3 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold">Optimal Health</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-bold">Action Required</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current NDVI analysis shows 85% of the wheat fields are in the optimal growth stage. 
                Minor nitrogen deficiency detected in Sector B-4.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold">Livestock Monitoring</h3>
              </div>
              <div className="aspect-square relative bg-slate-100 dark:bg-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80" 
                  alt="Livestock" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm p-3 rounded-xl text-white">
                  <p className="text-xs font-medium">Barn 01 - Main Camera</p>
                  <p className="text-lg font-bold">124 Animals Detected</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold">Drone Flight Path</h3>
              </div>
              <div className="aspect-square relative bg-slate-100 dark:bg-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80" 
                  alt="Drone Path" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-emerald-500/20 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weather & Alerts */}
        <div className="space-y-8">
          {/* Weather Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-emerald-100 font-medium">Weather Forecast</p>
                <h3 className="text-4xl font-bold mt-1">24°C</h3>
              </div>
              <CloudRain size={48} className="text-white opacity-80" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-100 mb-1">
                  <Droplets size={14} />
                  <span className="text-xs font-medium">Humidity</span>
                </div>
                <p className="font-bold">62%</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-100 mb-1">
                  <Wind size={14} />
                  <span className="text-xs font-medium">Wind</span>
                </div>
                <p className="font-bold">12 km/h</p>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold">Priority Alerts</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {[
                { title: 'Water Stress Detected', sector: 'Sector C-2', time: '10m ago', type: 'critical' },
                { title: 'Livestock Isolation', sector: 'Barn 02', time: '25m ago', type: 'warning' },
                { title: 'Low Battery - Drone 04', sector: 'Hangar', time: '1h ago', type: 'info' },
              ].map((alert, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.type === 'critical' ? 'bg-rose-500' : 
                      alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{alert.title}</p>
                      <p className="text-xs text-slate-500">{alert.sector} • {alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full p-4 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors border-t border-slate-100 dark:border-slate-700">
              View All Alerts
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm transition-colors flex items-center justify-between">
                Launch Drone Scan
                <ArrowUpRight size={18} />
              </button>
              <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-between">
                Generate Report
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
