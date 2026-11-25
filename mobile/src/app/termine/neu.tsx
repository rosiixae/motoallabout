import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Button, Chip, ErrorBox, Field, Screen, Small } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { addCalendarEvent, getLastWorkshopContact } from '@/lib/data';
import { formatDate, parseSwissDate, toIsoDate } from '@/lib/format';
import { useGarage } from '@/lib/garage';
import { scheduleEventReminder } from '@/lib/notifications';
import type { CalendarEvent } from '@/lib/types';

const types: { code: CalendarEvent['event_type']; label: string }[] = [
  { code: 'workshop_appointment', label: 'Werkstatt' },
  { code: 'maintenance', label: 'Wartung' },
  { code: 'tour', label: 'Ausfahrt' },
  { code: 'other', label: 'Anderes' },
];

export default function NeuerTermin() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; type?: string; task?: string; title?: string }>();
  const { userId } = useAuth();
  const { current } = useGarage();
  const [title, setTitle] = useState(params.title ?? '');
  const [date, setDate] = useState(formatDate(params.date || toIsoDate(new Date())));
  const [time, setTime] = useState('');
  const [type, setType] = useState<CalendarEvent['event_type']>(
    (types.find((t) => t.code === params.type)?.code ?? 'other') as CalendarEvent['event_type'],
  );
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  // Werkstatt: Angaben vom letzten Werkstatt-Termin vorschlagen
  useEffect(() => {
    if (type !== 'workshop_appointment' || prefilled) return;
    setPrefilled(true);
    getLastWorkshopContact()
      .then((w) => {
        if (!w) return;
        setPlaceName((v) => v || w.place_name || '');
        setPhone((v) => v || w.phone || '');
        setWebsite((v) => v || w.website || '');
        setLocation((v) => v || w.location || '');
      })
      .catch(() => {});
  }, [type, prefilled]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!userId) return;
    setError(null);
    if (!title.trim()) return setError('Bitte einen Titel eingeben.');
    const iso = parseSwissDate(date);
    if (!iso) return setError('Datum bitte so eingeben: TT.MM.JJJJ');
    let hours = 0;
    let minutes = 0;
    if (time.trim()) {
      const m = time.trim().match(/^(\d{1,2})[:.](\d{2})$/);
      if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return setError('Uhrzeit bitte so eingeben: 14:30');
      hours = Number(m[1]);
      minutes = Number(m[2]);
    }
    const [y, mo, d] = iso.split('-').map(Number);
    const start = new Date(y, mo - 1, d, hours, minutes);
    const isTour = type === 'tour';
    const isWorkshop = type === 'workshop_appointment';
    const clean = (v: string) => v.trim() || null;
    setBusy(true);
    try {
      const id = await addCalendarEvent(userId, {
        title: title.trim(),
        starts_at: start.toISOString(),
        is_all_day: !time.trim(),
        event_type: type,
        motorcycle_id: current?.id ?? null,
        task_type_code: params.task || null,
        notes: notes.trim() || null,
        location: isTour || isWorkshop ? clean(location) : null,
        destination: isTour ? clean(destination) : null,
        place_name: isWorkshop ? clean(placeName) : null,
        phone: isWorkshop ? clean(phone) : null,
        website: isWorkshop ? clean(website) : null,
      });
      await scheduleEventReminder(title.trim(), start, !time.trim());
      router.replace({ pathname: '/termine/[id]', params: { id } });
    } catch {
      setError('Speichern hat nicht geklappt. Bitte versuche es nochmals.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Termin planen" onBack={() => router.back()}>
        <Field label="Titel" value={title} onChangeText={setTitle} placeholder="z. B. Service bei Moto Muster" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Datum" value={date} onChangeText={setDate} placeholder="TT.MM.JJJJ" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Uhrzeit (freiwillig)" value={time} onChangeText={setTime} placeholder="14:30" keyboardType="numbers-and-punctuation" />
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Small style={{ fontWeight: '600' }}>Art</Small>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {types.map((t) => (
              <Chip key={t.code} label={t.label} selected={type === t.code} onPress={() => setType(t.code)} />
            ))}
          </View>
        </View>
        {type === 'tour' ? (
          <>
            <Field label="Treffpunkt" value={location} onChangeText={setLocation} placeholder="z. B. Parkplatz Seedamm, Pfäffikon SZ" />
            <Field label="Ziel" value={destination} onChangeText={setDestination} placeholder="z. B. Klausenpass" />
          </>
        ) : null}
        {type === 'workshop_appointment' ? (
          <>
            <Field label="Werkstatt" value={placeName} onChangeText={setPlaceName} placeholder="z. B. Moto Muster AG" />
            <Field label="Telefon" value={phone} onChangeText={setPhone} placeholder="z. B. 044 123 45 67" keyboardType="phone-pad" />
            <Field
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="z. B. moto-muster.ch"
              keyboardType="url"
              autoCapitalize="none"
            />
            <Field label="Adresse" value={location} onChangeText={setLocation} placeholder="z. B. Hauptstrasse 1, 8000 Zürich" />
          </>
        ) : null}
        <Field label="Notiz (freiwillig)" value={notes} onChangeText={setNotes} multiline />
        {error ? <ErrorBox message={error} /> : null}
        <Button label="Im Kalender eintragen" onPress={save} loading={busy} />
        <Small>
          Die App erinnert dich am Tag vorher.{type === 'tour' ? ' Nach dem Speichern kannst du Leute per E-Mail einladen.' : ''}
        </Small>
      </Screen>
    </KeyboardAvoidingView>
  );
}
