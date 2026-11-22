import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Card, Chip, ErrorBox, Loading, Screen, Small } from '@/components/ui';
import { getTipCategories, getTips } from '@/lib/data';
import { useFocusData } from '@/lib/hooks';
import { colors, useTheme } from '@/theme/theme';

export default function Tipps() {
  const router = useRouter();
  const { accent } = useTheme();
  const [category, setCategory] = useState<string | null>(null);
  const { data, error, loading } = useFocusData(async () => {
    const [tips, categories] = await Promise.all([getTips(), getTipCategories()]);
    return { tips, categories };
  });

  const used = new Set((data?.tips ?? []).map((t) => t.category_code));
  const categories = (data?.categories ?? []).filter((c) => used.has(c.code));
  const tips = (data?.tips ?? []).filter((t) => !category || t.category_code === category);

  return (
    <Screen title="Tipps & Tricks">
      <Pressable onPress={() => router.push('/warnleuchten')} accessibilityRole="button">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#101215', borderColor: '#101215' }}>
          <Icon name="warnung" size={28} color="#FFB020" />
          <View style={{ flexShrink: 1 }}>
            <Text style={{ color: colors.white, fontSize: 17, fontWeight: '700' }}>Warnleuchten</Text>
            <Text style={{ color: '#C9CDC8', fontSize: 13 }}>Was bedeutet welches Symbol im Cockpit?</Text>
          </View>
        </Card>
      </Pressable>

      {categories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Alle" selected={!category} onPress={() => setCategory(null)} />
          {categories.map((c) => (
            <Chip key={c.code} label={c.name_i18n.de ?? c.code} selected={category === c.code} onPress={() => setCategory(c.code)} />
          ))}
        </ScrollView>
      ) : null}

      {error ? <ErrorBox message={error} /> : null}
      {loading && !data ? <Loading /> : null}

      {tips.map((t) => {
        const tr = t.tip_translations.find((x) => x.locale_code === 'de') ?? t.tip_translations[0];
        if (!tr) return null;
        return (
          <Pressable key={t.id} onPress={() => router.push({ pathname: '/tipp/[slug]', params: { slug: t.slug } })} accessibilityRole="button">
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flexShrink: 1, gap: 4 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{tr.title}</Text>
                {tr.summary ? <Small>{tr.summary}</Small> : null}
                {t.difficulty === 1 ? <Text style={{ fontSize: 12, fontWeight: '700', color: accent.accent }}>Für den Anfang</Text> : null}
              </View>
              <View style={{ marginLeft: 'auto' }}>
                <Icon name="weiter" size={20} color={colors.muted} />
              </View>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
