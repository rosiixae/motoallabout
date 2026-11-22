import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { MaintenanceRow } from '@/components/MaintenanceRow';
import { MonthGrid } from '@/components/MonthGrid';
import { Body, Button, Card, ErrorBox, H2, Loading, Screen, Small } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { getCalendarEvents, getProfile, motorcycleDrive, motorcycleTitle } from '@/lib/data';
import { formatKm, monthNames, toIsoDate } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { useFocusData } from '@/lib/hooks';
import { openStatus } from '@/lib/navigation';
import { ensurePermission, syncMaintenanceReminders } from '@/lib/notifications';
import { useMaintenance } from '@/lib/useMaintenance';
import { colors, useTheme } from '@/theme/theme';

const driveText: Record<string, string> = {
  chain: 'Kettenantrieb',
  shaft: 'Kardanantrieb',
  belt: 'Zahnriemen',
  cvt: 'Variomatik',
};

export default function Home() {
  const router = useRouter();
  const { accent } = useTheme();
  const { userId } = useAuth();
  const { current, loading: garageLoading } = useGarage();
  const maintenance = useMaintenance(current);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const extra = useFocusData(async () => {
    const [profile, events] = await Promise.all([
      userId ? getProfile(userId) : Promise.resolve(null),
      getCalendarEvents(monthStart, nextMonth),
    ]);
    return { profile, events };
  }, [userId]);

  const marked = useMemo(() => {
    const set = new Set<string>();
    for (const e of extra.data?.events ?? []) set.add(e.starts_at.slice(0, 10));
    for (const s of maintenance.data?.statuses ?? []) {
      if (s.dueOn && s.level !== 'ok' && s.dueOn.slice(0, 7) === toIsoDate(now).slice(0, 7)) set.add(s.dueOn);
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extra.data, maintenance.data]);

  // Erinnerungen auf dem Handy aktuell halten
  useEffect(() => {
    const data = maintenance.data;
    if (!data || !current) return;
    const prefs = data.prefs;
    void (async () => {
      if (prefs?.maintenance_reminders !== false) await ensurePermission();
      await syncMaintenanceReminders(data.statuses, {
        enabled: prefs?.maintenance_reminders ?? true,
        seasonal: prefs?.seasonal_reminders ?? true,
        daysBefore: prefs?.remind_days_before ?? 14,
        bikeName: motorcycleTitle(current).full,
      });
    })();
  }, [maintenance.data, current]);

  const name = extra.data?.profile?.display_name;
  const drive = current ? motorcycleDrive(current) : null;
  const urgent = (maintenance.data?.statuses ?? []).filter((s) => s.level === 'overdue' || s.level === 'due');

  return (
    <Screen kicker={name ? `Willkommen zurück, ${name}` : 'Willkommen zurück'} title="Home">
      {/* Kalender */}
      <Pressable onPress={() => router.push('/kalender')} accessibilityRole="button" accessibilityLabel="Kalender öffnen">
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <H2>
              {monthNames[now.getMonth()]} {now.getFullYear()}
            </H2>
            <Text style={{ fontSize: 13, fontWeight: '600', color: accent.accent }}>Kalender öffnen ›</Text>
          </View>
          <MonthGrid year={now.getFullYear()} month={now.getMonth()} marked={marked} compact />
        </Card>
      </Pressable>

      {garageLoading ? (
        <Loading />
      ) : !current ? (
        <Card>
          <H2>Leg dein Motorrad an</H2>
          <Body muted>
            Gib Marke, Modell und Kilometerstand ein. Dann zeigt dir die App, wann Kette, Öl, Service und Reifen fällig sind.
          </Body>
          <Button label="Motorrad hinzufügen" icon="plus" onPress={() => router.push('/fahrzeug/neu')} />
        </Card>
      ) : (
        <>
          {/* Kilometer */}
          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: 2, flexShrink: 1 }}>
              <Small>Kilometerstand</Small>
              <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>
                {maintenance.data ? formatKm(maintenance.data.currentKm) : '…'}
              </Text>
            </View>
            <Button label="Eintragen" variant="secondary" onPress={() => router.push('/km')} style={{ minHeight: 44 }} />
          </Card>

          {urgent.length > 0 && (
            <Card style={{ backgroundColor: colors.warningSoft, borderColor: '#FCD34D' }}>
              <Body style={{ fontWeight: '700' }}>
                {urgent.length === 1 ? '1 Sache ist fällig' : `${urgent.length} Sachen sind fällig`}
              </Body>
              <Small style={{ color: colors.textSoft }}>{urgent.map((s) => s.name).join(', ')}</Small>
            </Card>
          )}

          {/* Wartung */}
          <Card style={{ gap: 18 }}>
            <View style={{ gap: 2 }}>
              <H2>Wartung</H2>
              <Small>
                Für deine {motorcycleTitle(current).full}
                {drive && driveText[drive] ? ` · ${driveText[drive]}` : ''}
              </Small>
            </View>
            {maintenance.error ? <ErrorBox message={maintenance.error} /> : null}
            {maintenance.loading && !maintenance.data ? <Loading /> : null}
            {maintenance.data?.statuses.map((s) => (
              <MaintenanceRow key={s.code} status={s} onPress={() => openStatus(router, s)} />
            ))}
            <Button label="Wartung eintragen" icon="plus" onPress={() => router.push('/wartung/neu')} />
            <Button label="Verlauf ansehen" variant="ghost" onPress={() => router.push('/wartung/verlauf')} />
          </Card>
        </>
      )}
    </Screen>
  );
}
