
import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Save, CheckCircle, Shield, Sprout, PawPrint, Smartphone, Database, Server, Wifi, WifiOff, Moon, Sun, Monitor } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: true
  });

  const [cropAlerts, setCropAlerts] = useState({
    irrigation: true,
    disease: true,
    nutrients: false,
    equipment: true
  });

  const [livestockAlerts, setLivestockAlerts] = useState({
    health: true,
    estrus: true,
    perimeter: true,
    predator: false
  });

  // Database Connection State
  const [dbConfig, setDbConfig] = useState({
    apiUrl: '',
    apiKey: '',
    connected: false
  });

  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    // Load saved settings on mount
    const savedUrl = localStorage.getItem('agri_api_url') || '';
    const savedKey = localStorage.getItem('agri_api_key') || '';
    if (savedUrl) {
        setDbConfig({ apiUrl: savedUrl, apiKey: savedKey, connected: true });
    }

    const loadSettings = (key: string, setter: any) => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                setter(JSON.parse(saved));
            } catch (e) { console.error(`Error loading ${key}`, e); }
        }
    };

    loadSettings('settings_channels', setChannels);
    loadSettings('settings_cropAlerts', setCropAlerts);
    loadSettings('settings_livestockAlerts', setLivestockAlerts);

  }, []);

  // Generic handler for toggling settings with persistence and specific notifications
  const handleToggle = (
    category: 'channels' | 'cropAlerts' | 'livestockAlerts',
    key: string,
    label: string,
    newValue: boolean
  ) => {
      // 1. Update State
      if (category === 'channels') {
          const updated = { ...channels, [key]: newValue };
          setChannels(updated);
          localStorage.setItem('settings_channels', JSON.stringify(updated));
      } else if (category === 'cropAlerts') {
          const updated = { ...cropAlerts, [key]: newValue };
          setCropAlerts(updated);
          localStorage.setItem('settings_cropAlerts', JSON.stringify(updated));
      } else if (category === 'livestockAlerts') {
          const updated = { ...livestockAlerts, [key]: newValue };
          setLivestockAlerts(updated);
          localStorage.setItem('settings_livestockAlerts', JSON.stringify(updated));
      }

      // 2. Trigger Specific Notification
      addNotification({
          title: 'Setting Updated',
          message: `${label} has been turned ${newValue ? 'ON' : 'OFF'}.`,
          type: 'INFO'
      });
  };

  const handleSaveDbConfig = () => {
    // Save DB Config
    localStorage.setItem('agri_api_url', dbConfig.apiUrl);
    localStorage.setItem('agri_api_key', dbConfig.apiKey);
    
    setSaved(true);
    addNotification({ title: 'Connection Settings Saved', message: 'API endpoint details updated.', type: 'SUCCESS' });
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    if (!dbConfig.apiUrl) return;
    setConnectionStatus('testing');
    try {
        // Attempt a simple ping or fetch
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const res = await fetch(`${dbConfig.apiUrl}/health`, { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${dbConfig.apiKey}` },
            signal: controller.signal
        });
        clearTimeout(id);
        
        if (res.ok) {
            setConnectionStatus('success');
            addNotification({ title: 'Connection Successful', message: 'Successfully reached the remote API.', type: 'SUCCESS' });
        } else {
            setConnectionStatus('failed');
            addNotification({ title: 'Connection Failed', message: `Server returned status: ${res.status}`, type: 'WARNING' });
        }
    } catch (e) {
        console.warn("Connection test failed", e);
        setConnectionStatus('failed');
        addNotification({ title: 'Network Error', message: 'Could not reach the provided endpoint.', type: 'WARNING' });
    }
  };

  const Toggle = ({ label, checked, onChange, icon: Icon, description }: any) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        {Icon && <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"><Icon size={18} /></div>}
        <div>
            <span className="font-medium text-slate-700 dark:text-slate-200 block">{label}</span>
            {description && <span className="text-xs text-slate-400">{description}</span>}
        </div>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your farm preferences and database connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Theme & Display */}
        <div className="lg:col-span-3">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                     <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-700 dark:text-indigo-400">
                         <Monitor size={20} />
                     </div>
                     <h3 className="font-bold text-slate-800 dark:text-white">{t('settings_theme')}</h3>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            setTheme('light');
                            addNotification({ title: 'Theme Changed', message: 'Switched to Light Mode', type: 'INFO' });
                        }}
                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400'}`}
                    >
                        <Sun size={24} className="mb-2" />
                        <span className="font-medium text-sm">{t('theme_light')}</span>
                    </button>
                    <button 
                        onClick={() => {
                            setTheme('dark');
                            addNotification({ title: 'Theme Changed', message: 'Switched to Dark Mode', type: 'INFO' });
                        }}
                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400'}`}
                    >
                        <Moon size={24} className="mb-2" />
                        <span className="font-medium text-sm">{t('theme_dark')}</span>
                    </button>
                     <button 
                        onClick={() => {
                            setTheme('system');
                            addNotification({ title: 'Theme Changed', message: 'Switched to System Default', type: 'INFO' });
                        }}
                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400'}`}
                    >
                        <Monitor size={24} className="mb-2" />
                        <span className="font-medium text-sm">{t('theme_system')}</span>
                    </button>
                </div>
             </div>
        </div>

        {/* Database & Cloud Config */}
        <div className="lg:col-span-3">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Cloud Database Connection</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Connect your own backend API (PostgreSQL/MongoDB via REST)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         {dbConfig.apiUrl ? (
                             <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                                 <Wifi size={14} /> Cloud Active
                             </span>
                         ) : (
                             <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                 <WifiOff size={14} /> Using Local DB
                             </span>
                         )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">API Endpoint URL</label>
                            <div className="relative">
                                <Server className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="https://api.yourfarm.com/v1" 
                                    value={dbConfig.apiUrl}
                                    onChange={(e) => setDbConfig({...dbConfig, apiUrl: e.target.value})}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-slate-900 dark:text-white"
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Must accept JSON requests. Routes expected: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">/crops</code>, <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">/animals</code></p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">API Key / Auth Token</label>
                            <input 
                                type="password" 
                                placeholder="sk_live_..." 
                                value={dbConfig.apiKey}
                                onChange={(e) => setDbConfig({...dbConfig, apiKey: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono text-slate-900 dark:text-white"
                            />
                        </div>
                         <button 
                          onClick={handleSaveDbConfig}
                          className={`flex items-center justify-center gap-2 w-full px-6 py-2 rounded-lg transition-all shadow-md ${
                            saved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                          <span className="font-medium">{saved ? 'Saved' : 'Save Connection Details'}</span>
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Connection Status</h4>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    connectionStatus === 'success' ? 'bg-emerald-500' :
                                    connectionStatus === 'failed' ? 'bg-rose-500' : 
                                    connectionStatus === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                                }`} />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {connectionStatus === 'idle' ? 'Not Tested' :
                                     connectionStatus === 'testing' ? 'Testing Connection...' :
                                     connectionStatus === 'success' ? 'Connected Successfully' : 'Connection Failed'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                When connected, the dashboard will fetch real-time data from your server. If the connection drops, it automatically falls back to the local browser database.
                            </p>
                        </div>
                        <button 
                            onClick={testConnection}
                            disabled={!dbConfig.apiUrl || connectionStatus === 'testing'}
                            className="mt-4 w-full py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors text-sm"
                        >
                            Test Connection
                        </button>
                    </div>
                </div>
             </div>
        </div>

        {/* Notification Channels Column */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                    <Bell size={18} className="text-indigo-600 dark:text-indigo-400" /> Notification Channels
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Where should we send your alerts?</p>
                
                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    <Toggle 
                    label="Email Alerts" 
                    description="Daily digests & critical alerts"
                    checked={channels.email} 
                    onChange={(v: boolean) => handleToggle('channels', 'email', 'Email Alerts', v)} 
                    icon={Mail}
                    />
                    <Toggle 
                    label="SMS Notifications" 
                    description="Instant critical warnings"
                    checked={channels.sms} 
                    onChange={(v: boolean) => handleToggle('channels', 'sms', 'SMS Notifications', v)} 
                    icon={MessageSquare}
                    />
                    <Toggle 
                    label="Mobile Push" 
                    description="Real-time app notifications"
                    checked={channels.push} 
                    onChange={(v: boolean) => handleToggle('channels', 'push', 'Mobile Push', v)} 
                    icon={Smartphone}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-slate-600 dark:text-slate-400" /> Security
                </h3>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">Two-Factor Auth</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Extra layer of security</p>
                    </div>
                    <button className="text-emerald-600 dark:text-emerald-400 font-medium text-xs hover:underline bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">Enable</button>
                </div>
            </div>
        </div>

        {/* Specific Alert Config Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Crop Alerts */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400">
                    <Sprout size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Crop Alert Configuration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customize sensitivity for field monitoring</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
               <Toggle 
                label="Water Stress & Irrigation" 
                checked={cropAlerts.irrigation} 
                onChange={(v: boolean) => handleToggle('cropAlerts', 'irrigation', 'Irrigation Alerts', v)} 
              />
              <Toggle 
                label="Disease & Pest Detection" 
                checked={cropAlerts.disease} 
                onChange={(v: boolean) => handleToggle('cropAlerts', 'disease', 'Disease Detection', v)} 
              />
               <Toggle 
                label="Nutrient Deficiencies" 
                checked={cropAlerts.nutrients} 
                onChange={(v: boolean) => handleToggle('cropAlerts', 'nutrients', 'Nutrient Alerts', v)} 
              />
              <Toggle 
                label="Drone/Sensor Equipment Status" 
                checked={cropAlerts.equipment} 
                onChange={(v: boolean) => handleToggle('cropAlerts', 'equipment', 'Equipment Status', v)} 
              />
            </div>
          </div>

          {/* Livestock Alerts */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400">
                    <PawPrint size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Livestock Alert Configuration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Customize alerts for animal health and safety</p>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
               <Toggle 
                label="Health Anomalies (Temp/HR)" 
                checked={livestockAlerts.health} 
                onChange={(v: boolean) => handleToggle('livestockAlerts', 'health', 'Health Anomaly Alerts', v)} 
              />
              <Toggle 
                label="Estrus / Breeding Cycle" 
                checked={livestockAlerts.estrus} 
                onChange={(v: boolean) => handleToggle('livestockAlerts', 'estrus', 'Breeding Alerts', v)} 
              />
               <Toggle 
                label="Geofence / Perimeter Breach" 
                checked={livestockAlerts.perimeter} 
                onChange={(v: boolean) => handleToggle('livestockAlerts', 'perimeter', 'Geofence Alerts', v)} 
              />
              <Toggle 
                label="Predator Detection (Wolf/Coyote)" 
                checked={livestockAlerts.predator} 
                onChange={(v: boolean) => handleToggle('livestockAlerts', 'predator', 'Predator Alerts', v)} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
