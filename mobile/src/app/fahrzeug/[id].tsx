import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { MotorcycleForm, type MotorcycleFormResult } from '@/components/MotorcycleForm';
import { Button, ErrorBox, Loading, Screen } from '@/components/ui';
import { addOdometerReading, deleteMotorcycle, getCurrentKm, getMotorcycle, updateMotorcycle } from '@/lib/data';
import { useGarage } from '@/lib/garage';
import { useFocusData } from '@/lib/hooks';

export default function EditMotorcycle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { refresh } = useGarage();
  const [saving, setSaving] = useState(false);
  const { data, error, loading } = useFocusData(async () => {
    const [motorcycle, km] = await Promise.all([getMotorcycle(id), getCurrentKm(id)]);
    return { motorcycle, km };
  }, [id]);

  async function save({ input, currentKm }: MotorcycleFormResult) {
    setSaving(true);
    try {
      await updateMotorcycle(id, input);
      if (currentKm != null && data && currentKm !== data.km) {
        if (currentKm < data.km) {
          Alert.alert('Kilometerstand', 'Der neue Stand ist tiefer als der bisherige und wurde nicht übernommen.');
        } else {
          await addOdometerReading(id, currentKm);
        }
      }
      await refresh();
      router.back();
    } catch {
      Alert.alert('Speichern hat nicht geklappt', 'Bitte versuche es nochmals.');
    } finally {
      setSaving(false);
    }
  }

  function remove() {
    Alert.alert('Motorrad entfernen?', 'Es verschwindet aus der App. Die eingetragenen Wartungen bleiben gespeichert.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Entfernen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMotorcycle(id);
            await refresh();
            router.back();
          } catch {
            Alert.alert('Das hat nicht geklappt', 'Bitte versuche es nochmals.');
          }
        },
      },
    ]);
  }

  return (
    <Screen title="Motorrad bearbeiten" onBack={() => router.back()}>
      {error ? <ErrorBox message={error} /> : null}
      {loading && !data ? <Loading /> : null}
      {data?.motorcycle ? (
        <>
          <MotorcycleForm
            initial={data.motorcycle}
            initialKm={data.km}
            saving={saving}
            submitLabel="Speichern"
            onSubmit={save}
          />
          <Button label="Motorrad entfernen" variant="danger" onPress={remove} />
        </>
      ) : null}
    </Screen>
  );
}
