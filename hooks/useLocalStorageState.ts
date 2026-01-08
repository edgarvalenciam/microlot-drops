"use client";

import { useState, useEffect, useCallback } from "react";

export interface StorageState<T> {
  schemaVersion: number;
  data: T;
}

export interface MigrateFunction<T> {
  (oldState: StorageState<unknown>): StorageState<T>;
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  schemaVersion: number = 1,
  migrate?: MigrateFunction<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      const parsed = JSON.parse(item) as StorageState<unknown>;

      // Check if migration is needed
      if (parsed.schemaVersion !== schemaVersion) {
        if (migrate) {
          try {
            const migrated = migrate(parsed);
            // Save migrated state
            window.localStorage.setItem(key, JSON.stringify(migrated));
            return migrated.data as T;
          } catch (error) {
            console.error(`Migration failed for ${key}:`, error);
            // Fallback to initial value on migration failure
            return initialValue;
          }
        } else {
          // No migration function provided, use initial value
          console.warn(
            `Schema version mismatch for ${key}. Expected ${schemaVersion}, got ${parsed.schemaVersion}. Using initial value.`
          );
          return initialValue;
        }
      }

      return parsed.data as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          const stateToStore: StorageState<T> = {
            schemaVersion,
            data: valueToStore,
          };
          window.localStorage.setItem(key, JSON.stringify(stateToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, schemaVersion, storedValue]
  );

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as StorageState<T>;
          if (parsed.schemaVersion === schemaVersion) {
            setStoredValue(parsed.data);
          }
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, schemaVersion]);

  return [storedValue, setValue];
}

