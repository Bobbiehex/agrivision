
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  Scan, 
  Droplets, 
  CheckCircle,
  FileText,
  Sprout,
  Loader2,
  Download,
  Settings,
  Map,
  Layers,
  ThermometerSun,
  Eye,
  Maximize2,
  Palette
} from 'lucide-react';
import EXIF from 'exif-js';
import html2canvas from 'html2canvas';
import { MOCK_CROPS } from '../constants';
import { CropData, HealthStatus, AIAnalysisResult, GeoLocation } from '../types';
import { analyzeCropImage } from '../services/geminiService';
import { ApiService } from '../services/api';
import { dbService } from '../services/db';
import { ExportService } from '../services/exportService';
import { CropInsightsPanel } from './CropInsightsPanel';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

type OverlayType = 'NONE' | 'NDVI' | 'THERMAL';
type NdviColorScheme = 'RG' | 'SPECTRAL' | 'DIVERGING';

interface CropDashboardProps {
  initialCropId?: string;
  farmId: string | null;
}

export const CropDashboard: React.FC<CropDashboardProps> = ({ initialCropId, farmId }) => {
  const { addNotification } = useNotifications();
  const { t, dir } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [allCrops, setAllCrops] = useState<CropData[]>(MOCK_CROPS);
  
  const crops = useMemo(() => {
    if (!farmId) return [];
    return allCrops.filter(c => c.farmId === farmId);
  }, [allCrops, farmId]);
  
  // Single Plant/Leaf Analysis State
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  
  // Map / Drone State
  const [mapImage, setMapImage] = useState<string>("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"); // Default placeholder
  const [overlayType, setOverlayType] = useState<OverlayType>('NONE');
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const [ndviColorScheme, setNdviColorScheme] = useState<NdviColorScheme>('RG');
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const mapInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NDVI Configuration State
  const [warningThreshold, setWarningThreshold] = useState(0.4);
  const [healthyThreshold, setHealthyThreshold] = useState(0.7);
  
  // Chart Interaction State
  const [draggingThreshold, setDraggingThreshold] = useState<'healthy' | 'warning' | null>(null);

  // Load saved map from DB on mount
  useEffect(() => {
    const loadSavedMap = async () => {
        try {
            const saved = await dbService.getUpload('current-drone-map');
            if (saved) {
                setMapImage(saved.dataUrl);
            }
        } catch (e) {
            console.error("Failed to load saved map", e);
        }
    };
    loadSavedMap();
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
        const data = await dbService.getAllReports();
        setReports(data.reverse()); // Newest first
    } catch (e) {
        console.error("Failed to load reports", e);
    }
  };

  // Set default selected crop or handle deep link
  useEffect(() => {
    if (crops.length > 0) {
        if (initialCropId) {
            const target = crops.find(c => c.id === initialCropId || c.fieldId === initialCropId);
            if (target) {
                setSelectedCrop(target);
                return;
            }
        }
        
        if (!selectedCrop) {
            setSelectedCrop(crops[0]);
        }
    }
  }, [crops, initialCropId]); // Removed selectedCrop from dep array to allow user switching freely after initial load

  useEffect(() => {
    // Poll for live crop data
    const interval = setInterval(async () => {
      const data = await ApiService.getCrops();
      setAllCrops(data);
      // Update selected crop if it exists in the new data
      if (selectedCrop) {
        const updated = data.find(c => c.id === selectedCrop.id);
        if (updated) setSelectedCrop(updated);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedCrop]);

  // Handle Dragging Logic for Chart Thresholds
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingThreshold || !chartContainerRef.current) return;

      const rect = chartContainerRef.current.getBoundingClientRect();
      const marginTop = 20;
      const marginBottom = 30;
      const chartHeight = rect.height - marginTop - marginBottom;
      
      const relativeY = e.clientY - rect.top - marginTop;
      let newValue = 1 - (relativeY / chartHeight);
      
      newValue = Math.max(0, Math.min(1, newValue));
      newValue = Math.round(newValue * 100) / 100;

      if (draggingThreshold === 'healthy') {
        if (newValue > warningThreshold) setHealthyThreshold(newValue);
      } else {
        if (newValue < healthyThreshold) setWarningThreshold(newValue);
      }
    };

    const handleMouseUp = () => {
      if (draggingThreshold) {
         addNotification({
            title: 'Threshold Updated',
            message: `NDVI ${draggingThreshold} threshold adjusted.`,
            type: 'INFO'
         });
      }
      setDraggingThreshold(null);
    };

    if (draggingThreshold) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [draggingThreshold, warningThreshold, healthyThreshold, addNotification]);

  // Derived state: Apply threshold logic to crops dynamically
  const displayedCrops = useMemo(() => {
    return crops.map(crop => {
        let dynamicStatus = HealthStatus.CRITICAL;
        if (crop.ndvi >= healthyThreshold) {
            dynamicStatus = HealthStatus.HEALTHY;
        } else if (crop.ndvi >= warningThreshold) {
            dynamicStatus = HealthStatus.WARNING;
        }
        return { ...crop, status: dynamicStatus };
    });
  }, [crops, warningThreshold, healthyThreshold]);

  // Image Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setAnalysisImage(result);
        setAnalysisResult(null); 
        // Save to DB
        await ApiService.saveImage(`analysis-${Date.now()}`, 'CROP', result);
        addNotification({
            title: 'Image Uploaded',
            message: 'Crop image ready for analysis.',
            type: 'INFO'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Extract GPS Data
      EXIF.getData(file as any, function(this: any) {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lon = EXIF.getTag(this, "GPSLongitude");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (lat && lon) {
          const convertToDecimal = (gps: any, ref: string) => {
            const d = gps[0].numerator / gps[0].denominator;
            const m = gps[1].numerator / gps[1].denominator;
            const s = gps[2].numerator / gps[2].denominator;
            let res = d + (m / 60) + (s / 3600);
            if (ref === 'S' || ref === 'W') res = -res;
            return res;
          };

          const latitude = convertToDecimal(lat, latRef);
          const longitude = convertToDecimal(lon, lonRef);

          addNotification({
            title: 'GPS Metadata Found',
            message: `Location extracted: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            type: 'SUCCESS'
          });
          
          // In a real app, we'd update the crop location in the DB here
          if (selectedCrop) {
            const updatedCrop = { ...selectedCrop, location: { lat: latitude, lng: longitude } };
            setSelectedCrop(updatedCrop);
            dbService.updateCrop(updatedCrop);
          }
        }
      });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setMapImage(result);
        // Save to DB with a fixed ID so it persists as the current map
        await ApiService.saveImage('current-drone-map', 'MAP', result);
        addNotification({
            title: 'Drone Map Updated',
            message: 'New field map loaded successfully.',
            type: 'SUCCESS'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();
  const triggerMapUpload = () => mapInputRef.current?.click();

  const runAnalysis = async () => {
    if (!analysisImage) return;
    setAnalyzing(true);
    addNotification({ title: 'Analysis Started', message: 'Processing image with Gemini Vision AI...', type: 'INFO' });
    
    try {
        const result = await analyzeCropImage(analysisImage.split(',')[1]);
        setAnalysisResult(result);
        
        // Critical Alert Logic
        if (result.condition.toLowerCase().includes('critical')) {
          addNotification({ 
            title: 'Critical Crop Alert', 
            message: `Detected ${result.detectedSubject} in critical condition.`, 
            type: 'CRITICAL' 
          });
        } else if (result.condition.toLowerCase().includes('warning')) {
          addNotification({ 
            title: 'Crop Warning', 
            message: `Detected ${result.detectedSubject} requires attention.`, 
            type: 'WARNING' 
          });
        } else {
          addNotification({ 
              title: 'Analysis Complete', 
              message: `Identified: ${result.detectedSubject} (${result.confidence}%)`, 
              type: 'SUCCESS' 
          });
        }

    } catch (e) {
        addNotification({ title: 'Analysis Failed', message: 'Could not process image.', type: 'WARNING' });
    } finally {
        setAnalyzing(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = displayedCrops.map(c => ({
        ID: c.fieldId,
        Name: c.name,
        Type: c.type,
        NDVI: c.ndvi,
        Moisture: c.soilMoisture,
        Status: c.status,
        Alerts: c.alerts.join('; ')
    }));
    ExportService.exportToCSV(dataToExport, 'my_field_data.csv');
    addNotification({ title: 'Data Exported', message: 'Field data downloaded as CSV.', type: 'INFO' });
  };

  const handleDownloadPDF = async () => {
    if (analysisResult && analysisImage) {
        await ExportService.generateAnalysisPDF(analysisResult, analysisImage, `Crop Analysis: ${analysisResult.detectedSubject}`);
        addNotification({ title: 'Report Downloaded', message: 'PDF Analysis report generated.', type: 'SUCCESS' });
        loadReports();
    }
  };

  const handleGenerateFieldReport = async () => {
    if (!selectedCrop) return;
    setGeneratingReport(true);
    addNotification({ title: 'Generating Report', message: 'Capturing field data and map...', type: 'INFO' });
    
    try {
        await ExportService.generateFieldReportPDF(
            selectedCrop, 
            mapContainerRef.current, 
            chartContainerRef.current
        );
        addNotification({ title: 'Report Ready', message: 'Full field report downloaded.', type: 'SUCCESS' });
        loadReports();
    } catch (e) {
        console.error("Report generation failed", e);
        addNotification({ title: 'Report Failed', message: 'Could not generate field report.', type: 'WARNING' });
    } finally {
        setGeneratingReport(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
        await dbService.deleteReport(id);
        addNotification({ title: 'Report Deleted', message: 'Historical report removed.', type: 'INFO' });
        loadReports();
    } catch (e) {
        console.error("Delete failed", e);
    }
  };

  // Helper to get colors for NDVI overlay
  const getNdviColors = (scheme: NdviColorScheme) => {
    switch(scheme) {
        case 'SPECTRAL': 
            return { 
                low: '#d946ef', // Fuchsia
                mid: '#f43f5e', // Rose
                high: '#3b82f6', // Blue
                bg: '#3b82f6',
                gradient: 'from-fuchsia-500 via-rose-500 to-blue-500',
                labels: ['Dense/Wet', 'Stress', 'Healthy']
            };
        case 'DIVERGING': 
            return { 
                low: '#b91c1c', // Dark Red
                mid: '#f3f4f6', // Gray/White
                high: '#15803d', // Dark Green
                bg: '#15803d',
                gradient: 'from-red-700 via-gray-100 to-green-700',
                labels: ['Dead/Soil', 'Mix', 'Lush']
            };
        case 'RG': 
        default: 
            return { 
                low: '#ef4444', // Red
                mid: '#eab308', // Yellow
                high: '#22c55e', // Green
                bg: '#22c55e',
                gradient: 'from-red-500 via-yellow-400 to-green-500',
                labels: ['Critical', 'Warning', 'Healthy']
            };
    }
  };

  const ndviColors = getNdviColors(ndviColorScheme);

  // Generate Graph Data from real history
  const growthData = useMemo(() => {
    if (!selectedCrop?.history) return [];
    
    // Sort by date just in case
    const sorted = [...selectedCrop.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sorted.map(point => ({
      name: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ndvi: point.ndvi,
      fullDate: point.date
    }));
  }, [selectedCrop]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('crop_monitoring')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('crop_subtitle')}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
            <button 
                onClick={handleGenerateFieldReport}
                disabled={generatingReport || !selectedCrop}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
                {generatingReport ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                <span>{t('generate_field_report')}</span>
            </button>
            <button 
                onClick={handleExportData}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
                <Download size={16} />
                <span>{t('export_csv')}</span>
            </button>
        </div>
      </div>

      {/* DRONE MAP & HEATMAP ANALYSIS */}
      <div ref={mapContainerRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <Map className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="font-semibold text-slate-800 dark:text-white">{t('drone_map')}</h3>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setOverlayType('NONE')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        overlayType === 'NONE' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Eye size={16} /> RGB
                </button>
                <button 
                    onClick={() => setOverlayType('NDVI')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        overlayType === 'NDVI' ? 'bg-emerald-500 shadow text-white' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                >
                    <Layers size={16} /> NDVI
                </button>
                <button 
                    onClick={() => setOverlayType('THERMAL')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        overlayType === 'THERMAL' ? 'bg-rose-500 shadow text-white' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                    }`}
                >
                    <ThermometerSun size={16} /> Thermal
                </button>
            </div>
        </div>

        <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden group">
            {/* Base Image */}
            <img 
                src={mapImage} 
                alt="Farm Map" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            
            {/* Overlays */}
            {overlayType !== 'NONE' && (
                <div 
                    className="absolute inset-0 mix-blend-multiply pointer-events-none transition-opacity duration-500"
                    style={{ 
                        opacity: overlayOpacity,
                        background: overlayType === 'NDVI' 
                            ? `radial-gradient(circle at 30% 40%, ${ndviColors.bg} 0%, transparent 40%), radial-gradient(circle at 70% 60%, ${ndviColors.mid} 0%, transparent 40%), radial-gradient(circle at 80% 20%, ${ndviColors.low} 0%, transparent 30%), ${ndviColors.bg}`
                            : 'radial-gradient(circle at 50% 50%, #facc15 0%, #ef4444 40%, #3b82f6 100%)'
                    }}
                />
            )}

            {/* Controls Overlay */}
            <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} flex flex-col gap-2`}>
                <button 
                    onClick={triggerMapUpload}
                    className="p-2 bg-white/90 backdrop-blur hover:bg-white text-slate-700 rounded-lg shadow-lg transition-all"
                    title="Upload Drone Map"
                >
                    <Upload size={20} />
                </button>
                <button 
                    onClick={async () => {
                        if (mapContainerRef.current) {
                            const canvas = await html2canvas(mapContainerRef.current);
                            const link = document.createElement('a');
                            link.download = `Field_Map_${Date.now()}.png`;
                            link.href = canvas.toDataURL();
                            link.click();
                            addNotification({ title: 'Map Saved', message: 'Field map image downloaded.', type: 'SUCCESS' });
                        }
                    }}
                    className="p-2 bg-white/90 backdrop-blur hover:bg-white text-slate-700 rounded-lg shadow-lg transition-all"
                    title="Download Current View"
                >
                    <Download size={20} />
                </button>
                <input 
                    type="file" 
                    ref={mapInputRef} 
                    onChange={handleMapUpload} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>

            {/* Legend / Opacity Control */}
            {overlayType !== 'NONE' && (
                <div className={`absolute bottom-4 left-4 right-4 md:left-auto md:w-72 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 ${dir === 'rtl' ? 'md:left-4' : 'md:right-4'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase">{overlayType} Overlay</span>
                        <span className="text-xs font-mono text-slate-500">{Math.round(overlayOpacity * 100)}% Opacity</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer mb-4 ${
                            overlayType === 'NDVI' ? 'accent-emerald-500 bg-emerald-100' : 'accent-rose-500 bg-rose-100'
                        }`}
                    />

                    {overlayType === 'NDVI' && (
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                    <Palette size={12} /> Color Scheme
                                </span>
                                <select 
                                    value={ndviColorScheme}
                                    onChange={(e) => setNdviColorScheme(e.target.value as NdviColorScheme)}
                                    className="text-xs bg-slate-100 border-none rounded px-2 py-1 text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="RG">Standard (R-Y-G)</option>
                                    <option value="SPECTRAL">Spectral (P-R-B)</option>
                                    <option value="DIVERGING">Contrast (R-W-G)</option>
                                </select>
                            </div>

                            <div>
                                <div className={`h-2 w-full rounded-full bg-gradient-to-r ${ndviColors.gradient} opacity-90`} />
                                <div className="grid grid-cols-3 gap-1 mt-2">
                                    <div className="flex flex-col items-start">
                                        <div className="w-2 h-2 rounded-full mb-1" style={{ background: ndviColors.low }}></div>
                                        <span className="text-[9px] font-bold text-slate-700">{ndviColors.labels[0]}</span>
                                        <span className="text-[8px] text-slate-400 font-mono">&lt; 0.3</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full mb-1" style={{ background: ndviColors.mid }}></div>
                                        <span className="text-[9px] font-bold text-slate-700">{ndviColors.labels[1]}</span>
                                        <span className="text-[8px] text-slate-400 font-mono">0.3 - 0.6</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="w-2 h-2 rounded-full mb-1" style={{ background: ndviColors.high }}></div>
                                        <span className="text-[9px] font-bold text-slate-700">{ndviColors.labels[2]}</span>
                                        <span className="text-[8px] text-slate-400 font-mono">&gt; 0.6</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {overlayType === 'THERMAL' && (
                         <div className="pt-2">
                             <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-blue-600 opacity-80" />
                             <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                                <span>Warm (Stress)</span>
                                <span>Cool (Healthy)</span>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* NDVI Configuration Panel */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-slate-500 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-800 dark:text-white">{t('ndvi_config')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Critical Limit (Red)</label>
                        <span className="text-sm font-bold text-rose-600">{warningThreshold}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="0.9" 
                        step="0.01" 
                        value={warningThreshold}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val < healthyThreshold) setWarningThreshold(val);
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">NDVI below {warningThreshold} is marked Critical</p>
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Healthy Limit (Green)</label>
                        <span className="text-sm font-bold text-emerald-600">{healthyThreshold}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="1" 
                        step="0.01" 
                        value={healthyThreshold}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val > warningThreshold) setHealthyThreshold(val);
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">NDVI above {healthyThreshold} is marked Healthy</p>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Visual Threshold Preview</p>
                <div className="h-6 w-full rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex shadow-inner relative">
                    <div 
                        style={{ width: `${warningThreshold * 100}%` }} 
                        className="bg-rose-500 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-white font-bold"
                    >
                        CRIT
                    </div>
                    <div 
                        style={{ width: `${(healthyThreshold - warningThreshold) * 100}%` }} 
                        className="bg-amber-400 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-amber-900 font-bold"
                    >
                        WARN
                    </div>
                    <div 
                        style={{ flex: 1 }} 
                        className="bg-emerald-500 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-white font-bold"
                    >
                        HEALTHY
                    </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                    <span>0.0</span>
                    <span>1.0</span>
                </div>
            </div>
        </div>
      </div>

      {/* KEY INSIGHTS & REPORTS SECTION */}
      {selectedCrop && <CropInsightsPanel crop={selectedCrop} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Field List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{t('my_fields')}</h2>
          {displayedCrops.map((crop) => (
            <div 
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCrop?.id === crop.id 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{crop.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{crop.type} • ID: {crop.fieldId}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  crop.status === HealthStatus.HEALTHY ? 'bg-green-100 text-green-700' :
                  crop.status === HealthStatus.WARNING ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {crop.status}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <Sprout size={14} className="text-emerald-500" />
                  <span className="font-mono font-medium">NDVI: {crop.ndvi}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Droplets size={14} className="text-blue-500" />
                  <span>Moist: {crop.soilMoisture}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed View / Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Analysis Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Scan className="text-indigo-500" size={18} />
                {t('ai_doctor')}
              </h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div 
                    onClick={triggerUpload}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-700/50 relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {analysisImage ? (
                    <img 
                      src={analysisImage} 
                      alt="Crop Analysis" 
                      className="absolute inset-0 w-full h-full object-cover rounded-lg" 
                    />
                  ) : (
                    <div className="text-center pointer-events-none">
                      <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('upload_instruction')}</p>
                    </div>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <button 
                  onClick={runAnalysis}
                  disabled={!analysisImage || analyzing}
                  className={`w-full py-2 rounded-lg font-medium flex justify-center items-center space-x-2 ${
                    !analysisImage ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed' :
                    analyzing ? 'bg-indigo-400 text-white cursor-wait' :
                    'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {analyzing ? (
                    <span>Analyzing...</span>
                  ) : (
                    <>
                      <Scan size={16} />
                      <span>{t('analyze_btn')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {analysisResult ? (
                  <div className="animate-fade-in space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{analysisResult.detectedSubject}</h4>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-full">
                         {analysisResult.confidence}% {t('confidence')}
                      </span>
                    </div>
                    
                    <div className={`p-3 rounded-lg border-l-4 ${
                      analysisResult.condition.toLowerCase().includes('healthy') ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500'
                    }`}>
                      <p className="font-medium text-slate-800 dark:text-slate-200">Condition: {analysisResult.condition}</p>
                    </div>

                    {analysisResult.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Detected Issues</p>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          {analysisResult.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">AI Recommendations</p>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded text-slate-700 dark:text-slate-300">
                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button 
                      onClick={handleDownloadPDF}
                      className="mt-4 w-full py-2 flex items-center justify-center space-x-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors text-sm shadow-md"
                    >
                      <Download size={16} />
                      <span>{t('download_report')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic">
                    Result will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Insights & Reports */}
          {selectedCrop && <CropInsightsPanel crop={selectedCrop} />}

          {/* Charts Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-6">{t('growth_trends')} ({selectedCrop ? selectedCrop.name : 'Select a field'})</h3>
            <div className="h-64 w-full" ref={chartContainerRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={growthData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 1]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ndvi" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }} 
                  />
                  
                  {/* Interactive Threshold Lines */}
                  <ReferenceLine 
                    y={healthyThreshold} 
                    stroke="#059669" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: 'Healthy', position: 'insideTopLeft', fill: '#059669', fontSize: 11 }}
                    style={{ cursor: 'ns-resize' }}
                    onMouseDown={() => setDraggingThreshold('healthy')}
                  />
                  <ReferenceLine 
                    y={warningThreshold} 
                    stroke="#e11d48" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    label={{ value: 'Critical', position: 'insideBottomLeft', fill: '#e11d48', fontSize: 11 }}
                    style={{ cursor: 'ns-resize' }}
                    onMouseDown={() => setDraggingThreshold('warning')}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-emerald-600 border border-dashed"></div> {t('healthy')} ({healthyThreshold.toFixed(2)})</span>
                <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-rose-500 border border-dashed"></div> {t('critical')} ({warningThreshold.toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* Historical Reports Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="text-blue-500" size={18} />
                {t('history_reports')}
              </h3>
            </div>
            <div className="p-4">
              {reports.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic text-sm">
                  {t('no_reports')}
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${report.type === 'FIELD_SUMMARY' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{report.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {report.type === 'FIELD_SUMMARY' ? t('report_type_field') : t('report_type_analysis')} • {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          {t('view_report')}
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title={t('delete_report')}
                        >
                          <CheckCircle size={16} className="opacity-0" /> {/* Spacer */}
                          <span className="text-xs font-medium">{t('delete_report')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Report Viewer Modal */}
          {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedReport.title}</h3>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <CheckCircle size={20} className="opacity-0" /> {/* Spacer */}
                    <span className="text-xl font-bold">&times;</span>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{new Date(selectedReport.timestamp).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedReport.type === 'FIELD_SUMMARY' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedReport.type === 'FIELD_SUMMARY' ? t('report_type_field') : t('report_type_analysis')}
                    </span>
                  </div>

                  {selectedReport.imageBase64 && (
                    <img src={selectedReport.imageBase64} alt="Report" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
                  )}

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Summary</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selectedReport.summary}</p>
                  </div>

                  {selectedReport.type === 'CROP_ANALYSIS' && selectedReport.details && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Issues Detected</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReport.details.issues.map((issue: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs rounded border border-rose-100 dark:border-rose-800">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recommendations</p>
                        <ul className="space-y-2">
                          {selectedReport.details.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm flex gap-2 text-slate-700 dark:text-slate-300">
                              <CheckCircle size={14} className="text-emerald-500 mt-1 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedReport.type === 'FIELD_SUMMARY' && selectedReport.details && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">NDVI</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.details.ndvi}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Moisture</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.details.soilMoisture}%</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.details.status}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Type</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.details.type}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
