import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

/**
 * Lädt Daten jedes Mal, wenn der Bildschirm sichtbar wird
 * (z. B. nach dem Zurückkommen vom Erfassen einer Wartung).
 */
export function useFocusData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(async () => {
    setError(null);
    try {
      const result = await loadRef.current();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? friendlyError(e.message) : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { data, error, loading, reload, setData };
}

export function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('network') || m.includes('fetch')) return 'Keine Verbindung. Prüfe dein Internet und versuche es nochmals.';
  if (m.includes('jwt') || m.includes('not authenticated')) return 'Du bist nicht mehr angemeldet. Bitte melde dich neu an.';
  return 'Etwas hat nicht geklappt. Bitte versuche es nochmals.';
}
