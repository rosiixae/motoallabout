import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Body, Button, Card, ErrorBox, Field, H2, Screen } from '@/components/ui';
import { authErrorText } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkMail, setCheckMail] = useState(false);

  async function signUp() {
    setError(null);
    if (!email.trim() || !password) return setError('Bitte E-Mail und Passwort eingeben.');
    if (password.length < 8) return setError('Das Passwort muss mindestens 8 Zeichen haben.');
    if (password !== password2) return setError('Die beiden Passwörter sind nicht gleich.');
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() || null } },
    });
    setBusy(false);
    if (err) return setError(authErrorText(err.message));
    // Ohne Session muss die E-Mail zuerst bestätigt werden.
    if (!data.session) setCheckMail(true);
  }

  if (checkMail) {
    return (
      <Screen title="Fast geschafft" onBack={() => router.replace('/login')}>
        <Card>
          <H2>Bestätige deine E-Mail</H2>
          <Body>
            Wir haben dir ein Mail an {email.trim()} geschickt. Tippe auf den Link im Mail und melde dich danach hier an.
          </Body>
          <Body muted>Kein Mail bekommen? Schau im Spam-Ordner nach.</Body>
        </Card>
        <Button label="Zur Anmeldung" onPress={() => router.replace('/login')} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Konto erstellen" onBack={() => router.back()}>
        <Field label="Vorname (freiwillig)" value={name} onChangeText={setName} autoComplete="given-name" />
        <Field
          label="E-Mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          hint="Mindestens 8 Zeichen"
        />
        <Field
          label="Passwort wiederholen"
          value={password2}
          onChangeText={setPassword2}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={signUp}
        />
        {error ? <ErrorBox message={error} /> : null}
        <Button label="Konto erstellen" onPress={signUp} loading={busy} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
