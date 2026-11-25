import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, Text, View } from 'react-native';

import { Body, Button, Card, ErrorBox, H2, Loading, Screen, Small } from '@/components/ui';
import { deleteCalendarEvent, getCalendarEvent } from '@/lib/data';
import { formatDate, toIsoDate } from '@/lib/format';
import { useFocusData } from '@/lib/hooks';
import { inviteByMail, mapsUrl, routeUrl, shareInvite, telUrl, websiteUrl } from '@/lib/links';
import { colors, useTheme } from '@/theme/theme';

const typeText = { workshop_appointment: 'Werkstatt-Termin', maintenance: 'Wartung', tour: 'Ausfahrt', other: 'Termin' } as const;
const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function Line({ label, value, action, onPress }: { label: string; value: string; action?: string; onPress?: () => void }) {
  const { accent } = useTheme();
  return (
    <View style={{ gap: 2 }}>
      <Small style={{ fontWeight: '600' }}>{label}</Small>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{value}</Text>
      {action && onPress ? (
        <Text onPress={onPress} accessibilityRole="link" style={{ fontSize: 14, fontWeight: '600', color: accent.accent }}>
          {action} ›
        </Text>
      ) : null}
    </View>
  );
}

export default function TerminDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useFocusData(() => getCalendarEvent(id), [id]);
  const e = event.data;

  function remove() {
    if (!e) return;
    Alert.alert('Termin löschen?', e.title, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCalendarEvent(e.id);
            router.back();
          } catch {
            Alert.alert('Löschen hat nicht geklappt');
          }
        },
      },
    ]);
  }

  if (event.loading && !e) {
    return (
      <Screen title="Termin" onBack={() => router.back()}>
        <Loading />
      </Screen>
    );
  }
  if (!e) {
    return (
      <Screen title="Termin" onBack={() => router.back()}>
        {event.error ? <ErrorBox message={event.error} /> : <Body>Diesen Termin gibt es nicht mehr.</Body>}
      </Screen>
    );
  }

  const start = new Date(e.starts_at);
  const day = `${weekdays[start.getDay()]}, ${formatDate(toIsoDate(start))}`;
  const time = e.is_all_day ? null : `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} Uhr`;
  const isTour = e.event_type === 'tour';
  const isWorkshop = e.event_type === 'workshop_appointment';
  const hasWorkshopContact = !!(e.place_name || e.phone || e.website || e.location);

  return (
    <Screen title={e.title} kicker={typeText[e.event_type]} onBack={() => router.back()}>
      <Card style={{ gap: 14 }}>
        <Line label="Datum" value={day} />
        {time ? <Line label="Zeit" value={time} /> : null}
        {isTour && e.location ? (
          <Line label="Treffpunkt" value={e.location} action="Auf der Karte zeigen" onPress={() => Linking.openURL(mapsUrl(e.location!))} />
        ) : null}
        {isTour && e.destination ? (
          <Line label="Ziel" value={e.destination} action="Auf der Karte zeigen" onPress={() => Linking.openURL(mapsUrl(e.destination!))} />
        ) : null}
        {isTour && e.location && e.destination ? (
          <Line label="Route" value="Vom Treffpunkt zum Ziel" action="Route öffnen" onPress={() => Linking.openURL(routeUrl(e.location!, e.destination!))} />
        ) : null}
        {e.notes ? <Line label="Notiz" value={e.notes} /> : null}
      </Card>

      {isTour ? (
        <View style={{ gap: 10 }}>
          <H2>Leute einladen</H2>
          <Small>Die Einladung enthält Datum, Zeit, Treffpunkt und Ziel mit Link zur Karte.</Small>
          <Button label="Per E-Mail einladen" onPress={() => void inviteByMail(e)} />
          <Button label="Anders teilen (z. B. WhatsApp)" variant="secondary" onPress={() => void shareInvite(e)} />
        </View>
      ) : null}

      {isWorkshop ? (
        <Card style={{ gap: 12 }}>
          <H2>{e.place_name || 'Werkstatt'}</H2>
          {e.location ? <Body>{e.location}</Body> : null}
          {e.phone ? <Button label={`Anrufen: ${e.phone}`} onPress={() => Linking.openURL(telUrl(e.phone!))} /> : null}
          {e.website ? (
            <Button label="Website öffnen" variant="secondary" onPress={() => void WebBrowser.openBrowserAsync(websiteUrl(e.website!))} />
          ) : null}
          {e.location ? (
            <Button label="Route zur Werkstatt" variant="secondary" onPress={() => Linking.openURL(mapsUrl(e.location!))} />
          ) : null}
          {!hasWorkshopContact ? <Small>Für diesen Termin sind keine Angaben zur Werkstatt gespeichert.</Small> : null}
        </Card>
      ) : null}

      <Button label="Termin löschen" variant="danger" onPress={remove} />
    </Screen>
  );
}
