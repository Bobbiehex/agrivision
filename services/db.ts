
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChatMessage, CropData, AnimalData, Report, Farm } from '../types';
import { MOCK_CROPS, MOCK_ANIMALS, MOCK_FARMS } from '../constants';

interface AgriDB extends DBSchema {
  chats: {
    key: string;
    value: ChatMessage;
    indexes: { 'by-timestamp': Date };
  };
  uploads: {
    key: string;
    value: {
      id: string;
      type: 'CROP' | 'LIVESTOCK' | 'MAP';
      dataUrl: string; // Base64 or Blob URL
      timestamp: number;
    };
  };
  crops: {
    key: string;
    value: CropData;
  };
  animals: {
    key: string;
    value: AnimalData;
  };
  farms: {
    key: string;
    value: Farm;
  };
  settings: {
    key: string;
    value: any;
  };
  reports: {
    key: string;
    value: Report;
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'agrivision-db';
const DB_VERSION = 3; // Incremented version

class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<AgriDB>>;

  constructor() {
    this.dbPromise = openDB<AgriDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Chat Store
        if (!db.objectStoreNames.contains('chats')) {
          const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
          chatStore.createIndex('by-timestamp', 'timestamp');
        }

        // Uploads Store
        if (!db.objectStoreNames.contains('uploads')) {
          db.createObjectStore('uploads', { keyPath: 'id' });
        }

        // Crops Store
        if (!db.objectStoreNames.contains('crops')) {
          const cropStore = db.createObjectStore('crops', { keyPath: 'id' });
          // Seed initial data
          MOCK_CROPS.forEach(crop => cropStore.put(crop));
        }

        // Animals Store
        if (!db.objectStoreNames.contains('animals')) {
          const animalStore = db.createObjectStore('animals', { keyPath: 'id' });
          // Seed initial data
          MOCK_ANIMALS.forEach(animal => animalStore.put(animal));
        }
        
        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Reports Store
        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('by-timestamp', 'timestamp');
        }

        // Farms Store
        if (!db.objectStoreNames.contains('farms')) {
          const farmStore = db.createObjectStore('farms', { keyPath: 'id' });
          MOCK_FARMS.forEach(farm => farmStore.put(farm));
        }
      },
    });
  }

  // --- Chat Operations ---
  async saveChatMessage(message: ChatMessage) {
    const db = await this.dbPromise;
    await db.put('chats', message);
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    const db = await this.dbPromise;
    return (await db.getAllFromIndex('chats', 'by-timestamp'));
  }

  // --- Upload Operations ---
  async saveUpload(id: string, type: 'CROP' | 'LIVESTOCK' | 'MAP', dataUrl: string) {
    const db = await this.dbPromise;
    await db.put('uploads', {
      id,
      type,
      dataUrl,
      timestamp: Date.now()
    });
  }

  async getUpload(id: string) {
    const db = await this.dbPromise;
    return await db.get('uploads', id);
  }

  // --- Crop Operations ---
  async getAllCrops(): Promise<CropData[]> {
    const db = await this.dbPromise;
    const crops = await db.getAll('crops');
    if (crops.length === 0) return MOCK_CROPS; // Fallback
    return crops;
  }

  async updateCrop(crop: CropData) {
    const db = await this.dbPromise;
    await db.put('crops', crop);
  }

  // --- Animal Operations ---
  async getAllAnimals(): Promise<AnimalData[]> {
    const db = await this.dbPromise;
    const animals = await db.getAll('animals');
    if (animals.length === 0) return MOCK_ANIMALS; // Fallback
    return animals;
  }

  async updateAnimal(animal: AnimalData) {
    const db = await this.dbPromise;
    await db.put('animals', animal);
  }

  // --- Report Operations ---
  async saveReport(report: Report) {
    const db = await this.dbPromise;
    await db.put('reports', report);
  }

  async getAllReports(): Promise<Report[]> {
    const db = await this.dbPromise;
    return await db.getAllFromIndex('reports', 'by-timestamp');
  }

  async deleteReport(id: string) {
    const db = await this.dbPromise;
    await db.delete('reports', id);
  }

  // --- Farm Operations ---
  async getAllFarms(): Promise<Farm[]> {
    const db = await this.dbPromise;
    const farms = await db.getAll('farms');
    if (farms.length === 0) return MOCK_FARMS;
    return farms;
  }

  async updateFarm(farm: Farm) {
    const db = await this.dbPromise;
    await db.put('farms', farm);
  }

  async getFarm(id: string): Promise<Farm | undefined> {
    const db = await this.dbPromise;
    return await db.get('farms', id);
  }
}

export const dbService = new DatabaseService();
