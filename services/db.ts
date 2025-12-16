
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChatMessage, CropData, AnimalData } from '../types';
import { MOCK_CROPS, MOCK_ANIMALS } from '../constants';

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
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'agrivision-db';
const DB_VERSION = 1;

class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<AgriDB>>;

  constructor() {
    this.dbPromise = openDB<AgriDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
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
}

export const dbService = new DatabaseService();
