import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MonthGrid } from '@/components/MonthGrid';
import { Body, Button, Card, ErrorBox, H2, Screen, Small } from '@/components/ui';
import { deleteCalendarEvent, getCalendarEvents } from '@/lib/data';
import { formatDate, monthNames, toIsoDate } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { useFocusData } from '@/lib/hooks';
import { openStatus } from '@/lib/navigation';
import { useMaintenance } from '@/lib/useMaintenance';
import { colors, useTheme } from '@/theme/theme';

type Entry = {
  key: string;
  date: string;
  time: string | null;
  title: string;
  sub: string;
  kind: 'event' | 'due';
  onPress?: () => void;
  onLongPress?: () => void;
};

const typeText = { workshop_appointment: 'Werkstatt-Termin', maintenance: 'Wartung', tour: 'Ausfahrt', other: 'Termin' } as const;

export default function Kalender() {
  const router = useRouter();
  const { accent } = useTheme();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const { current } = useGarage();
  const maintenance = useMaintenance(current);

  const events = useFocusData(
    () => getCalendarEvents(new Date(year, month, 1), new Date(year, month + 1, 1)),
    [year, month],
  );

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  const entries = useMemo<Entry[]>(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const list: Entry[] = [];
    for (const e of events.data ?? []) {
      const local = new Date(e.starts_at);
      list.push({
        key: e.id,
        date: toIsoDate(local),
        time: e.is_all_day ? null : `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`,
        title: e.title,
        sub: typeText[e.event_type],
        kind: 'event',
        onLongPress: () =>
          Alert.alert('Termin löschen?', e.title, [
            { text: 'Abbrechen', style: 'cancel' },
            {
              text: 'Löschen',
              style: 'destructive',
              onPress: async () => {
                await deleteCalendarEvent(e.id).catch(() => Alert.alert('Löschen hat nicht geklappt'));
                void events.reload();
              },
            },
          ]),
      });
    }
    for (const s of maintenance.data?.statuses ?? []) {
      if (!s.dueOn || !s.dueOn.startsWith(prefix)) continue;
      list.push({
        key: `due-${s.code}`,
        date: s.dueOn,
        time: null,
        title: s.name,
        sub: s.level === 'overdue' ? 'überfällig' : 'fällig',
        kind: 'due',
        onPress: () => openStatus(router, s),
      });
    }
    return list.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.data, maintenance.data, year, month]);

  const marked = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
  const visible = selected ? entries.filter((e) => e.date === selected) : entries;

  return (
    <Screen title="Kalender & Termine">
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="Vorheriger Monat" hitSlop={10}>
            <Icon name="zurueck" size={22} />
          </Pressable>
          <H2>
            {monthNames[month]} {year}
          </H2>
          <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel="Nächster Monat" hitSlop={10}>
            <Icon name="weiter" size={22} />
          </Pressable>
        </View>
        <MonthGrid year={year} month={month} marked={marked} selected={selected} onSelect={(d) => setSelected(d === selected ? null : d)} />
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H2>{selected ? formatDate(selected) : 'In diesem Monat'}</H2>
        {selected ? (
          <Pressable onPress={() => setSelected(null)} accessibilityRole="button">
            <Text style={{ color: accent.accent, fontWeight: '600' }}>Alle zeigen</Text>
          </Pressable>
        ) : null}
      </View>
      {events.error ? <ErrorBox message={events.error} /> : null}
      {visible.length === 0 ? <Body muted>Keine Termine.</Body> : null}
      {visible.map((e) => (
          <Pressable key={e.key} onPress={e.onPress} onLongPress={e.onLongPress} disabled={!e.onPress && !e.onLongPress}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: e.kind === 'due' ? colors.warningSoft : accent.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '700', color: e.kind === 'due' ? colors.warning : accent.accent }}>
                  {Number(e.date.slice(8, 10))}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: e.kind === 'due' ? colors.warning : accent.accent }}>
                  {monthNames[Number(e.date.slice(5, 7)) - 1].slice(0, 3).toUpperCase()}
                </Text>
              </View>
              <View style={{ flexShrink: 1 }}>
                <Body style={{ fontWeight: '700' }}>{e.title}</Body>
                <Small>
                  {e.sub}
                  {e.time ? ` · ${e.time} Uhr` : ''}
                </Small>
              </View>
            </Card>
          </Pressable>
      ))}
      <Button label="Termin planen" icon="plus" onPress={() => router.push({ pathname: '/termine/neu', params: { date: selected ?? '' } })} />
      <Small>Lange auf einen eigenen Termin drücken, um ihn zu löschen.</Small>
    </Screen>
  );
}
