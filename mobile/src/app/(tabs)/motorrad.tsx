import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { categories, drives } from '@/components/MotorcycleForm';
import { Body, Button, Card, Chip, H2, Loading, Screen, Small } from '@/components/ui';
import { motorcycleCategory, motorcycleDrive, motorcycleTitle } from '@/lib/data';
import { formatDate, formatKm } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { useMaintenance } from '@/lib/useMaintenance';
import { colors, useTheme } from '@/theme/theme';

const upgrades: { label: string; icon: IconName; query: string }[] = [
  { label: 'Auspuff', icon: 'auspuff', query: 'Auspuff' },
  { label: 'Spiegel', icon: 'spiegel', query: 'Spiegel' },
  { label: 'Blinker', icon: 'blinker', query: 'Blinker' },
  { label: 'Heck-Umbau', icon: 'heck', query: 'Heckumbau Kennzeichenhalter' },
  { label: 'Sattel', icon: 'sattel', query: 'Sitzbank' },
];

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Small style={{ fontWeight: '600' }}>{label}</Small>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{value}</Text>
    </View>
  );
}

export default function MeinMotorrad() {
  const router = useRouter();
  const { accent } = useTheme();
  const { motorcycles, current, select, loading } = useGarage();
  const maintenance = useMaintenance(current);

  if (loading) {
    return (
      <Screen title="Mein Motorrad">
        <Loading />
      </Screen>
    );
  }

  if (!current) {
    return (
      <Screen title="Mein Motorrad">
        <Card>
          <H2>Noch kein Motorrad</H2>
          <Body muted>Leg dein Motorrad an, damit die App weiss, was wann fällig ist.</Body>
          <Button label="Motorrad hinzufügen" icon="plus" onPress={() => router.push('/fahrzeug/neu')} />
        </Card>
      </Screen>
    );
  }

  const title = motorcycleTitle(current);
  const category = categories.find((c) => c.code === motorcycleCategory(current))?.label ?? 'Kategorie offen';
  const drive = drives.find((d) => d.code === motorcycleDrive(current))?.label ?? 'Antrieb offen';
  const variant = current.model_variants;
  const nextMfk = maintenance.data?.statuses.find((s) => s.code === 'mfk')?.dueOn ?? null;

  function shop(query: string) {
    const q = encodeURIComponent(`${query} ${title.full} kaufen Schweiz`);
    void WebBrowser.openBrowserAsync(`https://www.google.com/search?q=${q}`);
  }

  return (
    <Screen
      title="Mein Motorrad"
      right={
        <Pressable
          onPress={() => router.push({ pathname: '/fahrzeug/[id]', params: { id: current.id } })}
          accessibilityRole="button"
          accessibilityLabel="Motorrad bearbeiten"
          style={{ paddingHorizontal: 12, minHeight: 40, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: accent.accent }}
        >
          <Text style={{ color: accent.accent, fontWeight: '600' }}>Bearbeiten</Text>
        </Pressable>
      }
    >
      {motorcycles.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {motorcycles.map((m) => (
            <Chip key={m.id} label={m.nickname || motorcycleTitle(m).full} selected={m.id === current.id} onPress={() => select(m.id)} />
          ))}
        </ScrollView>
      ) : null}

      <Card>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Info label="Marke" value={title.brand || '–'} />
          <Info label="Modell" value={title.model || '–'} />
          <Info label="Jahrgang" value={current.model_year ? String(current.model_year) : '–'} />
        </View>
        <View
          style={{
            minHeight: 190,
            borderRadius: 14,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="motorrad" size={110} color={accent.accent} strokeWidth={1.2} />
          <Small>
            {category} · {drive}
          </Small>
          {current.nickname ? <Body style={{ fontWeight: '700' }}>«{current.nickname}»</Body> : null}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <H2>Daten</H2>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Info label="Kilometer" value={maintenance.data ? formatKm(maintenance.data.currentKm) : '…'} />
          <Info label="Nächste MFK" value={nextMfk ? formatDate(nextMfk) : 'offen'} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Info label="Öl" value={variant?.oil_spec ?? 'siehe Handbuch'} />
          <Info
            label="Ölmenge"
            value={variant?.oil_capacity_with_filter_l ? `ca. ${String(variant.oil_capacity_with_filter_l).replace('.', ',')} L` : 'siehe Handbuch'}
          />
        </View>
        {variant ? (
          <Small style={{ color: variant.data_status_code === 'verified' ? colors.success : colors.warning }}>
            {variant.data_status_code === 'verified'
              ? 'Herstellerwerte geprüft'
              : variant.data_status_code === 'to_check'
                ? 'Werte bitte im Handbuch prüfen'
                : 'Für dieses Modell fehlen noch Herstellerwerte'}
          </Small>
        ) : (
          <Small>Eigenes Modell: die App rechnet mit allgemeinen Richtwerten.</Small>
        )}
      </Card>

      <View style={{ gap: 4 }}>
        <H2>Möglichkeiten für Umbauten</H2>
        <Small>Achte bei Auspuff, Blinkern und Spiegeln auf die Zulassung (E-Nummer), sonst gibt es Probleme bei der MFK.</Small>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {upgrades.map((u) => (
          <Pressable
            key={u.label}
            onPress={() => shop(u.query)}
            accessibilityRole="link"
            style={{
              width: '48%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: accent.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={u.icon} size={22} color={accent.accent} strokeWidth={1.8} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{u.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: accent.accent }}>Zu den Shops ›</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Button label="Weiteres Motorrad hinzufügen" icon="plus" variant="secondary" onPress={() => router.push('/fahrzeug/neu')} />
    </Screen>
  );
}
