import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { Body, Card, ErrorBox, Loading, Screen, Small } from '@/components/ui';
import { deleteMaintenanceEvent, getMaintenanceEvents, getTaskTypes, motorcycleTitle } from '@/lib/data';
import { formatDate, formatKm, formatNumber } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { useFocusData } from '@/lib/hooks';
import { colors } from '@/theme/theme';

const whoText = { self: 'Selbst gemacht', workshop: 'Werkstatt', other: 'Jemand anderes' } as const;

export default function Verlauf() {
  const router = useRouter();
  const { current } = useGarage();
  const { data, error, loading, reload } = useFocusData(async () => {
    if (!current) return null;
    const [events, types] = await Promise.all([getMaintenanceEvents(current.id), getTaskTypes()]);
    return { events, names: Object.fromEntries(types.map((t) => [t.code, t.name_i18n.de ?? t.code])) as Record<string, string> };
  }, [current?.id]);

  const total = (data?.events ?? []).reduce((sum, e) => sum + (e.total_cost ?? 0), 0);

  function remove(id: string) {
    Alert.alert('Eintrag löschen?', undefined, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await deleteMaintenanceEvent(id).catch(() => Alert.alert('Löschen hat nicht geklappt'));
          void reload();
        },
      },
    ]);
  }

  return (
    <Screen title="Verlauf" onBack={() => router.back()}>
      {current ? <Body muted>{motorcycleTitle(current).full}</Body> : null}
      {error ? <ErrorBox message={error} /> : null}
      {loading && !data ? <Loading /> : null}
      {data && data.events.length === 0 ? (
        <Card>
          <Body muted>Noch nichts eingetragen. Unter Home › «Wartung eintragen» kannst du erledigte Arbeiten erfassen.</Body>
        </Card>
      ) : null}
      {total > 0 ? <Small>Kosten total: CHF {formatNumber(total)}</Small> : null}
      {data?.events.map((e) => (
        <Pressable key={e.id} onLongPress={() => remove(e.id)} accessibilityHint="Lange drücken zum Löschen">
          <Card style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{formatDate(e.performed_on)}</Text>
              {e.odometer_km != null ? <Small>{formatKm(e.odometer_km)}</Small> : null}
            </View>
            <Body>{(e.maintenance_event_items ?? []).map((i) => data.names[i.task_type_code] ?? i.task_type_code).join(', ')}</Body>
            <Small>
              {whoText[e.performed_by]}
              {e.total_cost != null ? ` · CHF ${e.total_cost.toFixed(2)}` : ''}
            </Small>
            {e.notes ? <Small>{e.notes}</Small> : null}
          </Card>
        </Pressable>
      ))}
      {data && data.events.length > 0 ? <Small>Tipp: Lange auf einen Eintrag drücken, um ihn zu löschen.</Small> : null}
    </Screen>
  );
}
