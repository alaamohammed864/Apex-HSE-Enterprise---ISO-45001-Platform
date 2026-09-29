/**
 * Offline-First IndexedDB Storage Service for HSE Enterprise Platform
 * Provides persistent, zero-dependency client storage with automatic in-memory fallback.
 * Covers all Phase 1 Database Tables: Organizations, Projects, Sites, Departments, Employees, Contractors, etc.
 */

export const DB_STORE_NAMES = [
  'organizations',
  'projects',
  'sites',
  'departments',
  'employees',
  'contractors',
  'users',
  'roles',
  'permissions',
  'document_templates',
  'document_sections',
  'document_fields',
  'document_instances',
  'document_revisions',
  'document_approvals',
  'document_attachments',
  'document_comments',
  'hazards',
  'control_measures',
  'risk_assessments',
  'incident_records',
  'incident_investigations',
  'corrective_actions',
  'inspection_templates',
  'inspection_records',
  'training_courses',
  'training_records',
  'kpis',
  'kpi_records',
  'permit_types',
  'permits_to_work',
  'audit_templates',
  'audit_records',
  'audit_findings',
  'emergency_plans',
  'emergency_contacts',
  'hse_budget',
  'notifications',
  'audit_logs',
] as const;

export type DbStoreName = typeof DB_STORE_NAMES[number];

const DB_NAME = 'ApexHseEnterpriseDB';
const DB_VERSION = 2;

class IndexedDbService {
  private db: IDBDatabase | null = null;
  private isSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;
  private fallbackMemory: Map<string, Map<any, any>> = new Map();

  private getMemoryStore(storeName: string): Map<any, any> {
    if (!this.fallbackMemory.has(storeName)) {
      this.fallbackMemory.set(storeName, new Map());
    }
    return this.fallbackMemory.get(storeName)!;
  }

  public async init(): Promise<boolean> {
    if (!this.isSupported) return false;

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        DB_STORE_NAMES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            if (storeName === 'audit_logs') {
              const logStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
              logStore.createIndex('blockIndex', 'blockIndex', { unique: true });
            } else {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(true);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB failed to open, using in-memory mode:', (event.target as IDBOpenDBRequest).error);
        resolve(false);
      };
    });
  }

  public async getAll<T>(storeName: DbStoreName): Promise<T[]> {
    if (!this.db) await this.init();
    if (!this.db) {
      return Array.from(this.getMemoryStore(storeName).values()) as T[];
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve(Array.from(this.getMemoryStore(storeName).values()) as T[]);
      }
    });
  }

  public async getById<T>(storeName: DbStoreName, id: IDBValidKey): Promise<T | null> {
    if (!this.db) await this.init();
    if (!this.db) {
      return (this.getMemoryStore(storeName).get(id) as T) || null;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as T) || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve((this.getMemoryStore(storeName).get(id) as T) || null);
      }
    });
  }

  public async put<T>(storeName: DbStoreName, item: T): Promise<void> {
    const key = (item as any)?.id || (item as any)?.code || Math.random().toString();
    this.getMemoryStore(storeName).set(key, item);

    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  public async putBulk<T>(storeName: DbStoreName, items: T[]): Promise<void> {
    items.forEach((item) => {
      const key = (item as any)?.id || (item as any)?.code || Math.random().toString();
      this.getMemoryStore(storeName).set(key, item);
    });

    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  public async delete(storeName: DbStoreName, key: IDBValidKey): Promise<void> {
    this.getMemoryStore(storeName).delete(key);

    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }
}

export const dbService = new IndexedDbService();
