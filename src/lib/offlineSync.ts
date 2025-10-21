import { openDB, IDBPDatabase } from 'idb';
import api from './api';

interface AttendanceQueue {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface LocationQueue {
  id: string;
  dispatch_id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  synced: boolean;
}

interface RequestQueue {
  id: string;
  url: string;
  method: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface BiometricCache {
  worker_id: string;
  face_encoding?: string;
  fingerprint_template?: string;
  timestamp: number;
}

let db: IDBPDatabase | null = null;
let dbInitialized = false;

export async function initOfflineDB(): Promise<IDBPDatabase | null> {
  // Return existing DB if already initialized
  if (db && dbInitialized) return db;

  try {
    db = await openDB('relishagro-offline', 1, {
      upgrade(database) {
        // Attendance queue
        if (!database.objectStoreNames.contains('attendance')) {
          const attStore = database.createObjectStore('attendance', { keyPath: 'id' });
          attStore.createIndex('by-synced', 'synced');
        }

        // GPS locations queue
        if (!database.objectStoreNames.contains('locations')) {
          const locationStore = database.createObjectStore('locations', { keyPath: 'id' });
          locationStore.createIndex('by-dispatch', 'dispatch_id');
          locationStore.createIndex('by-synced', 'synced');
        }

        // Generic API requests queue
        if (!database.objectStoreNames.contains('requests')) {
          database.createObjectStore('requests', { keyPath: 'id' });
        }

        // Biometric data cache
        if (!database.objectStoreNames.contains('biometrics')) {
          database.createObjectStore('biometrics', { keyPath: 'worker_id' });
        }
      },
    });

    dbInitialized = true;
    console.log('✅ Offline database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize offline database:', error);
    dbInitialized = false;
    return null;
  }
}

// Safe getter for database - returns null if not initialized
async function getDB(): Promise<IDBPDatabase | null> {
  if (!db) {
    return await initOfflineDB();
  }
  return db;
}

// Queue attendance for offline sync
export async function queueAttendance(attendanceData: any): Promise<string | null> {
  try {
    const database = await getDB();
    if (!database) {
      console.warn('Database not available, cannot queue attendance');
      return null;
    }

    const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const record: AttendanceQueue = {
      id,
      data: attendanceData,
      timestamp: Date.now(),
      synced: false,
    };
    
    await database.add('attendance', record);
    return id;
  } catch (error) {
    console.error('Failed to queue attendance:', error);
    return null;
  }
}

// Queue GPS location
export async function queueLocation(dispatchId: string, latitude: number, longitude: number): Promise<string | null> {
  try {
    const database = await getDB();
    if (!database) {
      console.warn('Database not available, cannot queue location');
      return null;
    }

    const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const location: LocationQueue = {
      id,
      dispatch_id: dispatchId,
      latitude,
      longitude,
      timestamp: Date.now(),
      synced: false,
    };
    
    await database.add('locations', location);
    return id;
  } catch (error) {
    console.error('Failed to queue location:', error);
    return null;
  }
}

// Queue generic API request
export async function queueOfflineRequest(config: any): Promise<string | null> {
  try {
    const database = await getDB();
    if (!database) {
      console.warn('Database not available, cannot queue request');
      return null;
    }

    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: RequestQueue = {
      id,
      url: config.url,
      method: config.method,
      data: config.data,
      timestamp: Date.now(),
      synced: false,
    };
    
    await database.add('requests', request);
    return id;
  } catch (error) {
    console.error('Failed to queue request:', error);
    return null;
  }
}

// Store biometric data locally
export async function storeBiometric(workerId: string, faceEncoding?: string, fingerprintTemplate?: string): Promise<boolean> {
  try {
    const database = await getDB();
    if (!database) {
      console.warn('Database not available, cannot store biometric');
      return false;
    }

    const biometric: BiometricCache = {
      worker_id: workerId,
      face_encoding: faceEncoding,
      fingerprint_template: fingerprintTemplate,
      timestamp: Date.now(),
    };
    
    await database.put('biometrics', biometric);
    return true;
  } catch (error) {
    console.error('Failed to store biometric:', error);
    return false;
  }
}

// Get stored biometric
export async function getBiometric(workerId: string): Promise<BiometricCache | undefined> {
  try {
    const database = await getDB();
    if (!database) return undefined;
    
    return await database.get('biometrics', workerId);
  } catch (error) {
    console.error('Failed to get biometric:', error);
    return undefined;
  }
}

// Get all stored biometrics
export async function getAllBiometrics(): Promise<BiometricCache[]> {
  try {
    const database = await getDB();
    if (!database) return [];
    
    return await database.getAll('biometrics');
  } catch (error) {
    console.error('Failed to get all biometrics:', error);
    return [];
  }
}

// Sync pending attendance records
export async function syncPendingAttendance(): Promise<{ synced: number; failed: number }> {
  try {
    const database = await getDB();
    if (!database) return { synced: 0, failed: 0 };

    const pendingRecords: AttendanceQueue[] = await database.getAll('attendance');
    const unsyncedRecords = pendingRecords.filter((r) => !r.synced);
    
    if (unsyncedRecords.length === 0) return { synced: 0, failed: 0 };

    await api.syncAttendanceBatch(unsyncedRecords.map((r) => r.data));
    
    // Mark as synced
    for (const record of unsyncedRecords) {
      await database.put('attendance', { ...record, synced: true });
    }
    
    return { synced: unsyncedRecords.length, failed: 0 };
  } catch (error) {
    console.error('Failed to sync attendance:', error);
    const database = await getDB();
    if (!database) return { synced: 0, failed: 0 };
    
    const pendingRecords: AttendanceQueue[] = await database.getAll('attendance');
    const unsyncedRecords = pendingRecords.filter((r) => !r.synced);
    return { synced: 0, failed: unsyncedRecords.length };
  }
}

// Sync pending GPS locations
export async function syncPendingLocations(): Promise<{ synced: number; failed: number }> {
  try {
    const database = await getDB();
    if (!database) return { synced: 0, failed: 0 };

    const pendingLocations: LocationQueue[] = await database.getAll('locations');
    const unsyncedLocations = pendingLocations.filter((l) => !l.synced);
    
    if (unsyncedLocations.length === 0) return { synced: 0, failed: 0 };

    await api.syncGPSBatch(unsyncedLocations.map((l) => ({
      dispatch_id: l.dispatch_id,
      latitude: l.latitude,
      longitude: l.longitude,
      timestamp: l.timestamp
    })));
    
    // Mark as synced
    for (const location of unsyncedLocations) {
      await database.put('locations', { ...location, synced: true });
    }
    
    return { synced: unsyncedLocations.length, failed: 0 };
  } catch (error) {
    console.error('Failed to sync locations:', error);
    const database = await getDB();
    if (!database) return { synced: 0, failed: 0 };
    
    const pendingLocations: LocationQueue[] = await database.getAll('locations');
    const unsyncedLocations = pendingLocations.filter((l) => !l.synced);
    return { synced: 0, failed: unsyncedLocations.length };
  }
}

// Sync all pending data
export async function syncAllPending(): Promise<{
  attendance: { synced: number; failed: number };
  locations: { synced: number; failed: number };
}> {
  const results = {
    attendance: await syncPendingAttendance(),
    locations: await syncPendingLocations(),
  };
  
  return results;
}

// Setup automatic sync when online
export function setupAutoSync(): void {
  window.addEventListener('online', async () => {
    console.log('🌐 Network detected, syncing offline data...');
    try {
      const results = await syncAllPending();
      console.log('✅ Sync complete:', results);
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('RelishAgro Sync', {
          body: `Synced ${results.attendance.synced + results.locations.synced} records`,
          icon: '/flavorcore-logo.png'
        });
      }
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
    }
  });

  // Periodic sync every 5 minutes when online
  setInterval(async () => {
    if (navigator.onLine) {
      try {
        await syncAllPending();
      } catch (error) {
        console.error('❌ Periodic sync failed:', error);
      }
    }
  }, 5 * 60 * 1000);
}