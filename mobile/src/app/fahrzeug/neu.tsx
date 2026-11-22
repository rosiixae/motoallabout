import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { MotorcycleForm, type MotorcycleFormResult } from '@/components/MotorcycleForm';
import { Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { createMotorcycle } from '@/lib/data';
import { useGarage } from '@/lib/garage';

export default function NewMotorcycle() {
  const router = useRouter();
  const { userId } = useAuth();
  const { motorcycles, refresh, select } = useGarage();
  const [saving, setSaving] = useState(false);

  async function save({ input }: MotorcycleFormResult) {
    if (!userId) return;
    setSaving(true);
    try {
      const created = await createMotorcycle(userId, { ...input, is_primary: motorcycles.length === 0 });
      await refresh();
      select(created.id);
      router.back();
      Alert.alert(
        'Motorrad gespeichert',
        'Tipp: Trag unter «Wartung eintragen» ein, wann Öl, Kette und Service zuletzt gemacht wurden. Dann stimmen die Erinnerungen.',
      );
    } catch {
      Alert.alert('Speichern hat nicht geklappt', 'Bitte prüfe deine Internetverbindung und versuche es nochmals.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Motorrad hinzufügen" onBack={() => router.back()}>
      <MotorcycleForm saving={saving} submitLabel="Speichern" onSubmit={save} />
    </Screen>
  );
}
