// Links nach aussen: Karte, Telefon, Website, Einladung per E-Mail oder Teilen.
import { Linking, Share } from 'react-native';

import { formatDate, toIsoDate } from './format';
import type { CalendarEvent } from './types';

const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export function mapsUrl(place: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

export function routeUrl(from: string, to: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=driving`;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Ergänzt https://, falls jemand nur «moto-muster.ch» eingibt. */
export function websiteUrl(website: string): string {
  const w = website.trim();
  return /^https?:\/\//i.test(w) ? w : `https://${w}`;
}

function when(e: CalendarEvent): { day: string; time: string | null } {
  const d = new Date(e.starts_at);
  const day = `${weekdays[d.getDay()]}, ${formatDate(toIsoDate(d))}`;
  const time = e.is_all_day ? null : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr`;
  return { day, time };
}

/** Betreff und Text für die Einladung zu einer Ausfahrt. */
export function tourInvite(e: CalendarEvent): { subject: string; body: string } {
  const { day, time } = when(e);
  const lines = [
    'Hallo',
    '',
    `Ich lade dich zur Ausfahrt «${e.title}» ein.`,
    '',
    `Datum: ${day}`,
  ];
  if (time) lines.push(`Zeit: ${time}`);
  if (e.location) lines.push(`Treffpunkt: ${e.location}`, `  Karte: ${mapsUrl(e.location)}`);
  if (e.destination) lines.push(`Ziel: ${e.destination}`, `  Karte: ${mapsUrl(e.destination)}`);
  if (e.location && e.destination) lines.push(`Route: ${routeUrl(e.location, e.destination)}`);
  if (e.notes) lines.push('', e.notes);
  lines.push('', 'Gibst du mir Bescheid, ob du dabei bist?', '', 'Gesendet mit MotoAllAbout');
  return { subject: `Einladung zur Ausfahrt: ${e.title}`, body: lines.join('\n') };
}

/** Öffnet das Mail-Programm mit fertiger Einladung. Ohne Mail-Programm: Teilen-Menü. */
export async function inviteByMail(e: CalendarEvent): Promise<void> {
  const { subject, body } = tourInvite(e);
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  try {
    await Linking.openURL(url);
  } catch {
    await shareInvite(e);
  }
}

/** Teilen-Menü des Handys (z. B. WhatsApp, Nachrichten). */
export async function shareInvite(e: CalendarEvent): Promise<void> {
  const { subject, body } = tourInvite(e);
  try {
    await Share.share({ title: subject, message: body });
  } catch {
    // abgebrochen
  }
}
