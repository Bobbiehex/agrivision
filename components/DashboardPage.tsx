
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
            <span className="text-sm font-medium">
              {new Intl.DateTimeFormat(navigator.language, { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              }).format(new Date())}
            </span>
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
                src="/image.png" 
                alt="Field Map" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-3 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Optimal Health</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Action Required</span>
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold">Livestock Monitoring</h3>
              </div>
              <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-900">
                <img 
                  src="/image1.png" 
                  alt="Livestock" 
                  className="w-full h-full object-cover relative z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                  <p className="text-xs font-medium text-emerald-300 mb-1">● Live Feed - Barn 01</p>
                  <p className="text-sm font-bold leading-tight">Continuous tracking of herd movement and health metrics. 124 animals detected.</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold">Automated Drone Fleet</h3>
              </div>
              <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-900">
                <img 
                  src="/image2.png" 
                  alt="Drone Path" 
                  className="w-full h-full object-cover relative z-0"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="w-16 h-16 bg-emerald-500/30 rounded-full animate-ping"></div>
                   <div className="w-4 h-4 bg-emerald-500 rounded-full absolute"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-xl z-20 border border-white/20 shadow-lg">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Drone 04 Active</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currently mapping topography and crop health in Sector C.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Greenhouse Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold">Greenhouse Climate Control</h2>
              <button className="text-sm text-emerald-600 font-semibold hover:underline">Adjust Settings</button>
            </div>
            <div className="relative bg-slate-100 dark:bg-slate-900 group">
              <img 
                src="/image4.png" 
                alt="Greenhouse" 
                className="w-full h-auto object-contain block"
              />
              <div className="absolute top-4 left-4 flex gap-2 z-20">
                <span className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur shadow-sm">24°C</span>
                <span className="bg-blue-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur shadow-sm">65% Humidity</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 xl:opacity-100 xl:group-hover:opacity-100">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Micro-climate analysis shows ideal conditions for premium crops. Maintaining current parameters will accelerate the flowering phase by an estimated 2 days.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold">Soil Moisture Dynamics</h3>
              </div>
              <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-900">
                <img 
                  src="/image3.png" 
                  alt="Soil Moisture" 
                  className="w-full h-full object-cover relative z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-black/20 to-transparent z-10"></div>
                <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-medium text-blue-300 mb-1">Sensor Grid Alpha</p>
                      <p className="text-sm font-bold leading-tight">Ideal moisture retained in deep root zones.</p>
                    </div>
                    <div className="bg-blue-500/80 backdrop-blur px-2 py-1 rounded-lg">
                      <p className="text-xs font-bold">42%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col group">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold">Autonomous Harvesters</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img 
                  src="/image5.png" 
                  alt="Harvester" 
                  className="w-full h-full object-cover relative z-0 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl z-20 text-white border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-emerald-400">Harvester 02</p>
                    <p className="text-[10px] font-medium bg-white/20 px-1.5 py-0.5 rounded">94% Efficiency</p>
                  </div>
                  <p className="text-xs text-slate-300">Fleet coordination active in northern corn fields. Estimated completion in 3 hours.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:col-span-2">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold">Crop Yield Forecasting</h3>
              </div>
              <div className="aspect-[21/9] md:aspect-[3/1] relative bg-slate-100 dark:bg-slate-900">
                <img 
                  src="/image6.png" 
                  alt="Yield Forecast" 
                  className="w-full h-full object-cover relative z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/90 via-indigo-900/40 to-transparent z-10"></div>
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h4 className="text-4xl md:text-5xl font-bold text-white mb-2">+12%</h4>
                  <p className="text-sm md:text-base font-medium text-indigo-100 max-w-lg">AI-driven multi-spectral forecast predicting an overall yield increase based on optimal meteorological data and current soil health.</p>
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
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm transition-colors flex items-center justify-between group">
                Launch Drone Scan
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-between group">
                Generate Report
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Resource Status */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Resource Consumption</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Water Storage</span>
                  <span className="text-emerald-600 font-bold">78%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-emerald-500 h-2.5 rounded-full w-[78%] relative overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Solar Energy Grid</span>
                  <span className="text-amber-500 font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-amber-500 h-2.5 rounded-full w-[92%] relative overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Fertilizer Silos</span>
                  <span className="text-blue-500 font-bold">45%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-blue-500 h-2.5 rounded-full w-[45%]"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Restock recommended in 4 days.</p>
              </div>
            </div>
          </div>
          
          {/* Active Operations Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Live Operations</h3>
            <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-6">
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-800"></span>
                <p className="text-xs font-bold text-emerald-600 mb-1">IN PROGRESS</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Sector 4 Irrigation</p>
                <p className="text-xs text-slate-500 mt-0.5">Automated drip system running for remaining 2 hours.</p>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-800"></span>
                <p className="text-xs font-bold text-amber-600 mb-1">UPCOMING (14:00)</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Soil Sampling Drone</p>
                <p className="text-xs text-slate-500 mt-0.5">Pre-flight checks completed. Awaiting schedule.</p>
              </div>
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-800"></span>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">SCHEDULED (16:30)</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Livestock Feeding</p>
                <p className="text-xs text-slate-500 mt-0.5">Barns 1 through 4 automated dispensing.</p>
              </div>
            </div>
          </div>

          {/* AI Sustainability Score */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-indigo-100 font-medium text-sm">Eco-Efficiency Rating</p>
                  <h3 className="text-2xl font-bold mt-1">Excellent</h3>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2">
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeDasharray="94, 100"
                      className="animate-[dash_1.5s_ease-out_forwards]"
                    />
                  </svg>
                  <div className="absolute text-2xl font-bold">94</div>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-indigo-100 mb-1">
                      <span>Carbon Offset</span>
                      <span>+12%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div className="bg-emerald-400 h-1.5 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-indigo-100 mb-1">
                      <span>Water Recycled</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div className="bg-blue-400 h-1.5 rounded-full w-[88%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supply Chain Logistics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Active Dispatch Logs</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Outgoing: Organic Wheat</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fleet 04 • En route to distribution center (ETA 45m)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                  <ArrowDownRight size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Incoming: Bio-Fertilizer</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Supplier delivery expected at 14:30 today.</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 p-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50">
              View Full Logistics Map
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
