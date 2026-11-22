import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';

import { Body, Button, Card, ErrorBox, Field, H2, IconBadge, Loading, ProgressBar, Screen, Small } from '@/components/ui';
import { workshopWhy } from '@/content/workshop';
import { deleteOverride, getOverride, saveOverride } from '@/lib/data';
import { formatDate, formatNumber, parseKm } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { parseInterval } from '@/lib/maintenance';
import { useMaintenance } from '@/lib/useMaintenance';
import { colors, useTheme } from '@/theme/theme';

const sourceText = {
  own: 'Dein eigenes Intervall',
  catalog: 'Herstellerwert aus der Motorradliste',
  default: 'Allgemeiner Richtwert (Quelle unter Profil › Woher die Werte stammen)',
  season: 'Jedes Jahr zur gleichen Zeit',
  law: 'Gesetzliche Regel in der Schweiz',
} as const;

export default function WartungDetail() {
  const router = useRouter();
  const { accent } = useTheme();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { current } = useGarage();
  const maintenance = useMaintenance(current);
  const status = maintenance.data?.statuses.find((s) => s.code === code);
  const task = maintenance.data?.taskTypes.find((t) => t.code === code);

  const [editing, setEditing] = useState(false);
  const [km, setKm] = useState('');
  const [months, setMonths] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [hasOverride, setHasOverride] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!current || !code) return;
    getOverride(current.id, code)
      .then((o) => {
        setHasOverride(!!o);
        if (o) {
          setKm(o.interval_km ? String(o.interval_km) : '');
          const iv = parseInterval(o.interval_period);
          setMonths(iv ? String(iv.years * 12 + iv.months) : '');
          setEnabled(o.is_enabled);
        }
      })
      .catch(() => {});
  }, [current, code]);

  async function saveInterval() {
    if (!current) return;
    setError(null);
    const kmValue = km.trim() ? parseKm(km) : null;
    const monthValue = months.trim() ? Number(months.trim()) : null;
    if (monthValue != null && (!Number.isInteger(monthValue) || monthValue <= 0)) return setError('Monate bitte als ganze Zahl eingeben.');
    if (enabled && kmValue == null && monthValue == null) return setError('Bitte km oder Monate eingeben.');
    setBusy(true);
    try {
      await saveOverride(current.id, code, { interval_km: kmValue, interval_months: monthValue, is_enabled: enabled });
      setHasOverride(true);
      setEditing(false);
      await maintenance.reload();
      if (!enabled) {
        Alert.alert('Ausgeblendet', 'Du findest es wieder unter Profil › Erinnerungen.');
        router.back();
      }
    } catch {
      setError('Speichern hat nicht geklappt.');
    } finally {
      setBusy(false);
    }
  }

  async function resetInterval() {
    if (!current) return;
    setBusy(true);
    try {
      await deleteOverride(current.id, code);
      setHasOverride(false);
      setKm('');
      setMonths('');
      setEnabled(true);
      setEditing(false);
      await maintenance.reload();
    } finally {
      setBusy(false);
    }
  }

  if (!status) {
    return (
      <Screen title="Wartung" onBack={() => router.back()}>
        {maintenance.error ? <ErrorBox message={maintenance.error} /> : <Loading />}
      </Screen>
    );
  }

  const isWorkshop = !status.canDoYourself;
  const canEditInterval = status.intervalSource !== 'season' && status.intervalSource !== 'law';

  return (
    <Screen title={status.name} onBack={() => router.back()}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconBadge name={status.icon} size={48} tone={status.level === 'overdue' ? 'danger' : status.level === 'due' ? 'warning' : 'accent'} />
          <View style={{ flexShrink: 1, gap: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{status.label}</Text>
            {status.dueOn ? <Small>Fällig am {formatDate(status.dueOn)}</Small> : null}
            {status.dueKm ? <Small>Fällig bei {formatNumber(status.dueKm)} km</Small> : null}
          </View>
        </View>
        <ProgressBar value={status.progress} />
        {status.sub ? <Body style={{ fontWeight: '600' }}>{status.sub}</Body> : null}
        <Small>{sourceText[status.intervalSource]}</Small>
        {task?.description_i18n?.de ? <Body muted>{task.description_i18n.de}</Body> : null}
      </Card>

      {isWorkshop && workshopWhy[code] ? (
        <Card style={{ backgroundColor: accent.accentSoft, borderColor: accent.accentSoft }}>
          <Body>{workshopWhy[code]}</Body>
        </Card>
      ) : null}

      <Button label="Als erledigt eintragen" icon="check" onPress={() => router.push({ pathname: '/wartung/neu', params: { task: code } })} />
      {isWorkshop ? (
        <Button label="Werkstatt-Termin planen" variant="secondary" onPress={() => router.push({ pathname: '/termin', params: { task: code } })} />
      ) : null}
      {code === 'mfk' && current ? (
        <Button
          label="MFK-Datum eintragen"
          variant="secondary"
          onPress={() => router.push({ pathname: '/fahrzeug/[id]', params: { id: current.id } })}
        />
      ) : null}

      {canEditInterval ? (
        editing ? (
          <Card>
            <H2>Eigenes Intervall</H2>
            <Small>Zum Beispiel aus dem Handbuch deines Motorrads. Was zuerst eintritt, gilt.</Small>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label="Alle … km" value={km} onChangeText={setKm} keyboardType="number-pad" placeholder="z. B. 6000" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="oder alle … Monate" value={months} onChangeText={setMonths} keyboardType="number-pad" placeholder="z. B. 12" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Body>Erinnerung anzeigen</Body>
              <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: accent.accent, false: colors.track }} />
            </View>
            {error ? <ErrorBox message={error} /> : null}
            <Button label="Speichern" onPress={saveInterval} loading={busy} />
            {hasOverride ? <Button label="Zurück zum Standardwert" variant="ghost" onPress={resetInterval} /> : null}
            <Button label="Abbrechen" variant="ghost" onPress={() => setEditing(false)} />
          </Card>
        ) : (
          <Button label="Intervall anpassen" variant="ghost" onPress={() => setEditing(true)} />
        )
      ) : null}
    </Screen>
  );
}
