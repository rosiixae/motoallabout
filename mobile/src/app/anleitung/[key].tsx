import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Body, Button, Card, H2, IconBadge, ProgressBar, Screen, Small } from '@/components/ui';
import { guides } from '@/content/guides';
import { addMaintenanceEvent, motorcycleTitle } from '@/lib/data';
import { toIsoDate } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import type { GuideKey } from '@/lib/maintenance';
import { useMaintenance } from '@/lib/useMaintenance';
import { colors, useTheme } from '@/theme/theme';

export default function Anleitung() {
  const router = useRouter();
  const { accent } = useTheme();
  const { key, task } = useLocalSearchParams<{ key: GuideKey; task?: string }>();
  const guide = guides[key];
  const { current } = useGarage();
  const maintenance = useMaintenance(current);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!guide) {
    return (
      <Screen title="Anleitung" onBack={() => router.back()}>
        <Body muted>Diese Anleitung gibt es nicht.</Body>
      </Screen>
    );
  }

  const status = maintenance.data?.statuses.find((s) => s.code === (task ?? guide.tasks[0]));
  const variant = current?.model_variants;

  async function markDone() {
    if (!current) return;
    if (!guide.tasks.length) {
      setDone(true);
      return;
    }
    setSaving(true);
    try {
      await addMaintenanceEvent(current.id, {
        performed_on: toIsoDate(new Date()),
        odometer_km: maintenance.data?.currentKm || null,
        performed_by: 'self',
        total_cost: null,
        notes: null,
        tasks: guide.tasks,
      });
      setDone(true);
      void maintenance.reload();
    } catch {
      Alert.alert('Speichern hat nicht geklappt', 'Bitte versuche es nochmals.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen kicker={guide.kind === 'diy' ? 'Wartung' : 'Selbst prüfen'} title={guide.title} onBack={() => router.back()}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconBadge name={guide.icon} size={48} tone={status?.level === 'overdue' ? 'danger' : status?.level === 'due' ? 'warning' : 'accent'} />
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{guide.subtitle}</Text>
            {status ? <Small>{status.label === 'heute' ? 'Heute fällig' : status.label}</Small> : null}
          </View>
        </View>
        {status ? <ProgressBar value={status.progress} /> : null}
        <Body muted>{guide.hint}</Body>
      </Card>

      {key === 'oelwechsel' && current ? (
        <Card style={{ backgroundColor: accent.accentSoft, borderColor: accent.accentSoft, gap: 6 }}>
          <Small style={{ fontWeight: '700', color: accent.accentDark }}>FÜR DEINE {motorcycleTitle(current).full.toUpperCase()}</Small>
          <Body>
            Öl: {variant?.oil_spec ?? 'siehe Handbuch'}
            {variant?.oil_capacity_with_filter_l ? ` · Menge mit Filter: ca. ${String(variant.oil_capacity_with_filter_l).replace('.', ',')} L` : ''}
            {status?.sub ? ` · ${status.sub}` : ''}
          </Body>
        </Card>
      ) : null}

      {guide.material ? (
        <Card style={{ gap: 8 }}>
          <H2>Das brauchst du</H2>
          {guide.material.map((m) => (
            <View key={m} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="check" size={16} color={accent.accent} />
              <Body>{m}</Body>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <H2>{guide.stepsTitle}</H2>
        {guide.steps.map((step, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: accent.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.white, fontWeight: '700' }}>{i + 1}</Text>
            </View>
            <Body style={{ flex: 1 }}>{step}</Body>
          </View>
        ))}
      </Card>

      {guide.info ? (
        <Card style={{ backgroundColor: colors.warningSoft, borderColor: '#FCD34D', gap: 6 }}>
          <Body style={{ fontWeight: '700' }}>{guide.info.title}</Body>
          <Body>{guide.info.text}</Body>
        </Card>
      ) : null}

      {done ? (
        <Card style={{ backgroundColor: colors.successSoft, borderColor: colors.successSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name="check" size={22} color={colors.success} />
          <Body style={{ fontWeight: '700', color: colors.success }}>
            {guide.kind === 'diy' ? 'Erledigt, gut gemacht!' : 'Geprüft, alles gut.'}
          </Body>
        </Card>
      ) : (
        <Button
          label={guide.kind === 'diy' ? 'Erledigt' : 'Alles in Ordnung'}
          icon="check"
          onPress={markDone}
          loading={saving}
          disabled={!current}
        />
      )}
      {guide.kind === 'check' || key === 'oelwechsel' ? (
        <Button
          label={guide.kind === 'check' ? 'Nicht in Ordnung: Werkstatt-Termin' : 'Lieber die Werkstatt machen lassen'}
          variant="secondary"
          onPress={() => router.push({ pathname: '/termin', params: { task: task ?? guide.tasks[0] ?? '' } })}
        />
      ) : null}
    </Screen>
  );
}
