import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Body, Button, Card, Chip, ErrorBox, Field, H2, Loading, Screen, Small } from '@/components/ui';
import { addMaintenanceEvent, getCurrentKm, getTaskTypes, motorcycleDrive, motorcycleTitle } from '@/lib/data';
import { formatDate, formatNumber, parseKm, parseSwissDate, toIsoDate } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { friendlyError } from '@/lib/hooks';
import type { TaskType } from '@/lib/types';

const who = [
  { code: 'self', label: 'Selbst gemacht' },
  { code: 'workshop', label: 'Werkstatt' },
  { code: 'other', label: 'Jemand anderes' },
] as const;

export default function WartungEintragen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ task?: string }>();
  const { current } = useGarage();
  const [taskTypes, setTaskTypes] = useState<TaskType[] | null>(null);
  const [selected, setSelected] = useState<string[]>(params.task ? params.task.split(',') : []);
  const [date, setDate] = useState(formatDate(toIsoDate(new Date())));
  const [km, setKm] = useState('');
  const [by, setBy] = useState<(typeof who)[number]['code']>('self');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTaskTypes()
      .then(setTaskTypes)
      .catch((e) => setError(friendlyError(String(e))));
    if (current) getCurrentKm(current.id).then((v) => setKm(v ? formatNumber(v) : '')).catch(() => {});
  }, [current]);

  if (!current) {
    return (
      <Screen title="Wartung eintragen" onBack={() => router.back()}>
        <Body muted>Leg zuerst ein Motorrad an.</Body>
      </Screen>
    );
  }

  const drive = motorcycleDrive(current);
  const available = (taskTypes ?? []).filter((t) => !t.drive_type_code || t.drive_type_code === drive);

  function toggle(code: string) {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  async function save() {
    if (!current) return;
    setError(null);
    const iso = parseSwissDate(date);
    if (!iso) return setError('Datum bitte so eingeben: TT.MM.JJJJ');
    if (iso > toIsoDate(new Date())) return setError('Das Datum liegt in der Zukunft. Für geplante Termine nimm den Kalender.');
    if (!selected.length) return setError('Bitte wähle aus, was gemacht wurde.');
    const costValue = cost.trim() ? Number(cost.replace(',', '.').replace(/[^0-9.]/g, '')) : null;
    if (cost.trim() && (costValue == null || Number.isNaN(costValue))) return setError('Kosten bitte als Zahl eingeben, z. B. 180.50');
    setBusy(true);
    try {
      await addMaintenanceEvent(current.id, {
        performed_on: iso,
        odometer_km: km.trim() ? parseKm(km) : null,
        performed_by: by,
        total_cost: costValue,
        notes: notes.trim() || null,
        tasks: selected,
      });
      router.back();
    } catch {
      setError('Speichern hat nicht geklappt. Bitte versuche es nochmals.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Wartung eintragen" onBack={() => router.back()}>
        <Body muted>{motorcycleTitle(current).full}</Body>
        <Card>
          <H2>Was wurde gemacht?</H2>
          {!taskTypes ? (
            <Loading />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {available.map((t) => (
                <Chip key={t.code} label={t.name_i18n.de ?? t.code} selected={selected.includes(t.code)} onPress={() => toggle(t.code)} />
              ))}
            </View>
          )}
          <Small>Mehrere möglich, z. B. Service mit Ölwechsel und Ölfilter.</Small>
        </Card>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Datum" value={date} onChangeText={setDate} placeholder="TT.MM.JJJJ" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Kilometerstand" value={km} onChangeText={setKm} keyboardType="number-pad" placeholder="km" />
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Small style={{ fontWeight: '600' }}>Wer hat es gemacht?</Small>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {who.map((w) => (
              <Chip key={w.code} label={w.label} selected={by === w.code} onPress={() => setBy(w.code)} />
            ))}
          </View>
        </View>
        <Field label="Kosten in CHF (freiwillig)" value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="z. B. 180.50" />
        <Field label="Notiz (freiwillig)" value={notes} onChangeText={setNotes} placeholder="z. B. Motul 7100 10W-40" multiline />
        {error ? <ErrorBox message={error} /> : null}
        <Button label="Speichern" onPress={save} loading={busy} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
