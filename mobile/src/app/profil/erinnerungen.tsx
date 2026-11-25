import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Linking, Switch, View } from 'react-native';

import { Body, Button, Card, Chip, ErrorBox, H2, Loading, Screen, Small } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import {
  deleteOverride,
  getDisabledOverrides,
  getNotificationPreferences,
  getTaskTypes,
  updateNotificationPreferences,
} from '@/lib/data';
import { formatNumber } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { useFocusData } from '@/lib/hooks';
import { ensurePermission, hasPermission, hasWeeklyKmReminder, setWeeklyKmReminder } from '@/lib/notifications';
import type { NotificationPreferences } from '@/lib/types';
import { colors, useTheme } from '@/theme/theme';

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  const { accent } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flexShrink: 1 }}>
        <Body style={{ fontWeight: '600' }}>{label}</Body>
        {hint ? <Small>{hint}</Small> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: accent.accent, false: colors.track }} accessibilityLabel={label} />
    </View>
  );
}

export default function Erinnerungen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { current } = useGarage();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [weekly, setWeekly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState(true);

  const hidden = useFocusData(async () => {
    if (!current) return [];
    const [overrides, types] = await Promise.all([getDisabledOverrides(current.id), getTaskTypes()]);
    return overrides.map((o) => ({ code: o.task_type_code, name: types.find((t) => t.code === o.task_type_code)?.name_i18n.de ?? o.task_type_code }));
  }, [current?.id]);

  useEffect(() => {
    if (userId) getNotificationPreferences(userId).then(setPrefs).catch(() => setError('Laden hat nicht geklappt.'));
    void hasWeeklyKmReminder().then(setWeekly);
    void ensurePermission().then(setPermission);
  }, [userId]);

  // Nach dem Zurückkommen aus den Handy-Einstellungen neu prüfen
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void hasPermission().then(setPermission);
    });
    return () => sub.remove();
  }, []);

  async function change(changes: Partial<Omit<NotificationPreferences, 'user_id'>>) {
    if (!userId || !prefs) return;
    const previous = prefs;
    setPrefs({ ...prefs, ...changes });
    // Wird eine Erinnerung eingeschaltet, bei Bedarf gleich um Erlaubnis fragen
    if (Object.values(changes).some((v) => v === true) && !permission) {
      void ensurePermission().then(setPermission);
    }
    try {
      await updateNotificationPreferences(userId, changes);
    } catch {
      setPrefs(previous);
      setError('Speichern hat nicht geklappt.');
    }
  }

  return (
    <Screen title="Erinnerungen" onBack={() => router.back()}>
      {!permission ? (
        <Card style={{ backgroundColor: colors.warningSoft, borderColor: '#FCD34D' }}>
          <Body>Mitteilungen sind für MotoAllAbout ausgeschaltet. Du kannst sie in den Einstellungen deines Handys einschalten.</Body>
          <Button label="Einstellungen öffnen" variant="secondary" onPress={() => Linking.openSettings()} />
        </Card>
      ) : null}
      {error ? <ErrorBox message={error} /> : null}
      {!prefs ? (
        <Loading />
      ) : (
        <>
          <Card>
            <Toggle
              label="Wartung"
              hint="Mitteilung, bevor etwas fällig wird"
              value={prefs.maintenance_reminders}
              onChange={(v) => change({ maintenance_reminders: v })}
            />
            <Toggle
              label="Saison"
              hint="Einwintern im Oktober, Frühlingscheck im März"
              value={prefs.seasonal_reminders}
              onChange={(v) => change({ seasonal_reminders: v })}
            />
            <Toggle
              label="Kilometerstand"
              hint="Jeden Sonntag um 18 Uhr daran erinnern"
              value={weekly}
              onChange={(v) => {
                setWeekly(v);
                void setWeeklyKmReminder(v).then(() => hasPermission().then(setPermission));
              }}
            />
          </Card>
          <Card>
            <H2>Wie früh erinnern?</H2>
            <Small>Bei Aufgaben mit Datum</Small>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[3, 7, 14, 30].map((d) => (
                <Chip key={d} label={`${d} Tage vorher`} selected={prefs.remind_days_before === d} onPress={() => change({ remind_days_before: d })} />
              ))}
            </View>
            <Small>Bei Aufgaben nach Kilometern</Small>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[200, 500, 1000].map((k) => (
                <Chip key={k} label={`${formatNumber(k)} km vorher`} selected={prefs.remind_km_before === k} onPress={() => change({ remind_km_before: k })} />
              ))}
            </View>
          </Card>
        </>
      )}

      {hidden.data && hidden.data.length > 0 && current ? (
        <Card>
          <H2>Ausgeblendet</H2>
          {hidden.data.map((h) => (
            <View key={h.code} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Body>{h.name}</Body>
              <Button
                label="Wieder anzeigen"
                variant="ghost"
                onPress={async () => {
                  await deleteOverride(current.id, h.code).catch(() => setError('Das hat nicht geklappt.'));
                  void hidden.reload();
                }}
              />
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
