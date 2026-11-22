import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { Body, Button, Card, ErrorBox, Field, H2, Screen } from '@/components/ui';
import { authErrorText, useAuth } from '@/lib/auth';
import { getProfile, updateProfile } from '@/lib/data';
import { formatDate, parseSwissDate } from '@/lib/format';
import { friendlyError } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';

export default function Angaben() {
  const router = useRouter();
  const { userId, session } = useAuth();
  const [name, setName] = useState('');
  const [ridingSince, setRidingSince] = useState('');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getProfile(userId)
      .then((p) => {
        setName(p?.display_name ?? '');
        setRidingSince(p?.riding_since ? formatDate(p.riding_since) : '');
      })
      .catch((e) => setError(friendlyError(String(e))));
  }, [userId]);

  async function save() {
    if (!userId) return;
    setError(null);
    const since = ridingSince.trim() ? parseSwissDate(ridingSince) : null;
    if (ridingSince.trim() && !since) return setError('Datum bitte so eingeben: TT.MM.JJJJ');
    if (password && password.length < 8) return setError('Das neue Passwort muss mindestens 8 Zeichen haben.');
    setBusy(true);
    try {
      await updateProfile(userId, { display_name: name.trim() || null, riding_since: since });
      const changes: { email?: string; password?: string } = {};
      if (email.trim() && email.trim() !== session?.user.email) changes.email = email.trim();
      if (password) changes.password = password;
      if (Object.keys(changes).length) {
        const { error: err } = await supabase.auth.updateUser(changes);
        if (err) throw new Error(authErrorText(err.message));
      }
      setPassword('');
      Alert.alert(
        'Gespeichert',
        changes.email ? 'Bitte bestätige die neue E-Mail-Adresse über den Link im Mail.' : undefined,
      );
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Speichern hat nicht geklappt.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Persönliche Angaben" onBack={() => router.back()}>
      <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />
      <Field
        label="Ich fahre Motorrad seit (freiwillig)"
        value={ridingSince}
        onChangeText={setRidingSince}
        placeholder="TT.MM.JJJJ"
        keyboardType="numbers-and-punctuation"
        hint="Damit die Tipps zu deiner Erfahrung passen."
      />
      <Card>
        <H2>Anmeldung</H2>
        <Field
          label="E-Mail-Adresse"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Neues Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          hint="Leer lassen, wenn du es nicht ändern willst."
        />
      </Card>
      <Body muted style={{ fontSize: 12 }}>
        Wir speichern nur, was die App wirklich braucht.
      </Body>
      {error ? <ErrorBox message={error} /> : null}
      <Button label="Speichern" onPress={save} loading={busy} />
    </Screen>
  );
}
