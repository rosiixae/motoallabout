import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Body, Button, ErrorBox, Field, Screen } from '@/components/ui';
import { authErrorText } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, useTheme } from '@/theme/theme';

export default function Login() {
  const router = useRouter();
  const { accent } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(authErrorText(err.message));
    // Bei Erfolg leitet das Layout automatisch weiter.
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ alignItems: 'center', gap: 10, marginTop: 40, marginBottom: 12 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: accent.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="motorrad" size={40} color={accent.accent} strokeWidth={1.8} />
          </View>
          <Text style={{ fontSize: 34, fontWeight: '700', color: colors.text }}>MotoAllAbout</Text>
          <Body muted style={{ textAlign: 'center' }}>
            Wartung, Tipps und Termine für dein Motorrad.
          </Body>
        </View>

        <Field
          label="E-Mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="name@beispiel.ch"
        />
        <Field
          label="Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          onSubmitEditing={signIn}
        />
        {error ? <ErrorBox message={error} /> : null}
        <Button label="Anmelden" onPress={signIn} loading={busy} />
        <Button label="Passwort vergessen?" variant="ghost" onPress={() => router.push('/passwort')} />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
        <Body muted>Noch kein Konto?</Body>
        <Button label="Konto erstellen" variant="secondary" onPress={() => router.push('/registrieren')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
