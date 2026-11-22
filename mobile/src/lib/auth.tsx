import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

type AuthValue = {
  session: Session | null;
  userId: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthValue>({ session: null, userId: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, userId: session?.user.id ?? null, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}

// Fehlermeldungen von Supabase auf Deutsch übersetzen
export function authErrorText(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort stimmt nicht.';
  if (m.includes('email not confirmed')) return 'Bitte bestätige zuerst deine E-Mail-Adresse (Link im Mail).';
  if (m.includes('user already registered')) return 'Mit dieser E-Mail gibt es schon ein Konto.';
  if (m.includes('password should be at least')) return 'Das Passwort muss mindestens 6 Zeichen haben.';
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Diese E-Mail-Adresse ist ungültig.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Zu viele Versuche. Bitte warte kurz.';
  if (m.includes('network') || m.includes('fetch')) return 'Keine Verbindung. Prüfe dein Internet.';
  return 'Das hat nicht geklappt. Bitte versuche es nochmals.';
}
