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

export async function initOfflineDB() {
  if (db) return db;

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

  return db;
}

// Queue attendance for offline sync
export async function queueAttendance(attendanceData: any): Promise<string> {
  const database = await initOfflineDB();
  const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const record: AttendanceQueue = {
    id,
    data: attendanceData,
    timestamp: Date.now(),
    synced: false,
  };
  
  await database.add('attendance', record);
  return id;
}

// Queue GPS location
export async function queueLocation(dispatchId: string, latitude: number, longitude: number): Promise<string> {
  const database = await initOfflineDB();
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
}

// Queue generic API request
export async function queueOfflineRequest(config: any): Promise<string> {
  const database = await initOfflineDB();
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
}

// Store biometric data locally
export async function storeBiometric(workerId: string, faceEncoding?: string, fingerprintTemplate?: string): Promise<void> {
  const database = await initOfflineDB();
  
  const biometric: BiometricCache = {
    worker_id: workerId,
    face_encoding: faceEncoding,
    fingerprint_template: fingerprintTemplate,
    timestamp: Date.now(),
  };
  
  await database.put('biometrics', biometric);
}

// Get stored biometric
export async function getBiometric(workerId: string): Promise<BiometricCache | undefined> {
  const database = await initOfflineDB();
  return await database.get('biometrics', workerId);
}

// Get all stored biometrics
export async function getAllBiometrics(): Promise<BiometricCache[]> {
  const database = await initOfflineDB();
  return await database.getAll('biometrics');
}

// Sync pending attendance records
export async function syncPendingAttendance(): Promise<{ synced: number; failed: number }> {
  const database = await initOfflineDB();
  const pendingRecords: AttendanceQueue[] = await database.getAll('attendance');
  
  const unsyncedRecords = pendingRecords.filter((r) => !r.synced);
  
  if (unsyncedRecords.length === 0) return { synced: 0, failed: 0 };

  try {
    await api.syncAttendanceBatch(unsyncedRecords.map((r) => r.data));
    
    // Mark as synced
    for (const record of unsyncedRecords) {
      await database.put('attendance', { ...record, synced: true });
    }
    
    return { synced: unsyncedRecords.length, failed: 0 };
  } catch (error) {
    console.error('Failed to sync attendance:', error);
    return { synced: 0, failed: unsyncedRecords.length };
  }
}

// Sync pending GPS locations
export async function syncPendingLocations(): Promise<{ synced: number; failed: number }> {
  const database = await initOfflineDB();
  const pendingLocations: LocationQueue[] = await database.getAll('locations');
  
  const unsyncedLocations = pendingLocations.filter((l) => !l.synced);
  
  if (unsyncedLocations.length === 0) return { synced: 0, failed: 0 };

  try {
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
    console.log('Network detected, syncing offline data...');
    const results = await syncAllPending();
    console.log('Sync complete:', results);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FlavorCore Sync', {
        body: `Synced ${results.attendance.synced + results.locations.synced} records`,
        icon: '/flavorcore-logo.png'
      });
    }
  });

  // Periodic sync every 5 minutes when online
  setInterval(async () => {
    if (navigator.onLine) {
      await syncAllPending();
    }
  }, 5 * 60 * 1000);
}