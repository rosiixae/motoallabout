// Rechnet aus, was am Motorrad wann fällig ist.
// Reine Funktionen ohne Supabase, damit sie sich testen lassen (maintenance.test.ts).

import type { IconName } from '../components/Icon';
import { addMonths, addYears, daysBetween, formatDate, formatNumber, monthNames, parseDate, toIsoDate } from './format';
import type { MaintenanceStatusRow, TaskType } from './types';

export type Level = 'ok' | 'due' | 'overdue' | 'unknown';

export type TaskStatus = {
  code: string;
  name: string;
  icon: IconName;
  /** 0 = gerade erledigt, 1 = fällig */
  progress: number;
  level: Level;
  /** z. B. "noch 320 km", "in 3 Tagen", "seit 5 Tagen fällig" */
  label: string;
  /** z. B. "alle 10'000 km oder 1 Jahr" */
  sub: string;
  dueOn: string | null;
  dueKm: number | null;
  canDoYourself: boolean;
  guide: GuideKey | null;
  intervalSource: MaintenanceStatusRow['interval_source'] | 'season' | 'law';
};

export type GuideKey =
  | 'kette'
  | 'oelwechsel'
  | 'reifendruck'
  | 'reifenprofil'
  | 'bremsbelaege'
  | 'bremsfluessigkeit'
  | 'kuehlfluessigkeit'
  | 'batterie';

export const taskMeta: Record<string, { icon: IconName; guide?: GuideKey }> = {
  oil_change: { icon: 'oel', guide: 'oelwechsel' },
  oil_filter: { icon: 'filter', guide: 'oelwechsel' },
  general_service: { icon: 'service' },
  valve_check: { icon: 'ventil' },
  chain_care: { icon: 'kette', guide: 'kette' },
  chain_check: { icon: 'kette', guide: 'kette' },
  shaft_oil: { icon: 'kardan' },
  belt_check: { icon: 'riemen' },
  cvt_service: { icon: 'variomatik' },
  tire_pressure: { icon: 'reifendruck', guide: 'reifendruck' },
  tire_check: { icon: 'profilReifen', guide: 'reifenprofil' },
  brake_fluid: { icon: 'bremsfl', guide: 'bremsfluessigkeit' },
  brake_pads: { icon: 'belag', guide: 'bremsbelaege' },
  coolant: { icon: 'kuehl', guide: 'kuehlfluessigkeit' },
  spark_plugs: { icon: 'zuendkerze' },
  air_filter: { icon: 'luftfilter' },
  battery: { icon: 'batterie', guide: 'batterie' },
  winter_prep: { icon: 'winter' },
  spring_check: { icon: 'fruehling', guide: 'batterie' },
  mfk: { icon: 'mfk' },
};

// ---------------------------------------------------------------------
// Postgres-Intervalle lesen: "1 year", "14 days", "3 mons", "1 year 2 mons", "P1Y2M"
// ---------------------------------------------------------------------
export type Interval = { years: number; months: number; days: number };

export function parseInterval(value: string | null | undefined): Interval | null {
  if (!value) return null;
  const iv: Interval = { years: 0, months: 0, days: 0 };
  let found = false;
  const iso = value.match(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?/);
  if (iso && iso[0] !== 'P') {
    iv.years = Number(iso[1] ?? 0);
    iv.months = Number(iso[2] ?? 0);
    iv.days = Number(iso[3] ?? 0) * 7 + Number(iso[4] ?? 0);
    return iv;
  }
  for (const m of value.matchAll(/(\d+)\s*(years?|mons?|months?|weeks?|days?)/g)) {
    const n = Number(m[1]);
    const unit = m[2];
    found = true;
    if (unit.startsWith('year')) iv.years += n;
    else if (unit.startsWith('mon')) iv.months += n;
    else if (unit.startsWith('week')) iv.days += n * 7;
    else iv.days += n;
  }
  return found ? iv : null;
}

export function intervalDays(iv: Interval): number {
  return iv.years * 365 + iv.months * 30.44 + iv.days;
}

export function subtractInterval(date: Date, iv: Interval): Date {
  const d = addMonths(date, -(iv.years * 12 + iv.months));
  d.setDate(d.getDate() - iv.days);
  return d;
}

export function addInterval(date: Date, iv: Interval): Date {
  const d = addMonths(date, iv.years * 12 + iv.months);
  d.setDate(d.getDate() + iv.days);
  return d;
}

/** "1 Jahr", "14 Tage", "2 Jahre", "6 Monate" */
export function describeInterval(iv: Interval): string {
  const parts: string[] = [];
  if (iv.years) parts.push(iv.years === 1 ? '1 Jahr' : `${iv.years} Jahre`);
  if (iv.months) parts.push(iv.months === 1 ? '1 Monat' : `${iv.months} Monate`);
  if (iv.days) {
    if (iv.days % 7 === 0 && iv.days >= 14) parts.push(`${iv.days / 7} Wochen`);
    else parts.push(iv.days === 1 ? '1 Tag' : `${iv.days} Tage`);
  }
  return parts.join(' ');
}

export function describeIntervalSub(km: number | null, period: string | null): string {
  const iv = parseInterval(period);
  if (km && iv) return `alle ${formatNumber(km)} km oder ${describeInterval(iv)}`;
  if (km) return `alle ${formatNumber(km)} km`;
  if (iv) return `alle ${describeInterval(iv)}`;
  return '';
}

/** "in 3 Tagen", "in 2 Wochen", "in 5 Monaten" */
export function describeDaysAhead(days: number): string {
  if (days < 0) {
    const d = -days;
    if (d === 1) return 'seit gestern fällig';
    if (d < 14) return `seit ${d} Tagen fällig`;
    if (d < 60) return `seit ${Math.round(d / 7)} Wochen fällig`;
    return `seit ${Math.round(d / 30.44)} Monaten fällig`;
  }
  if (days === 0) return 'heute';
  if (days === 1) return 'morgen';
  if (days < 14) return `in ${days} Tagen`;
  if (days < 60) return `in ${Math.round(days / 7)} Wochen`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `in ${months} Monaten`;
  return `in ${Math.round(days / 365)} Jahren`;
}

function taskName(task: TaskType | undefined, code: string): string {
  return task?.name_i18n?.de ?? code;
}

// ---------------------------------------------------------------------
// Normale Aufgaben (Zeile aus der View motorcycle_maintenance_status)
// ---------------------------------------------------------------------
export type Reminders = { kmBefore: number; daysBefore: number };
const defaultReminders: Reminders = { kmBefore: 500, daysBefore: 14 };

export function computeTaskStatus(
  row: MaintenanceStatusRow,
  task: TaskType | undefined,
  today: Date,
  reminders: Reminders = defaultReminders,
): TaskStatus {
  const meta = taskMeta[row.task_type_code] ?? { icon: 'service' as IconName };
  const iv = parseInterval(row.interval_period);

  // Kilometer
  let kmRemaining: number | null = null;
  let kmFrac: number | null = null;
  if (row.interval_km && row.due_at_km != null && row.current_km != null) {
    kmRemaining = row.due_at_km - row.current_km;
    kmFrac = 1 - kmRemaining / row.interval_km;
  }

  // Zeit
  let daysRemaining: number | null = null;
  let timeFrac: number | null = null;
  if (iv && row.due_on) {
    const due = parseDate(row.due_on);
    daysRemaining = daysBetween(today, due);
    const period = intervalDays(iv);
    timeFrac = period > 0 ? 1 - daysRemaining / period : null;
  }

  const fracs = [kmFrac, timeFrac].filter((f): f is number => f != null);
  const progress = fracs.length ? Math.max(0, Math.min(1, Math.max(...fracs))) : 0;

  let level: Level = 'unknown';
  if (kmRemaining != null || daysRemaining != null) {
    const soonKm = row.interval_km ? Math.min(reminders.kmBefore, row.interval_km * 0.2) : reminders.kmBefore;
    const soonDays = iv ? Math.min(reminders.daysBefore, intervalDays(iv) * 0.2) : reminders.daysBefore;
    if ((kmRemaining != null && kmRemaining < 0) || (daysRemaining != null && daysRemaining < 0)) level = 'overdue';
    else if ((kmRemaining != null && kmRemaining <= soonKm) || (daysRemaining != null && daysRemaining <= soonDays)) level = 'due';
    else level = 'ok';
  }

  // Beschriftung: das, was zuerst eintritt
  let label = 'Intervall im Handbuch';
  const kmFirst = kmFrac != null && (timeFrac == null || kmFrac >= timeFrac);
  if (kmFirst && kmRemaining != null) {
    label = kmRemaining >= 0 ? `noch ${formatNumber(kmRemaining)} km` : `${formatNumber(-kmRemaining)} km überfällig`;
  } else if (daysRemaining != null) {
    label = describeDaysAhead(daysRemaining);
  }

  return {
    code: row.task_type_code,
    name: taskName(task, row.task_type_code),
    icon: meta.icon,
    progress,
    level,
    label,
    sub: describeIntervalSub(row.interval_km, row.interval_period),
    dueOn: row.due_on,
    dueKm: row.due_at_km,
    canDoYourself: task?.can_do_yourself ?? false,
    guide: meta.guide ?? null,
    intervalSource: row.interval_source,
  };
}

// ---------------------------------------------------------------------
// Saisonale Aufgaben (Einwintern im Oktober, Frühlingscheck im März)
// ---------------------------------------------------------------------
export function computeSeasonalStatus(task: TaskType, lastDoneOn: string | null, today: Date): TaskStatus {
  const month = (task.seasonal_month ?? 1) - 1;
  const thisYear = new Date(today.getFullYear(), month, 1);
  const lastOccurrence = today >= thisYear ? thisYear : new Date(today.getFullYear() - 1, month, 1);
  const nextOccurrence = addYears(lastOccurrence, 1);
  const doneThisSeason = lastDoneOn != null && parseDate(lastDoneOn) >= addMonths(lastOccurrence, -1);
  const daysSinceStart = daysBetween(lastOccurrence, today);
  const monthName = monthNames[month];

  let level: Level;
  let label: string;
  let progress: number;
  let dueOn: Date;
  if (!doneThisSeason && daysSinceStart <= 61) {
    // Saison läuft (2 Monate Zeit), noch nicht erledigt
    level = daysSinceStart > 31 ? 'overdue' : 'due';
    label = 'jetzt fällig';
    progress = 1;
    dueOn = lastOccurrence;
  } else {
    const total = daysBetween(lastOccurrence, nextOccurrence);
    const remaining = daysBetween(today, nextOccurrence);
    level = remaining <= 14 ? 'due' : 'ok';
    label = remaining <= 31 ? describeDaysAhead(remaining) : `im ${monthName}`;
    progress = Math.max(0, Math.min(1, 1 - remaining / total));
    dueOn = nextOccurrence;
  }

  return {
    code: task.code,
    name: taskName(task, task.code),
    icon: taskMeta[task.code]?.icon ?? 'service',
    progress,
    level,
    label,
    sub: `jedes Jahr im ${monthNames[month]}`,
    dueOn: toIsoDate(dueOn),
    dueKm: null,
    canDoYourself: task.can_do_yourself,
    guide: taskMeta[task.code]?.guide ?? null,
    intervalSource: 'season',
  };
}

// ---------------------------------------------------------------------
// MFK: 5 Jahre nach 1. Inverkehrsetzung, dann nach 3 Jahren, dann alle 2 Jahre
// ---------------------------------------------------------------------
export function nextInspectionDate(
  firstRegistrationOn: string | null,
  lastInspectionOn: string | null,
  manualNextOn: string | null,
): string | null {
  if (manualNextOn) return manualNextOn;
  if (!firstRegistrationOn && !lastInspectionOn) return null;
  if (!lastInspectionOn) return toIsoDate(addYears(parseDate(firstRegistrationOn as string), 5));
  const last = parseDate(lastInspectionOn);
  if (firstRegistrationOn) {
    const first = addYears(parseDate(firstRegistrationOn), 5);
    // Die erste MFK liegt etwa 5 Jahre nach der Inverkehrsetzung → danach 3 Jahre
    if (Math.abs(daysBetween(first, last)) <= 400) return toIsoDate(addYears(last, 3));
  }
  return toIsoDate(addYears(last, 2));
}

export function computeInspectionStatus(
  task: TaskType | undefined,
  firstRegistrationOn: string | null,
  lastInspectionOn: string | null,
  manualNextOn: string | null,
  today: Date,
): TaskStatus {
  const next = nextInspectionDate(firstRegistrationOn, lastInspectionOn, manualNextOn);
  let level: Level = 'unknown';
  let label = 'Datum eintragen';
  let progress = 0;
  if (next) {
    const days = daysBetween(today, parseDate(next));
    level = days < 0 ? 'overdue' : days <= 60 ? 'due' : 'ok';
    label = days > 60 ? `am ${formatDate(next)}` : describeDaysAhead(days);
    progress = Math.max(0, Math.min(1, 1 - days / (2 * 365)));
  }
  return {
    code: 'mfk',
    name: taskName(task, 'MFK'),
    icon: 'mfk',
    progress,
    level,
    label,
    sub: 'Aufgebot vom Strassenverkehrsamt',
    dueOn: next,
    dueKm: null,
    canDoYourself: false,
    guide: null,
    intervalSource: 'law',
  };
}

// ---------------------------------------------------------------------
// Alles zusammen, sortiert: überfällig → fällig → nach Fortschritt
// ---------------------------------------------------------------------
export function buildStatusList(params: {
  rows: MaintenanceStatusRow[];
  taskTypes: TaskType[];
  lastDoneByTask: Record<string, string | undefined>;
  firstRegistrationOn: string | null;
  manualNextInspectionOn: string | null;
  today: Date;
  reminders?: Reminders;
}): TaskStatus[] {
  const byCode = new Map(params.taskTypes.map((t) => [t.code, t]));
  const list: TaskStatus[] = [];

  for (const row of params.rows) {
    const task = byCode.get(row.task_type_code);
    if (task?.seasonal_month) continue; // separat unten
    if (row.task_type_code === 'mfk') continue;
    list.push(computeTaskStatus(row, task, params.today, params.reminders));
  }
  for (const task of params.taskTypes) {
    if (task.seasonal_month) {
      list.push(computeSeasonalStatus(task, params.lastDoneByTask[task.code] ?? null, params.today));
    }
  }
  list.push(
    computeInspectionStatus(
      byCode.get('mfk'),
      params.firstRegistrationOn,
      params.lastDoneByTask.mfk ?? null,
      params.manualNextInspectionOn,
      params.today,
    ),
  );

  const rank: Record<Level, number> = { overdue: 0, due: 1, ok: 2, unknown: 3 };
  return list.sort((a, b) => rank[a.level] - rank[b.level] || b.progress - a.progress);
}
