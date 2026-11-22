import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Body, Button, Card, ListRow, Screen, Small } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { getProfile } from '@/lib/data';
import { useFocusData } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { accentThemes, colors, useTheme, type AccentName } from '@/theme/theme';

export default function Profil() {
  const router = useRouter();
  const { session, userId } = useAuth();
  const { accent, accentName, setAccentName } = useTheme();
  const profile = useFocusData(() => (userId ? getProfile(userId) : Promise.resolve(null)), [userId]);
  const [deleting, setDeleting] = useState(false);

  function signOut() {
    Alert.alert('Abmelden?', 'Deine Daten bleiben gespeichert.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: () => void supabase.auth.signOut() },
    ]);
  }

  function deleteAccount() {
    Alert.alert(
      'Konto löschen?',
      'Dein Konto, deine Motorräder, Wartungen und Termine werden endgültig gelöscht. Das kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Endgültig löschen',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const { error } = await supabase.rpc('delete_my_account');
            setDeleting(false);
            if (error) {
              Alert.alert('Das hat nicht geklappt', 'Bitte versuche es später nochmals.');
              return;
            }
            await supabase.auth.signOut();
          },
        },
      ],
    );
  }

  const name = profile.data?.display_name;

  return (
    <Screen title="Profil">
      <View style={{ alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 104,
            height: 104,
            borderRadius: 52,
            backgroundColor: colors.track,
            borderWidth: 3,
            borderColor: accent.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="profil" size={46} color={colors.muted} strokeWidth={1.6} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{name || 'Ohne Namen'}</Text>
        <Small>{session?.user.email}</Small>
      </View>

      <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
        <View style={{ minHeight: 64, paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Farbe</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }} accessibilityRole="radiogroup">
            {(Object.keys(accentThemes) as AccentName[]).map((n) => {
              const on = n === accentName;
              return (
                <Pressable
                  key={n}
                  onPress={() => setAccentName(n)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={n}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: accentThemes[n].accent,
                    borderWidth: 3,
                    borderColor: colors.white,
                    outlineWidth: 2,
                    outlineColor: on ? colors.text : colors.border,
                    outlineStyle: 'solid',
                  }}
                />
              );
            })}
          </View>
        </View>
        <ListRow label="Persönliche Angaben" onPress={() => router.push('/profil/angaben')} />
        <ListRow label="Meine Motorräder" onPress={() => router.push('/motorrad')} />
        <ListRow label="Erinnerungen" onPress={() => router.push('/profil/erinnerungen')} />
        <ListRow label="Woher die Werte stammen" onPress={() => router.push('/profil/quellen')} last />
      </Card>

      <Button label="Abmelden" variant="secondary" onPress={signOut} />
      <Button label="Konto löschen" variant="danger" onPress={deleteAccount} loading={deleting} />
      <Body muted style={{ fontSize: 12 }}>
        MotoAllAbout · Version 0.1
      </Body>
    </Screen>
  );
}
