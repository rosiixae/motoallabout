import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Body, Button, ErrorBox, Field, Screen } from '@/components/ui';
import { addOdometerReading, getCurrentKm, motorcycleTitle } from '@/lib/data';
import { formatKm, parseKm } from '@/lib/format';
import { useGarage } from '@/lib/garage';

export default function KmEintragen() {
  const router = useRouter();
  const { current } = useGarage();
  const [previous, setPrevious] = useState<number | null>(null);
  const [km, setKm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (current) getCurrentKm(current.id).then(setPrevious).catch(() => {});
  }, [current]);

  async function save() {
    if (!current) return;
    setError(null);
    const value = parseKm(km);
    if (value == null) return setError('Bitte den Kilometerstand eingeben.');
    if (previous != null && value < previous) {
      return setError(`Der Stand ist tiefer als der letzte (${formatKm(previous)}). Bitte prüfen.`);
    }
    if (previous != null && value - previous > 50000) {
      return setError('Das sind mehr als 50’000 km seit dem letzten Eintrag. Bitte prüfen.');
    }
    setBusy(true);
    try {
      await addOdometerReading(current.id, value);
      router.back();
    } catch {
      setError('Speichern hat nicht geklappt. Bitte versuche es nochmals.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Kilometerstand" onBack={() => router.back()}>
        {current ? <Body muted>{motorcycleTitle(current).full}</Body> : null}
        <Field
          label="Kilometerstand heute"
          value={km}
          onChangeText={setKm}
          keyboardType="number-pad"
          placeholder={previous != null ? String(previous) : 'km'}
          hint={previous != null ? `Letzter Stand: ${formatKm(previous)}` : undefined}
          autoFocus
          onSubmitEditing={save}
        />
        {error ? <ErrorBox message={error} /> : null}
        <Button label="Speichern" onPress={save} loading={busy} />
        <Body muted style={{ fontSize: 13 }}>
          Trag den Stand etwa einmal pro Woche ein, wenn du fährst. Dann stimmen die Erinnerungen für Kette, Öl und Service.
        </Body>
      </Screen>
    </KeyboardAvoidingView>
  );
}
