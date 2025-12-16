
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

export interface CropData {
  id: string;
  name: string;
  type: string;
  fieldId: string;
  plantingDate: string;
  healthScore: number; // 0-100
  ndvi: number; // -1 to 1
  soilMoisture: number; // %
  lastScanUrl?: string;
  status: HealthStatus;
  alerts: string[];
  history: CropHistoryPoint[]; // Historical data for graphs
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
