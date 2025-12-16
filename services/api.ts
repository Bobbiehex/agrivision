import { WeatherData, CropData, AnimalData, HealthStatus } from '../types';
import { MOCK_WEATHER } from '../constants';
import { dbService } from './db';

// Simulator utility to jitter values slightly to look "live"
const jitter = (value: number, amount: number) => {
  return value + (Math.random() * amount * 2 - amount);
};

const OPEN_WEATHER_API_KEY = '9200f265ac75700fd702e86f97d025f0';
const FALLBACK_LOCATION = 'Fresno'; // Default if permission denied

const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by this browser."));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
};

/**
 * Cloud API Helper
 * Checks if user has configured an external DB endpoint in Settings.
 */
const getRemoteConfig = () => {
  const url = localStorage.getItem('agri_api_url');
  const key = localStorage.getItem('agri_api_key');
  return url ? { url, key } : null;
};

export const ApiService = {
  /**
   * Fetches real-time weather data from OpenWeatherMap using user geolocation
   */
  getWeather: async (): Promise<WeatherData> => {
    try {
      let url = `https://api.openweathermap.org/data/2.5/weather?q=${FALLBACK_LOCATION}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPEN_WEATHER_API_KEY}`;
      } catch (geoError) {
        console.warn("Location access denied or failed, using default location.", geoError);
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract relevant data
      const weather: WeatherData = {
        location: data.name,
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        condition: data.weather[0].main, 
        windSpeed: parseFloat((data.wind.speed * 3.6).toFixed(1)), 
        rainfall: data.rain ? (data.rain['1h'] || 0) : 0 
      };

      return weather;

    } catch (error) {
      console.warn("Failed to fetch real weather, falling back to simulation:", error);
      
      // Fallback simulation (last resort if API fails completely)
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        ...MOCK_WEATHER,
        temp: parseFloat(jitter(MOCK_WEATHER.temp, 0.5).toFixed(1)),
        windSpeed: parseFloat(jitter(MOCK_WEATHER.windSpeed, 2).toFixed(1)),
        humidity: Math.min(100, Math.max(0, Math.round(jitter(MOCK_WEATHER.humidity, 3)))),
      };
    }
  },

  /**
   * Fetches Crops (Hybrid: Remote -> Local)
   */
  getCrops: async (): Promise<CropData[]> => {
    const remote = getRemoteConfig();
    
    // 1. Try Remote API
    if (remote) {
      try {
        const res = await fetch(`${remote.url}/crops`, {
          headers: remote.key ? { 'Authorization': `Bearer ${remote.key}` } : {}
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Remote DB fetch failed, falling back to local storage.", e);
      }
    }

    // 2. Fallback to Local IndexedDB + Simulation
    const crops = await dbService.getAllCrops();
    
    const updatedCrops = crops.map(crop => ({
      ...crop,
      soilMoisture: Math.round(jitter(crop.soilMoisture, 2)),
      ndvi: parseFloat(Math.min(1, Math.max(0, jitter(crop.ndvi, 0.02))).toFixed(2))
    }));

    return updatedCrops;
  },

  /**
   * Fetches Animals (Hybrid: Remote -> Local)
   */
  getAnimals: async (): Promise<AnimalData[]> => {
    const remote = getRemoteConfig();

    // 1. Try Remote API
    if (remote) {
      try {
        const res = await fetch(`${remote.url}/animals`, {
          headers: remote.key ? { 'Authorization': `Bearer ${remote.key}` } : {}
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("Remote DB fetch failed, falling back to local storage.", e);
      }
    }

    // 2. Fallback to Local IndexedDB + Simulation
    const animals = await dbService.getAllAnimals();
    
    return animals.map(animal => ({
      ...animal,
      temperature: parseFloat(jitter(animal.temperature, 0.2).toFixed(1)),
      activityLevel: Math.random() > 0.8 
        ? ['Resting', 'Grazing', 'Moving'][Math.floor(Math.random() * 3)] as any 
        : animal.activityLevel
    }));
  },

  /**
   * Simulates generating a PDF report
   */
  generateReport: async (type: 'CROP' | 'LIVESTOCK' | 'FULL'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500)); 
    return `Report_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
  },
  
  /**
   * Simulates fetching breeding recommendations
   */
  getBreedingRecommendations: async () => {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return [
        { id: 1, animalId: 'COW-882', confidence: 94, window: '24-48h', note: 'High activity & temp spike detected' },
        { id: 2, animalId: 'GT-102', confidence: 88, window: '3 days', note: 'Hormonal cycle tracking' },
        { id: 3, animalId: 'COW-891', confidence: 75, window: 'Next week', note: 'Preparing for cycle' }
     ];
  },

  /**
   * Saves a new image upload (Hybrid: Remote -> Local)
   */
  saveImage: async (id: string, type: 'CROP' | 'LIVESTOCK' | 'MAP', base64: string) => {
    const remote = getRemoteConfig();

    // 1. Try to Upload to Remote API
    if (remote) {
      try {
         await fetch(`${remote.url}/upload`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 ...(remote.key ? { 'Authorization': `Bearer ${remote.key}` } : {})
             },
             body: JSON.stringify({ id, type, data: base64 })
         });
         console.log("Image saved to remote DB");
      } catch (e) {
         console.error("Remote upload failed, saving locally only.", e);
      }
    }

    // 2. Always save locally for offline access
    await dbService.saveUpload(id, type, base64);
  }
};