
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Activity, 
  Thermometer, 
  Video,
  Camera,
  X,
  HeartPulse,
  Power,
  Scan,
  Loader2,
  FileText,
  Flame,
  Eye,
  Map as MapIcon,
  Navigation,
  Crosshair,
  LocateFixed,
  Settings,
  Plus,
  Trash2,
  VideoOff,
  MoreVertical,
  Save,
  RefreshCw,
  Users,
  Stethoscope,
  Upload,
  CheckCircle,
  Download
} from 'lucide-react';
import { AnimalData, HealthStatus, AIAnalysisResult, GeoLocation } from '../types';
import { analyzeLivestockFrame } from '../services/geminiService';
import { ApiService } from '../services/api';
import { ExportService } from '../services/exportService';
import { dbService } from '../services/db';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

// @ts-ignore
import * as tf from '@tensorflow/tfjs';
// @ts-ignore
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Configuration
const LIVE_REPORT_INTERVAL_MS = 30000; // Auto-analyze live feeds every 30 seconds
const CONFIDENCE_THRESHOLD = 0.70; // Increased to 0.70 to minimize false positives
const ISOLATION_THRESHOLD_FACTOR = 0.25; // % of canvas width to consider "far away" from herd center

interface ExtendedAnimalData extends AnimalData {
  deviceId?: string; // Camera Device ID
  isConfigured: boolean;
  lastAnalysisTime?: number;
  manualBreed?: string;
  manualWeight?: number;
  manualTemp?: number;
}

interface TrackedObject {
  bbox: [number, number, number, number];
  class: string;
  score: number;
  isIsolated?: boolean;
}

interface LivestockDashboardProps {
    initialAnimalId?: string;
    farmId: string | null;
}

// Internal Component: Individual Live Animal Feed
const LiveAnimalFeed: React.FC<{
  animal: ExtendedAnimalData;
  viewMode: 'NORMAL' | 'THERMAL' | 'MAP';
  onAnalysisUpdate: (id: string, result: AIAnalysisResult) => void;
  onError: (id: string, error: string) => void;
}> = ({ animal, viewMode, onAnalysisUpdate, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [model, setModel] = useState<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentDetectionsRef = useRef<string[]>([]); // Track current detections for Gemini hint
  const [animalCount, setAnimalCount] = useState(0);
  const { t } = useLanguage();

  // Load TF Model locally for bounding boxes / thermal heatmap
  useEffect(() => {
    const loadModel = async () => {
        try {
            await tf.ready();
            const loaded = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
            setModel(loaded);
        } catch (e) {
            console.error("TF Load Error", e);
        }
    };
    loadModel();
  }, []);

  // Start Camera
  useEffect(() => {
    const startFeed = async () => {
      if (!animal.deviceId) return;
      
      // Stop previous stream
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
      }

      try {
        // Handle "Default" selection
        const constraints: MediaStreamConstraints = {
            video: animal.deviceId === 'default' 
                ? { facingMode: 'environment' }
                : { deviceId: { exact: animal.deviceId } }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Play error", e));
        }
      } catch (e) {
        console.error("Failed to start animal feed", e);
        onError(animal.id, "Camera unavailable. Check permissions.");
      }
    };
    startFeed();

    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };
  }, [animal.deviceId, animal.id, onError]);

  // Detection & Rendering Loop
  const detectFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !model || videoRef.current.readyState !== 4) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }

    // Detect objects
    const predictions = await model.detect(video);
    
    // STRICT FILTERING: Only farm animals
    let validPredictions: TrackedObject[] = predictions.filter((p: any) => 
        ['cow', 'sheep', 'horse', 'dog', 'cat', 'bird'].includes(p.class) && 
        p.score > CONFIDENCE_THRESHOLD
    );

    setAnimalCount(validPredictions.length);

    // --- ISOLATION LOGIC ---
    // 1. Calculate centroids
    const centers = validPredictions.map(p => ({
        x: p.bbox[0] + p.bbox[2] / 2,
        y: p.bbox[1] + p.bbox[3] / 2
    }));

    // 2. Calculate Herd Center (Mean X, Y)
    let herdCenterX = 0;
    let herdCenterY = 0;
    if (centers.length > 1) {
        herdCenterX = centers.reduce((sum, c) => sum + c.x, 0) / centers.length;
        herdCenterY = centers.reduce((sum, c) => sum + c.y, 0) / centers.length;
        
        const isolationDistPixels = canvas.width * ISOLATION_THRESHOLD_FACTOR;

        // 3. Flag Isolated Animals
        validPredictions = validPredictions.map((pred, i) => {
            const dx = centers[i].x - herdCenterX;
            const dy = centers[i].y - herdCenterY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // If distance from center is large, mark isolated
            return { ...pred, isIsolated: distance > isolationDistPixels };
        });
    }

    // Update ref for Gemini to use as hint. Pass "Isolation" info to AI.
    currentDetectionsRef.current = validPredictions.map(p => 
        p.isIsolated ? `${p.class} (ISOLATED from herd)` : p.class
    );

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Overlays
    validPredictions.forEach(pred => {
        const [x, y, w, h] = pred.bbox;

        if (viewMode === 'THERMAL') {
            // Draw Heatmap Blob
            const centerX = x + w / 2;
            const centerY = y + h / 2;
            const radius = Math.max(w, h) * 0.8;
            
            // Thermal Gradient: Red (Hot) -> Yellow -> Transparent
            // SIMULATION: If isolated, increase "heat" intensity to simulate fever
            const startColor = pred.isIsolated ? 'rgba(255, 0, 0, 0.95)' : 'rgba(255, 50, 50, 0.9)';

            const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
            gradient.addColorStop(0, startColor);          // High Temp Center
            gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.5)'); // Warm Radiating
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');         // Ambient

            ctx.fillStyle = gradient;
            ctx.fillRect(x - w, y - h, w * 3, h * 3); 
            
            // Add Simulated Temperature Label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            
            // SIMULATION: Base temp ~38C. Add random variance. If isolated, add fever spike (+1.5C).
            const baseTemp = 38 + Math.random() * 1.5;
            const temp = pred.isIsolated ? baseTemp + 1.5 : baseTemp; 
            
            const simulatedTemp = temp.toFixed(1);
            
            ctx.shadowColor = "black";
            ctx.shadowBlur = 4;
            ctx.fillText(`${simulatedTemp}°C`, x, y - 5);
            ctx.shadowBlur = 0;

        } else {
            // Normal Bounding Box
            // If isolated, use red color, else green
            const color = pred.isIsolated ? '#f43f5e' : '#10b981';

            ctx.strokeStyle = color;
            ctx.lineWidth = pred.isIsolated ? 4 : 2;
            ctx.strokeRect(x, y, w, h);

            // Label
            ctx.fillStyle = color;
            let label = `${pred.class.toUpperCase()} ${Math.round(pred.score * 100)}%`;
            if (pred.isIsolated) label += " [ISOLATED]";
            
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(x, y - 20, textWidth + 10, 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Inter';
            ctx.fillText(label, x + 5, y - 6);
        }
    });

    // Draw Herd Center Point if multiple animals
    if (centers.length > 1 && viewMode !== 'THERMAL') {
        ctx.beginPath();
        ctx.arc(herdCenterX, herdCenterY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    // If Thermal Mode, overlay a blue tint on the whole canvas (using composite mode to keep heat spots bright)
    if (viewMode === 'THERMAL') {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'rgba(0, 20, 80, 0.6)'; // Deep blue cold background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }

  }, [model, viewMode]);

  useEffect(() => {
    let animationId: number;
    const loop = async () => {
        await detectFrame();
        animationId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationId);
  }, [detectFrame]);

  // Auto-Analysis Interval (Gemini)
  useEffect(() => {
    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;
        
        setIsScanning(true);
        try {
            // Use a temporary canvas to capture the raw video frame (without overlays)
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = videoRef.current.videoWidth;
            tempCanvas.height = videoRef.current.videoHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            
            const base64 = tempCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            
            // Get hints from TFJS (now includes isolation status)
            const detectedHints = currentDetectionsRef.current;

            // Analyze with Gemini, passing TFJS hints to help with Breed ID and Isolation
            const result = await analyzeLivestockFrame(base64, detectedHints);
            onAnalysisUpdate(animal.id, result);
        } catch (e) {
            console.warn("Auto-analysis failed", e);
        } finally {
            setIsScanning(false);
        }
    };

    // Initial scan after delay
    const initialTimer = setTimeout(captureAndAnalyze, 3000);
    // Periodic scan
    const interval = setInterval(captureAndAnalyze, LIVE_REPORT_INTERVAL_MS);

    return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
    };
  }, [animal.id, onAnalysisUpdate]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
        {/* CSS Filter for Thermal Effect on the video element itself */}
        <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover" 
            style={{ 
                filter: viewMode === 'THERMAL' ? 'grayscale(100%) contrast(1.2) brightness(0.8)' : 'none' 
            }}
        />
        
        {/* Canvas for Overlays (Heatmap / Bounding Boxes) */}
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
            style={{ mixBlendMode: viewMode === 'THERMAL' ? 'screen' : 'normal' }}
        />
        
        {/* Live Status Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/80 text-white backdrop-blur-sm z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Live</span>
        </div>

        {/* Count Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-sm z-10">
            <Users size={12} className="text-emerald-400" />
            <span className="text-[10px] font-medium">{t('animals_in_view')}: {animalCount}</span>
        </div>

        {/* Scanning Indicator */}
        {isScanning && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-sm z-10">
                <Loader2 size={12} className="animate-spin text-emerald-400" />
                <span className="text-[10px] font-medium">AI Analysis...</span>
            </div>
        )}
    </div>
  );
};

export const LivestockDashboard: React.FC<LivestockDashboardProps> = ({ initialAnimalId, farmId }) => {
  const { addNotification } = useNotifications();
  const { t } = useLanguage();
  
  // -- State --
  const [allAnimals, setAllAnimals] = useState<ExtendedAnimalData[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  
  const animals = useMemo(() => {
    if (!farmId) return [];
    return allAnimals.filter(a => a.farmId === farmId);
  }, [allAnimals, farmId]);
  
  // UI State
  const [viewMode, setViewMode] = useState<'NORMAL' | 'THERMAL' | 'MAP'>('NORMAL');
  const [analysisResults, setAnalysisResults] = useState<Record<string, AIAnalysisResult>>({});
  const [refreshDevicesTrigger, setRefreshDevicesTrigger] = useState(0);
  const [reports, setReports] = useState<any[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Vet Analysis State
  const [vetImage, setVetImage] = useState<string | null>(null);
  const [vetAnalyzing, setVetAnalyzing] = useState(false);
  const [vetResult, setVetResult] = useState<AIAnalysisResult | null>(null);
  const vetFileInputRef = useRef<HTMLInputElement>(null);
  
  // Configuration Modal
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({
      name: '',
      deviceId: '',
      weight: 0,
      temp: 0,
      breed: ''
  });

  // Map Refs
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const FARM_CENTER = { lat: 36.7378, lng: -119.7871 };
  const MAP_ZOOM_FACTOR = 10000;

  // -- Initialization --
  useEffect(() => {
    loadReports();
    // Load devices
    const getDevices = async () => {
        try {
            // Need to ask for permission to get labels
            await navigator.mediaDevices.getUserMedia({ video: true }); 
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(d => d.kind === 'videoinput');
            setVideoDevices(cameras);
        } catch (e) {
            console.warn("Could not list video devices or permission denied", e);
            // Even if failed, we can offer 'default'
            setVideoDevices([]);
        }
    };
    getDevices();

    // Load saved slots from DB
    const loadSlots = async () => {
        try {
            const saved = await dbService.getAllAnimals();
            setAllAnimals(saved.map(a => ({ ...a, isConfigured: !!(a as any).deviceId })));
        } catch (e) {
            console.error("Failed to load slots", e);
        }
    };
    loadSlots();
  }, [refreshDevicesTrigger]);

  // Save slots on change
  useEffect(() => {
      if (allAnimals.length > 0) {
          allAnimals.forEach(a => {
              dbService.updateAnimal(a);
          });
      }
  }, [allAnimals]);

  // Scroll to initial animal if ID matches
  useEffect(() => {
     if (initialAnimalId && animals.length > 0) {
        const el = document.getElementById(`animal-${initialAnimalId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-emerald-500');
            setTimeout(() => {
                el.classList.remove('ring-4', 'ring-emerald-500');
            }, 3000);
        }
     }
  }, [initialAnimalId, animals]);

  // -- Handlers --

  const handleAddSlot = () => {
      if (!farmId) return;
      // Simulate some history for new slots for demonstration
      const startLat = FARM_CENTER.lat + (Math.random() - 0.5) * 0.002;
      const startLng = FARM_CENTER.lng + (Math.random() - 0.5) * 0.002;
      
      const newSlot: ExtendedAnimalData = {
          id: Date.now().toString(),
          farmId: farmId,
          tagId: 'New Slot',
          species: 'Unknown',
          ageMonths: 0,
          weightKg: 0,
          temperature: 0,
          activityLevel: 'Resting',
          healthScore: 0,
          status: HealthStatus.UNKNOWN,
          lastCheckup: new Date().toISOString(),
          location: { lat: startLat, lng: startLng },
          locationHistory: [
              { lat: startLat - 0.0002, lng: startLng - 0.0002, timestamp: new Date().toISOString() },
              { lat: startLat - 0.0001, lng: startLng - 0.0001, timestamp: new Date().toISOString() },
              { lat: startLat, lng: startLng, timestamp: new Date().toISOString() }
          ],
          isConfigured: false
      };
      setAllAnimals(prev => [...prev, newSlot]);
  };

  const handleDeleteSlot = (id: string) => {
      if (confirm("Are you sure you want to remove this camera slot?")) {
        setAllAnimals(prev => prev.filter(a => a.id !== id));
        addNotification({ title: 'Slot Removed', message: 'Camera slot deleted.', type: 'INFO' });
      }
  };

  const openConfig = (animal: ExtendedAnimalData) => {
      setConfiguringId(animal.id);
      setConfigForm({
          name: animal.tagId === 'New Slot' ? '' : animal.tagId,
          deviceId: animal.deviceId || '',
          weight: animal.manualWeight || 0,
          temp: animal.manualTemp || 38.0,
          breed: animal.manualBreed || ''
      });
      // Trigger device refresh when opening config to ensure latest list
      setRefreshDevicesTrigger(prev => prev + 1);
  };
  const saveConfig = () => {
      if (!configuringId) return;
      
      setAllAnimals(prev => prev.map(a => {
          if (a.id === configuringId) {
              return {
                  ...a,
                  tagId: configForm.name || 'Unnamed',
                  deviceId: configForm.deviceId,
                  manualWeight: configForm.weight,
                  manualTemp: configForm.temp,
                  manualBreed: configForm.breed,
                  // If we have manual data, use it as baseline
                  weightKg: configForm.weight,
                  temperature: configForm.temp,
                  breed: configForm.breed,
                  isConfigured: !!configForm.deviceId,
                  status: HealthStatus.UNKNOWN 
              };
          }
          return a;
      }));
      setConfiguringId(null);
      addNotification({ title: 'Slot Configured', message: 'Camera and metadata updated.', type: 'SUCCESS' });
  };

  const handleLiveAnalysisUpdate = (id: string, result: AIAnalysisResult) => {
     setAnalysisResults(prev => ({ ...prev, [id]: result }));
     
     // Update the animal state with AI derived data
     setAllAnimals(prev => prev.map(a => {
         if (a.id === id) {
             let newStatus = HealthStatus.HEALTHY;
             if (result.condition.toLowerCase().includes('warning')) newStatus = HealthStatus.WARNING;
             if (result.condition.toLowerCase().includes('critical')) newStatus = HealthStatus.CRITICAL;
 
             // Extract species/breed from AI if valid
             let derivedBreed = a.manualBreed;
             if (result.detectedSubject && result.detectedSubject !== 'Unknown Animal' && result.confidence > 70) {
                 derivedBreed = result.detectedSubject; // e.g. "Holstein Cow"
             }
 
             return {
                 ...a,
                 status: newStatus,
                 healthScore: result.confidence,
                 breed: derivedBreed, 
                 activityLevel: 'Grazing', // Placeholder, could extract from result.rawAnalysis text
                 lastAnalysisTime: Date.now()
             };
         }
         return a;
     }));
  };


  const handleFeedError = (id: string, error: string) => {
     addNotification({ title: 'Camera Error', message: error, type: 'WARNING' });
  };

  const loadReports = async () => {
    try {
        const data = await dbService.getAllReports();
        setReports(data.filter((r: any) => r.type === 'LIVESTOCK_SUMMARY' || (r.type === 'CROP_ANALYSIS' && r.title.includes('Veterinary'))).reverse());
    } catch (e) {
        console.error("Failed to load reports", e);
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

  const handleExportData = () => {
    const dataToExport = animals.map(a => ({
        Tag: a.tagId,
        Breed: a.breed || a.species,
        Weight: a.weightKg,
        Temp: a.temperature,
        Location: `${a.location?.lat.toFixed(5)}, ${a.location?.lng.toFixed(5)}`,
        Status: a.status,
        Timestamp: new Date().toISOString()
    }));
    ExportService.exportToCSV(dataToExport, 'livestock_metrics_live.csv');
  };

  // -- Vet Analysis Handlers --
  const handleVetImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setVetImage(result);
        setVetResult(null); 
        // Save to DB
        await ApiService.saveImage(`vet-analysis-${Date.now()}`, 'LIVESTOCK', result);
        addNotification({
            title: 'Image Uploaded',
            message: 'Animal image ready for veterinary analysis.',
            type: 'INFO'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVetUpload = () => vetFileInputRef.current?.click();

  const runVetAnalysis = async () => {
    if (!vetImage) return;
    setVetAnalyzing(true);
    addNotification({ title: 'Analysis Started', message: 'Processing with AI Veterinarian...', type: 'INFO' });
    
    try {
        const result = await analyzeLivestockFrame(vetImage.split(',')[1]);
        setVetResult(result);
        
        // Critical Alert Logic
        if (result.condition.toLowerCase().includes('critical')) {
          addNotification({ 
            title: 'Critical Veterinary Alert', 
            message: `Detected ${result.detectedSubject} in critical condition.`, 
            type: 'CRITICAL' 
          });
        } else if (result.condition.toLowerCase().includes('warning')) {
          addNotification({ 
            title: 'Veterinary Warning', 
            message: `Detected ${result.detectedSubject} issues.`, 
            type: 'WARNING' 
          });
        } else {
           addNotification({ 
            title: 'Diagnosis Complete', 
            message: `Subject: ${result.detectedSubject}`, 
            type: 'SUCCESS' 
          });
        }
        
    } catch (e) {
        addNotification({ title: 'Analysis Failed', message: 'Could not process image.', type: 'WARNING' });
    } finally {
        setVetAnalyzing(false);
    }
  };

  const handleDownloadVetReport = async () => {
    if (vetResult && vetImage) {
        await ExportService.generateAnalysisPDF(vetResult, vetImage, `Veterinary Diagnosis: ${vetResult.detectedSubject}`);
        addNotification({ title: 'Report Downloaded', message: 'PDF Veterinary report generated.', type: 'SUCCESS' });
        loadReports();
    }
  };

  // -- Render Map --
  useEffect(() => {
      if (viewMode !== 'MAP' || !mapCanvasRef.current) return;
      
      const canvas = mapCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 450;

      // Draw Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
      for (let i = 0; i < canvas.height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

      // Draw Animals (Only Configured)
      animals.forEach(animal => {
          if (!animal.isConfigured) return;

          // -- DRAW MOVEMENT HISTORY TRAIL --
          if (animal.locationHistory && animal.locationHistory.length > 0) {
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; // Faint Emerald
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);

              // Start from oldest point
              const startX = canvas.width / 2 + (animal.locationHistory[0].lng - FARM_CENTER.lng) * MAP_ZOOM_FACTOR;
              const startY = canvas.height / 2 - (animal.locationHistory[0].lat - FARM_CENTER.lat) * MAP_ZOOM_FACTOR;
              ctx.moveTo(startX, startY);

              for (let i = 1; i < animal.locationHistory.length; i++) {
                  const hx = canvas.width / 2 + (animal.locationHistory[i].lng - FARM_CENTER.lng) * MAP_ZOOM_FACTOR;
                  const hy = canvas.height / 2 - (animal.locationHistory[i].lat - FARM_CENTER.lat) * MAP_ZOOM_FACTOR;
                  ctx.lineTo(hx, hy);
              }
              
              // Connect last point to current
              const currX = canvas.width / 2 + (animal.location.lng - FARM_CENTER.lng) * MAP_ZOOM_FACTOR;
              const currY = canvas.height / 2 - (animal.location.lat - FARM_CENTER.lat) * MAP_ZOOM_FACTOR;
              ctx.lineTo(currX, currY);
              
              ctx.stroke();
              ctx.setLineDash([]); // Reset
          }

          // Draw Current Position
          const x = canvas.width / 2 + (animal.location.lng - FARM_CENTER.lng) * MAP_ZOOM_FACTOR;
          const y = canvas.height / 2 - (animal.location.lat - FARM_CENTER.lat) * MAP_ZOOM_FACTOR;

          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = animal.status === HealthStatus.HEALTHY ? '#10b981' : animal.status === HealthStatus.UNKNOWN ? '#94a3b8' : '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.shadowBlur = 0;
          
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 11px Inter';
          ctx.fillText(animal.tagId, x + 10, y + 4);
      });

      // HQ Center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText("HQ", cx, cy + 20);

  }, [viewMode, animals]);

  // Derived Stats
  const activeCount = animals.filter(a => a.isConfigured && a.deviceId).length;
  const alertCount = animals.filter(a => a.status === HealthStatus.WARNING || a.status === HealthStatus.CRITICAL).length;
  
  const healthData = useMemo(() => {
     return animals
        .filter(a => a.isConfigured)
        .map(a => ({ name: a.tagId, score: a.healthScore }));
  }, [animals]);

  return (
    <div ref={dashboardRef} className="space-y-6 relative pb-20">
      
      {/* Configuration Modal */}
      {configuringId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-900 text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Settings size={18} /> Configure Slot
                    </h3>
                    <button onClick={() => setConfiguringId(null)}><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4 bg-white dark:bg-slate-800">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">Slot Name / Tag ID</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                            placeholder="e.g. COW-101"
                            value={configForm.name}
                            onChange={e => setConfigForm({...configForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">Camera Source</label>
                        <select 
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                            value={configForm.deviceId}
                            onChange={e => setConfigForm({...configForm, deviceId: e.target.value})}
                        >
                            <option value="">-- Select Camera --</option>
                            <option value="default">Default System Camera</option>
                            {videoDevices.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}...`}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 font-medium">
                        <strong>Note:</strong> Real-time data (Weight, Temp) requires manual entry or sensor integration. The AI will detect health status and behavior from the video.
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">Breed (Manual)</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                placeholder="e.g. Angus"
                                value={configForm.breed}
                                onChange={e => setConfigForm({...configForm, breed: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">Weight (kg)</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-700"
                                placeholder="0"
                                value={configForm.weight}
                                onChange={e => setConfigForm({...configForm, weight: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={saveConfig}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Save size={18} /> Save Configuration
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('livestock_monitoring')}</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time surveillance & AI health analysis</p>
        </div>
        <div className="flex items-center gap-2">
             <button onClick={() => setViewMode(viewMode === 'MAP' ? 'NORMAL' : 'MAP')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${viewMode === 'MAP' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>
                 <MapIcon size={16} /> {viewMode === 'MAP' ? 'Hide Map' : 'GPS Map'}
             </button>
             <button onClick={() => setViewMode(viewMode === 'THERMAL' ? 'NORMAL' : 'THERMAL')} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${viewMode === 'THERMAL' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>
                 <Flame size={16} /> {viewMode === 'THERMAL' ? 'Optical View' : 'Thermal View'}
             </button>
             <button onClick={handleAddSlot} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm">
                <Plus size={16} /> Add Camera
            </button>
            <button 
                onClick={async () => {
                    setGeneratingReport(true);
                    addNotification({ title: 'Generating Report', message: 'Capturing herd data...', type: 'INFO' });
                    try {
                        await ExportService.generateFieldReportPDF(
                            { name: 'Livestock Herd', type: 'Herd Summary', fieldId: 'HERD-01' } as any,
                            dashboardRef.current,
                            chartRef.current
                        );
                        addNotification({ title: 'Report Ready', message: 'Herd summary report downloaded.', type: 'SUCCESS' });
                        loadReports();
                    } catch (e) {
                        console.error("Report failed", e);
                    } finally {
                        setGeneratingReport(false);
                    }
                }}
                disabled={generatingReport}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors shadow-sm"
            >
                {generatingReport ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                <span>Report</span>
            </button>
            <button onClick={handleExportData} className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                <FileText size={18} />
            </button>
        </div>
      </div>

      {/* Map Overlay (Full Width) */}
      {viewMode === 'MAP' && (
           <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700 relative h-[500px] animate-fade-in">
                <canvas ref={mapCanvasRef} className="w-full h-full block" />
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur p-4 rounded-lg text-slate-300 text-sm border border-slate-600">
                    <p className="font-bold text-white mb-1">GPS Tracking Active</p>
                    <p>Showing locations for {activeCount} active devices.</p>
                </div>
           </div>
      )}

      {/* AI Veterinary Diagnosis Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Stethoscope className="text-rose-500" size={18} />
                {t('ai_vet')}
              </h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div 
                    onClick={triggerVetUpload}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-700/50 relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {vetImage ? (
                    <img 
                      src={vetImage} 
                      alt="Veterinary Analysis" 
                      className="absolute inset-0 w-full h-full object-cover rounded-lg" 
                    />
                  ) : (
                    <div className="text-center pointer-events-none">
                      <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('upload_animal_instruction')}</p>
                    </div>
                  )}
                  <input 
                    ref={vetFileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleVetImageUpload}
                    className="hidden"
                  />
                </div>
                <button 
                  onClick={runVetAnalysis}
                  disabled={!vetImage || vetAnalyzing}
                  className={`w-full py-2 rounded-lg font-medium flex justify-center items-center space-x-2 ${
                    !vetImage ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed' :
                    vetAnalyzing ? 'bg-indigo-400 text-white cursor-wait' :
                    'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {vetAnalyzing ? (
                    <span>Analyzing...</span>
                  ) : (
                    <>
                      <Scan size={16} />
                      <span>Analyze Health</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {vetResult ? (
                  <div className="animate-fade-in space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{vetResult.detectedSubject}</h4>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-full">
                         {vetResult.confidence}% {t('confidence')}
                      </span>
                    </div>
                    
                    <div className={`p-3 rounded-lg border-l-4 ${
                      vetResult.condition.toLowerCase().includes('healthy') ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500'
                    }`}>
                      <p className="font-medium text-slate-800 dark:text-slate-200">Condition: {vetResult.condition}</p>
                    </div>

                    {vetResult.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Detected Issues</p>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                          {vetResult.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Recommendations</p>
                      <ul className="space-y-2">
                        {vetResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded text-slate-700 dark:text-slate-300">
                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button 
                      onClick={handleDownloadVetReport}
                      className="mt-4 w-full py-2 flex items-center justify-center space-x-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors text-sm shadow-md"
                    >
                      <Download size={16} />
                      <span>{t('download_report')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    Result will appear here...
                  </div>
                )}
              </div>
            </div>
      </div>

      {/* Camera Grid */}
      {animals.length === 0 ? (
          <div className="text-center py-20 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
              <Camera size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">No Cameras Configured</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Add a slot to connect your webcam or IP camera.</p>
              <button onClick={handleAddSlot} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                  Add First Camera
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {animals.map(animal => (
                <div key={animal.id} id={`animal-${animal.id}`} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-md transition-shadow transition-all duration-300">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${animal.isConfigured && animal.deviceId ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            <h3 className="font-bold text-slate-800 dark:text-white">{animal.tagId}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => openConfig(animal)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded transition-colors" title="Configure">
                                <Settings size={16} />
                            </button>
                            <button onClick={() => handleDeleteSlot(animal.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900 rounded transition-colors" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Feed Area */}
                    <div className="aspect-video bg-slate-900 relative">
                        {animal.isConfigured && animal.deviceId ? (
                            <LiveAnimalFeed 
                                animal={animal} 
                                viewMode={viewMode}
                                onAnalysisUpdate={handleLiveAnalysisUpdate} 
                                onError={handleFeedError} 
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100 dark:bg-slate-800">
                                <VideoOff size={32} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">No Camera Added</p>
                                <button onClick={() => openConfig(animal)} className="mt-3 px-4 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 text-indigo-600">
                                    + Connect Camera
                                </button>
                            </div>
                        )}
                        
                        {/* Thermal Overlay Label */}
                        {animal.isConfigured && animal.deviceId && viewMode === 'THERMAL' && (
                             <div className="absolute top-2 right-12 opacity-80 transition-opacity">
                                <div className="bg-rose-600/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                                    <Flame size={10} /> Thermal Sim
                                </div>
                             </div>
                        )}
                    </div>

                    {/* Stats & AI Data */}
                    {animal.isConfigured ? (
                        <div className="p-4 space-y-3">
                            {/* Analysis Result Box */}
                            {analysisResults[animal.id] ? (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase">AI Detected</span>
                                        <span className="text-[10px] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 rounded border border-indigo-200 dark:border-indigo-700">{analysisResults[animal.id].confidence}% Conf.</span>
                                    </div>
                                    <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">{analysisResults[animal.id].condition}</p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">{analysisResults[animal.id].issues[0] || 'Monitoring...'}</p>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic text-center py-2">
                                    Waiting for AI analysis...
                                </div>
                            )}

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded border border-slate-100 dark:border-slate-600">
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Temp</div>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{animal.temperature > 0 ? `${animal.temperature}°C` : '--'}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded border border-slate-100 dark:border-slate-600">
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Weight</div>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{animal.weightKg > 0 ? `${animal.weightKg}kg` : '--'}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded border border-slate-100 dark:border-slate-600">
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Breed</div>
                                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate" title={animal.breed || animal.species}>{animal.breed || '--'}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-sm text-slate-400">Configure this slot to view data.</p>
                        </div>
                    )}
                </div>
            ))}
          </div>
      )}

      {/* Sidebar / Stats Footer */}
      {animals.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">System Status</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Active Cameras</span>
                          <span className="font-medium text-slate-900 dark:text-slate-200">{activeCount} / {animals.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Alerts</span>
                          <span className="font-medium text-amber-600">{alertCount}</span>
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
                            <div className={`p-2 rounded-lg ${report.type === 'LIVESTOCK_SUMMARY' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{report.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(report.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                              title={t('delete_report')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-48">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">Health Distribution (Active Slots)</h3>
                   <div className="h-full w-full" ref={chartRef}>
                   <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={healthData}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                            <Tooltip 
                                cursor={{fill: 'transparent'}} 
                                contentStyle={{borderRadius: '8px', border:'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff'}} 
                            />
                            <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
