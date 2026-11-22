import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useAuth } from './auth';
import { getMotorcycles } from './data';
import type { Motorcycle } from './types';

// Welches Motorrad gerade angezeigt wird (bei mehreren Motorrädern).
type GarageValue = {
  motorcycles: Motorcycle[];
  current: Motorcycle | null;
  loading: boolean;
  select: (id: string) => void;
  refresh: () => Promise<void>;
};

const GarageContext = createContext<GarageValue | null>(null);
const STORAGE_KEY = 'motoallabout.motorrad';

export function GarageProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setMotorcycles([]);
      setLoading(false);
      return;
    }
    try {
      setMotorcycles(await getMotorcycles());
    } catch {
      // Fehler zeigen die einzelnen Bildschirme selbst an
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((id) => id && setSelectedId(id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  const current =
    motorcycles.find((m) => m.id === selectedId) ?? motorcycles.find((m) => m.is_primary) ?? motorcycles[0] ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
  };

  return (
    <GarageContext.Provider value={{ motorcycles, current, loading, select, refresh }}>{children}</GarageContext.Provider>
  );
}

export function useGarage(): GarageValue {
  const value = useContext(GarageContext);
  if (!value) throw new Error('useGarage muss innerhalb von GarageProvider verwendet werden');
  return value;
}
