import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, Text, View } from 'react-native';

import { Body, Card, ErrorBox, H2, Loading, Screen, Small } from '@/components/ui';
import { getTaskSources, getTaskTypes } from '@/lib/data';
import { useFocusData } from '@/lib/hooks';
import { describeIntervalSub } from '@/lib/maintenance';
import { colors, useTheme } from '@/theme/theme';

export default function Quellen() {
  const router = useRouter();
  const { accent } = useTheme();
  const { data, error, loading } = useFocusData(async () => {
    const [types, sources] = await Promise.all([getTaskTypes(), getTaskSources()]);
    return { types, sources };
  });

  return (
    <Screen title="Woher die Werte stammen" onBack={() => router.back()}>
      <Body muted>
        Für viele Modelle kennt die App die Werte des Herstellers. Wo nichts bekannt ist, nimmt sie diese Richtwerte. Im
        Handbuch deines Motorrads steht immer der genaue Wert. Du kannst jedes Intervall bei deinem Motorrad anpassen.
      </Body>
      {error ? <ErrorBox message={error} /> : null}
      {loading && !data ? <Loading /> : null}
      {data?.types
        .filter((t) => t.default_interval_km || t.default_interval || t.code === 'mfk')
        .map((t) => {
          const links = data.sources.filter((s) => s.task_type_code === t.code && s.data_sources);
          return (
            <Card key={t.code} style={{ gap: 8 }}>
              <H2 style={{ fontSize: 18 }}>{t.name_i18n.de ?? t.code}</H2>
              {t.code !== 'mfk' ? (
                <Body style={{ fontWeight: '600' }}>{describeIntervalSub(t.default_interval_km, t.default_interval)}</Body>
              ) : null}
              {t.description_i18n?.de ? <Small>{t.description_i18n.de}</Small> : null}
              <View style={{ gap: 6 }}>
                {links.map((l) => (
                  <Pressable
                    key={l.data_sources!.code}
                    onPress={() => l.data_sources?.url && WebBrowser.openBrowserAsync(l.data_sources.url)}
                    accessibilityRole="link"
                  >
                    <Text style={{ color: accent.accent, fontSize: 13, fontWeight: '600' }}>
                      {l.data_sources!.title ?? l.data_sources!.code} ›
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          );
        })}
      <Small style={{ color: colors.muted }}>Abgerufen im November 2026.</Small>
    </Screen>
  );
}
