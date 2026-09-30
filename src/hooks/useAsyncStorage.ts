import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage equivalent of the old localStorage hook. Storage reads are
 * async, so the hook reports when the saved value has been loaded; screens
 * wait for that instead of briefly showing the seed value.
 */
export default function useAsyncStorage<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const skipWrite = useRef(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(key);
        if (!alive) return;
        if (saved !== null) setValue(JSON.parse(saved) as T);
      } catch {
        // Unreadable or corrupt entry: keep the seed value.
      }
      if (alive) setHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => {
    // Never write before the read above, or the seed value would overwrite
    // whatever was already saved.
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
      /* storage unavailable */
    });
  }, [key, value]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next);
  }, []);

  return [value, update, hydrated];
}
