
export enum HealthStatus {
  HEALTHY = 'Healthy',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
  UNKNOWN = 'Unknown'
}

export enum AnalysisType {
  CROP = 'CROP',
  LIVESTOCK = 'LIVESTOCK'
}

export interface CropHistoryPoint {
  date: string; // ISO Date string
  ndvi: number;
}

export interface CropInsights {
  ndre?: number;
  vari?: number;
  growthStage?: string;
  waterStress?: number; // 0-100
  thermalStress?: number; // 0-100
  nutrientStatus?: {
    nitrogen: 'Low' | 'Optimal' | 'High';
    phosphorus: 'Low' | 'Optimal' | 'High';
    potassium: 'Low' | 'Optimal' | 'High';
  };
  yieldForecast?: number; // tons/hectare
  weedDensity?: number; // %
  canopyCover?: number; // %
  pestPressure?: 'Low' | 'Moderate' | 'High';
  diseaseRisk?: 'Low' | 'Moderate' | 'High';
}

export interface Farm {
  id: string;
  name: string;
  location: string; // Country or Region
  coordinates?: GeoLocation;
  totalArea?: number; // Hectares
  ownerId?: string;
  image?: string;
}

export interface CropData {
  id: string;
  name: string;
  type: string;
  fieldId: string;
  farmId: string; // Link to Farm
  plantingDate: string;
  healthScore: number; // 0-100
  ndvi: number; // -1 to 1
  soilMoisture: number; // %
  lastScanUrl?: string;
  status: HealthStatus;
  alerts: string[];
  history: CropHistoryPoint[]; // Historical data for graphs
  insights?: CropInsights;
  location?: GeoLocation; // Specific field location
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface LocationHistoryPoint extends GeoLocation {
  timestamp: string;
}

export interface AnimalData {
  id: string;
  farmId: string; // Link to Farm
  species: string;
  breed?: string; // Specific breed identification
  tagId: string;
  ageMonths: number;
  weightKg: number;
  temperature: number; // Celsius
  activityLevel: 'Resting' | 'Grazing' | 'Moving' | 'Agitated';
  healthScore: number;
  status: HealthStatus;
  lastCheckup: string;
  imageUrl?: string;
  location: GeoLocation;
  locationHistory: LocationHistoryPoint[];
}

export interface WeatherData {
  location: string;
  temp: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  rainfall: number;
}

export interface AIAnalysisResult {
  detectedSubject: string;
  condition: string;
  confidence: number;
  issues: string[];
  recommendations: string[];
  rawAnalysis: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  type: 'CROP_ANALYSIS' | 'FIELD_SUMMARY' | 'LIVESTOCK_ANALYSIS';
  title: string;
  summary: string;
  details: any; 
  imageBase64?: string;
  timestamp: number;
}
