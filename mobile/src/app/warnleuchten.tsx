import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Body, Card, Chip, ErrorBox, Loading, Screen, Small } from '@/components/ui';
import { lampColorFor, warningSvg } from '@/content/warningIcons';
import { getWarningLights } from '@/lib/data';
import { useFocusData } from '@/lib/hooks';
import type { WarningLight } from '@/lib/types';
import { colors } from '@/theme/theme';

const groups: { code: WarningLight['severity_code']; title: string; text: string }[] = [
  { code: 'red', title: 'Rot', text: 'Sofort anhalten, sobald es sicher geht, und den Motor abstellen.' },
  { code: 'yellow', title: 'Gelb', text: 'Bald prüfen oder in die Werkstatt fahren.' },
  { code: 'info', title: 'Grün und Blau', text: 'Nur eine Information, kein Problem.' },
];

function LightCard({ light }: { light: WarningLight }) {
  const [open, setOpen] = useState(false);
  const tr = light.warning_light_translations.find((t) => t.locale_code === 'de') ?? light.warning_light_translations[0];
  const svg = warningSvg(light.icon_key ?? light.code);
  const color = lampColorFor(light.code, light.severity_code);
  if (!tr) return null;
  return (
    <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
      <Card style={{ gap: 10, padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#101215', alignItems: 'center', justifyContent: 'center' }}>
            {svg ? <SvgXml xml={svg} width={38} height={38} color={color} /> : null}
          </View>
          <View style={{ flexShrink: 1, gap: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{tr.name}</Text>
            {tr.aliases ? <Small>{tr.aliases}</Small> : null}
            <Small>{light.is_standardized ? 'Genormtes Symbol' : 'Sieht je nach Marke anders aus'}</Small>
          </View>
        </View>
        {open ? (
          <View style={{ gap: 6 }}>
            <Small style={{ fontWeight: '700' }}>Bedeutung</Small>
            <Body>{tr.meaning}</Body>
            <Small style={{ fontWeight: '700' }}>Was tun</Small>
            <Body>{tr.action}</Body>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

export default function Warnleuchten() {
  const router = useRouter();
  const [filter, setFilter] = useState<WarningLight['severity_code'] | null>(null);
  const { data, error, loading } = useFocusData(getWarningLights);

  return (
    <Screen title="Warnleuchten" onBack={() => router.back()}>
      <Body muted>Tippe auf ein Symbol für Bedeutung und was du tun sollst.</Body>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="Alle" selected={!filter} onPress={() => setFilter(null)} />
        {groups.map((g) => (
          <Chip key={g.code} label={g.title} selected={filter === g.code} onPress={() => setFilter(g.code)} />
        ))}
      </ScrollView>
      {error ? <ErrorBox message={error} /> : null}
      {loading && !data ? <Loading /> : null}
      {groups
        .filter((g) => !filter || g.code === filter)
        .map((g) => (
          <View key={g.code} style={{ gap: 10 }}>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{g.title}</Text>
              <Small>{g.text}</Small>
            </View>
            {(data ?? [])
              .filter((l) => l.severity_code === g.code)
              .map((l) => (
                <LightCard key={l.code} light={l} />
              ))}
          </View>
        ))}
      <Small>
        Die Symbole sind stilisiert und sehen nicht bei jedem Motorrad gleich aus. Was die Leuchten an deinem Motorrad bedeuten, steht im
        Handbuch.
      </Small>
    </Screen>
  );
}
