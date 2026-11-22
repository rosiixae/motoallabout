import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, ErrorBox, Field, Screen } from '@/components/ui';
import { authErrorText } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    setError(null);
    if (!email.trim()) return setError('Bitte deine E-Mail eingeben.');
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (err) return setError(authErrorText(err.message));
    setSent(true);
  }

  return (
    <Screen title="Passwort vergessen" onBack={() => router.back()}>
      {sent ? (
        <Card>
          <Body>Wenn es ein Konto mit {email.trim()} gibt, kommt gleich ein Mail mit einem Link zum Zurücksetzen.</Body>
        </Card>
      ) : (
        <>
          <Body muted>Gib deine E-Mail ein. Wir schicken dir einen Link, mit dem du ein neues Passwort setzen kannst.</Body>
          <Field
            label="E-Mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          {error ? <ErrorBox message={error} /> : null}
          <Button label="Link schicken" onPress={send} loading={busy} />
        </>
      )}
    </Screen>
  );
}
