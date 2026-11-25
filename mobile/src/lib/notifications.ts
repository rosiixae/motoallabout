// Erinnerungen als Mitteilung auf dem Handy (lokal geplant, ohne Server).
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { addMonths, parseDate } from './format';
import type { TaskStatus } from './maintenance';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const MAINTENANCE_PREFIX = 'wartung-';
const KM_REMINDER_ID = 'km-woechentlich';

const CHANNEL_ID = 'erinnerungen';
let channelReady: Promise<boolean> | null = null;

/** Android: Kanal «Erinnerungen» einmal anlegen. Klappt das nicht, nutzt Android seinen Standardkanal. */
function ensureChannel(): Promise<boolean> {
  if (Platform.OS !== 'android') return Promise.resolve(true);
  if (!channelReady) {
    channelReady = (async () => {
      try {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Erinnerungen',
          description: 'Wartung, Saison, Termine und Kilometerstand',
          importance: Notifications.AndroidImportance.DEFAULT,
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C2410C',
          showBadge: false,
        });
        return true;
      } catch {
        try {
          await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: 'Erinnerungen',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
          return true;
        } catch {
          return false;
        }
      }
    })();
  }
  return channelReady;
}

/** Fragt bei Bedarf nach der Erlaubnis für Mitteilungen. Wirft nie einen Fehler. */
export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    // Android 13+: Kanal vor der Anfrage anlegen, sonst erscheint die Anfrage nicht
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

async function channelOption(): Promise<{ channelId?: string }> {
  return (await ensureChannel()) && Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {};
}

function at(date: Date, hour: number, minute = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
}

async function scheduleAt(identifier: string, title: string, body: string, date: Date, data: Record<string, string> = {}) {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, ...(await channelOption()) },
  });
}

/** Erinnerung am Vortag eines Kalender-Termins (bei ganztägigen Terminen am Vortag um 18 Uhr). */
export async function scheduleEventReminder(title: string, start: Date, allDay: boolean): Promise<void> {
  try {
    if (!(await ensurePermission())) return;
    const dayBefore = new Date(start);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const when = allDay ? at(dayBefore, 18) : new Date(start.getTime() - 24 * 3600 * 1000);
    const time = allDay ? '' : ` um ${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')} Uhr`;
    await scheduleAt(`termin-${start.getTime()}`, 'Morgen: ' + title, `Dein Termin ist morgen${time}.`, when);
  } catch {
    // Erinnerung ist ein Extra: Termin bleibt trotzdem gespeichert
  }
}

/**
 * Plant die Wartungs-Erinnerungen neu (wird beim Öffnen der Startseite aufgerufen).
 * Nur Aufgaben mit Datum lassen sich planen; km-Aufgaben zeigt die Startseite an.
 */
export async function syncMaintenanceReminders(
  statuses: TaskStatus[],
  options: { enabled: boolean; seasonal: boolean; daysBefore: number; bikeName: string },
): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.identifier.startsWith(MAINTENANCE_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
    if (!options.enabled) return;
    const granted = (await Notifications.getPermissionsAsync()).granted;
    if (!granted) return;

    const limit = addMonths(new Date(), 6);
    for (const s of statuses) {
      if (!s.dueOn || s.level === 'unknown') continue;
      if (s.intervalSource === 'season' && !options.seasonal) continue;
      const due = parseDate(s.dueOn);
      if (due > limit) continue;
      const remind = new Date(due);
      remind.setDate(remind.getDate() - options.daysBefore);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const when = at(remind < tomorrow ? tomorrow : remind, 9, 0);
      const body =
        s.level === 'overdue'
          ? `${s.name} ist fällig. Tippe hier für die Details.`
          : `${s.name} wird bald fällig (${s.label}).`;
      await scheduleAt(`${MAINTENANCE_PREFIX}${s.code}`, options.bikeName, body, when, { code: s.code });
    }
  } catch {
    // ohne Erinnerungen läuft die App normal weiter
  }
}

/** Wöchentliche Erinnerung, den Kilometerstand einzutragen (Sonntag 18 Uhr). */
export async function setWeeklyKmReminder(on: boolean): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(KM_REMINDER_ID);
    if (!on || !(await ensurePermission())) return;
    await Notifications.scheduleNotificationAsync({
      identifier: KM_REMINDER_ID,
      content: { title: 'Kilometerstand eintragen', body: 'Bist du diese Woche gefahren? Trag den Stand ein, dann stimmen die Erinnerungen.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 18,
        minute: 0,
        ...(await channelOption()),
      },
    });
  } catch {
    // ignorieren
  }
}

export async function hasWeeklyKmReminder(): Promise<boolean> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    return all.some((n) => n.identifier === KM_REMINDER_ID);
  } catch {
    return false;
  }
}
