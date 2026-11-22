import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { Body, Button, Card, Chip, H2, Loading, Screen, Small } from '@/components/ui';
import { workshopWhy } from '@/content/workshop';
import { getWorkshops, motorcycleTitle } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { useFocusData } from '@/lib/hooks';
import { useMaintenance } from '@/lib/useMaintenance';
import { colors, useTheme } from '@/theme/theme';

function recommendation(level: string | undefined, label: string | undefined): string {
  if (level === 'overdue') return 'So bald wie möglich';
  if (level === 'due') return 'In den nächsten Wochen';
  return label ? `Fällig ${label}` : 'Beim nächsten Service';
}

export default function Termin() {
  const router = useRouter();
  const { accent } = useTheme();
  const params = useLocalSearchParams<{ task?: string }>();
  const { current } = useGarage();
  const maintenance = useMaintenance(current);
  const workshops = useFocusData(getWorkshops);

  const workshopTasks = (maintenance.data?.statuses ?? []).filter((s) => !s.canDoYourself);
  const [selected, setSelected] = useState<string | null>(params.task || null);
  const status =
    maintenance.data?.statuses.find((s) => s.code === selected) ?? workshopTasks.find((s) => s.level !== 'ok') ?? workshopTasks[0];

  // Andere fällige Werkstatt-Arbeiten, die man gleich mitmachen kann
  const combine = workshopTasks.filter((s) => s.code !== status?.code && (s.level === 'due' || s.level === 'overdue'));

  function searchWorkshops() {
    const brand = current ? motorcycleTitle(current).brand : '';
    const q = encodeURIComponent(`Motorrad Werkstatt ${brand}`.trim());
    void Linking.openURL(`https://www.google.com/maps/search/${q}`);
  }

  return (
    <Screen title="Werkstatt-Termin" onBack={() => router.back()}>
      {maintenance.loading && !maintenance.data ? <Loading /> : null}

      {workshopTasks.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {workshopTasks.map((s) => (
            <Chip key={s.code} label={s.name} selected={status?.code === s.code} onPress={() => setSelected(s.code)} />
          ))}
        </View>
      ) : null}

      {status ? (
        <Card style={{ backgroundColor: accent.accentSoft, borderColor: accent.accentSoft, gap: 8 }}>
          <Small style={{ fontWeight: '700', color: accent.accentDark }}>EMPFOHLENER TERMIN · {status.name.toUpperCase()}</Small>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{recommendation(status.level, status.label)}</Text>
          {status.dueOn ? <Small>Spätestens am {formatDate(status.dueOn)}</Small> : null}
          {workshopWhy[status.code] ? <Body>{workshopWhy[status.code]}</Body> : null}
          {combine.length ? (
            <Body style={{ fontWeight: '600' }}>Gleich mitmachen lassen: {combine.map((c) => c.name).join(', ')}</Body>
          ) : null}
        </Card>
      ) : null}

      <View style={{ gap: 4 }}>
        <H2>Werkstätten</H2>
        <Small>Ruf die Werkstatt an oder buche den Termin auf ihrer Website.</Small>
      </View>
      {(workshops.data ?? []).map((w) => (
        <Card key={w.id} style={{ gap: 6 }}>
          <Body style={{ fontWeight: '700' }}>{w.name}</Body>
          {w.street || w.city ? <Small>{[w.street, [w.postal_code, w.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</Small> : null}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {w.phone ? (
              <Pressable onPress={() => Linking.openURL(`tel:${w.phone}`)} accessibilityRole="link">
                <Text style={{ color: accent.accent, fontWeight: '600' }}>Anrufen</Text>
              </Pressable>
            ) : null}
            {w.booking_url || w.website_url ? (
              <Pressable onPress={() => WebBrowser.openBrowserAsync((w.booking_url ?? w.website_url) as string)} accessibilityRole="link">
                <Text style={{ color: accent.accent, fontWeight: '600' }}>Zur Website ›</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      ))}
      <Button label="Werkstätten in der Nähe suchen" variant="secondary" icon="link" onPress={searchWorkshops} />

      <Card style={{ gap: 8 }}>
        <Body style={{ fontWeight: '700' }}>Termin gebucht?</Body>
        <Small>Trag ihn im Kalender ein. Die App erinnert dich am Tag vorher.</Small>
        <Button
          label="Im Kalender eintragen"
          onPress={() =>
            router.push({
              pathname: '/kalender/neu',
              params: { type: 'workshop_appointment', task: status?.code ?? '', title: status ? `Werkstatt: ${status.name}` : 'Werkstatt-Termin' },
            })
          }
        />
      </Card>
    </Screen>
  );
}
