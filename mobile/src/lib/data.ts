// Alle Zugriffe auf Supabase an einem Ort.
// Row Level Security sorgt dafür, dass jede Person nur ihre eigenen Daten sieht.

import { supabase } from './supabase';
import { toIsoDate } from './format';
import type {
  CalendarEvent,
  MaintenanceEvent,
  MaintenanceStatusRow,
  Manufacturer,
  Model,
  ModelVariant,
  Motorcycle,
  NotificationPreferences,
  Profile,
  TaskType,
  Tip,
  TipCategory,
  WarningLight,
  Workshop,
} from './types';

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// ---------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------
export async function getProfile(userId: string): Promise<Profile | null> {
  return check(await supabase.from('profiles').select('*').eq('id', userId).maybeSingle());
}

export async function updateProfile(userId: string, changes: Partial<Omit<Profile, 'id'>>): Promise<void> {
  check(await supabase.from('profiles').update(changes).eq('id', userId));
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  return check(await supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle());
}

export async function updateNotificationPreferences(
  userId: string,
  changes: Partial<Omit<NotificationPreferences, 'user_id'>>,
): Promise<void> {
  check(await supabase.from('notification_preferences').update(changes).eq('user_id', userId));
}

// ---------------------------------------------------------------------
// Katalog
// ---------------------------------------------------------------------
export async function getManufacturers(): Promise<Manufacturer[]> {
  return check(await supabase.from('manufacturers').select('id, name, slug').order('name'));
}

export async function getModels(manufacturerId: string): Promise<Model[]> {
  return check(
    await supabase
      .from('models')
      .select('id, manufacturer_id, name, slug, category_code, drive_type_code')
      .eq('manufacturer_id', manufacturerId)
      .eq('is_active', true)
      .order('name'),
  );
}

export async function getVariants(modelId: string): Promise<ModelVariant[]> {
  return check(
    await supabase
      .from('model_variants')
      .select('id, model_id, label, year_from, year_to, oil_spec, oil_capacity_with_filter_l, data_status_code, notes')
      .eq('model_id', modelId)
      .order('year_from', { ascending: false, nullsFirst: false }),
  );
}

export async function getTaskTypes(): Promise<TaskType[]> {
  return check(await supabase.from('maintenance_task_types').select('*').order('sort_order'));
}

export type TaskSource = { task_type_code: string; data_sources: { code: string; title: string | null; url: string | null } | null };

export async function getTaskSources(): Promise<TaskSource[]> {
  return check(
    await supabase.from('maintenance_task_type_sources').select('task_type_code, data_sources(code, title, url)'),
  );
}

// ---------------------------------------------------------------------
// Motorräder
// ---------------------------------------------------------------------
const motorcycleSelect =
  '*, model_variants(id, model_id, label, year_from, year_to, oil_spec, oil_capacity_with_filter_l, data_status_code, notes, models(id, manufacturer_id, name, slug, category_code, drive_type_code, manufacturers(id, name, slug)))';

export async function getMotorcycles(): Promise<Motorcycle[]> {
  return check(
    await supabase
      .from('motorcycles')
      .select(motorcycleSelect)
      .is('deleted_at', null)
      .is('sold_at', null)
      .order('is_primary', { ascending: false })
      .order('created_at'),
  );
}

export async function getMotorcycle(id: string): Promise<Motorcycle | null> {
  return check(await supabase.from('motorcycles').select(motorcycleSelect).eq('id', id).maybeSingle());
}

export type MotorcycleInput = {
  model_variant_id: string | null;
  custom_manufacturer: string | null;
  custom_model: string | null;
  category_code: string | null;
  drive_type_code: string | null;
  model_year: number | null;
  nickname: string | null;
  purchased_on: string | null;
  odometer_at_purchase_km: number | null;
  first_registration_on: string | null;
  next_inspection_on: string | null;
  is_primary?: boolean;
};

export async function createMotorcycle(ownerId: string, input: MotorcycleInput): Promise<Motorcycle> {
  return check(
    await supabase
      .from('motorcycles')
      .insert({ ...input, owner_id: ownerId })
      .select(motorcycleSelect)
      .single(),
  );
}

export async function updateMotorcycle(id: string, input: Partial<MotorcycleInput>): Promise<void> {
  check(await supabase.from('motorcycles').update(input).eq('id', id));
}

/** «Löschen» = weich löschen, damit die Historie nicht verloren geht */
export async function deleteMotorcycle(id: string): Promise<void> {
  check(await supabase.from('motorcycles').update({ deleted_at: new Date().toISOString(), is_primary: false }).eq('id', id));
}

export async function setPrimaryMotorcycle(id: string, allIds: string[]): Promise<void> {
  // zuerst alle zurücksetzen (es darf nur ein Haupt-Motorrad geben)
  check(await supabase.from('motorcycles').update({ is_primary: false }).in('id', allIds));
  check(await supabase.from('motorcycles').update({ is_primary: true }).eq('id', id));
}

export function motorcycleTitle(m: Motorcycle): { brand: string; model: string; full: string } {
  const brand = m.model_variants?.models?.manufacturers?.name ?? m.custom_manufacturer ?? '';
  const model = m.model_variants?.models?.name ?? m.custom_model ?? '';
  return { brand, model, full: [brand, model].filter(Boolean).join(' ') || 'Mein Motorrad' };
}

export function motorcycleDrive(m: Motorcycle): string | null {
  return m.drive_type_code ?? m.model_variants?.models?.drive_type_code ?? null;
}

export function motorcycleCategory(m: Motorcycle): string | null {
  return m.category_code ?? m.model_variants?.models?.category_code ?? null;
}

// ---------------------------------------------------------------------
// Kilometer und Wartung
// ---------------------------------------------------------------------
export async function getCurrentKm(motorcycleId: string): Promise<number> {
  const data = check(
    await supabase.from('motorcycle_current_odometer').select('current_km').eq('motorcycle_id', motorcycleId).maybeSingle(),
  ) as { current_km: number } | null;
  return data?.current_km ?? 0;
}

export async function addOdometerReading(motorcycleId: string, km: number): Promise<void> {
  check(await supabase.from('odometer_readings').insert({ motorcycle_id: motorcycleId, reading_km: km, source: 'manual' }));
}

export async function getMaintenanceStatus(motorcycleId: string): Promise<MaintenanceStatusRow[]> {
  return check(await supabase.from('motorcycle_maintenance_status').select('*').eq('motorcycle_id', motorcycleId));
}

export async function getMaintenanceEvents(motorcycleId: string): Promise<MaintenanceEvent[]> {
  return check(
    await supabase
      .from('maintenance_events')
      .select('*, maintenance_event_items(task_type_code, notes)')
      .eq('motorcycle_id', motorcycleId)
      .is('deleted_at', null)
      .order('performed_on', { ascending: false })
      .order('created_at', { ascending: false }),
  );
}

export type MaintenanceInput = {
  performed_on: string;
  odometer_km: number | null;
  performed_by: 'self' | 'workshop' | 'other';
  total_cost: number | null;
  notes: string | null;
  tasks: string[];
};

export async function addMaintenanceEvent(motorcycleId: string, input: MaintenanceInput): Promise<void> {
  const { tasks, ...event } = input;
  const created = check(
    await supabase
      .from('maintenance_events')
      .insert({ ...event, motorcycle_id: motorcycleId })
      .select('id')
      .single(),
  ) as { id: string };
  if (tasks.length) {
    const result = await supabase
      .from('maintenance_event_items')
      .insert(tasks.map((code) => ({ event_id: created.id, task_type_code: code })));
    if (result.error) {
      // Ereignis ohne Inhalt wieder entfernen
      await supabase.from('maintenance_events').delete().eq('id', created.id);
      throw new Error(result.error.message);
    }
  }
  if (input.odometer_km != null) {
    await supabase
      .from('odometer_readings')
      .insert({ motorcycle_id: motorcycleId, reading_km: input.odometer_km, source: 'maintenance', recorded_at: `${input.performed_on}T12:00:00Z` });
  }
  if (tasks.includes('mfk')) {
    // Nach einer MFK gilt wieder die normale Regel (3 bzw. 2 Jahre)
    await supabase.from('motorcycles').update({ next_inspection_on: null }).eq('id', motorcycleId);
  }
}

export async function deleteMaintenanceEvent(id: string): Promise<void> {
  check(await supabase.from('maintenance_events').update({ deleted_at: new Date().toISOString() }).eq('id', id));
}

/** Letztes Datum pro Wartungsart (aus der Historie) */
export function lastDoneByTask(events: MaintenanceEvent[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const e of events) {
    for (const item of e.maintenance_event_items ?? []) {
      if (!result[item.task_type_code] || result[item.task_type_code] < e.performed_on) {
        result[item.task_type_code] = e.performed_on;
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------
// Kalender
// ---------------------------------------------------------------------
export async function getCalendarEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
  return check(
    await supabase
      .from('calendar_events')
      .select('*')
      .is('deleted_at', null)
      .gte('starts_at', `${toIsoDate(from)}T00:00:00`)
      .lt('starts_at', `${toIsoDate(to)}T00:00:00`)
      .order('starts_at'),
  );
}

export type CalendarInput = {
  title: string;
  starts_at: string;
  is_all_day: boolean;
  event_type: CalendarEvent['event_type'];
  motorcycle_id: string | null;
  task_type_code: string | null;
  notes: string | null;
};

export async function addCalendarEvent(userId: string, input: CalendarInput): Promise<void> {
  check(await supabase.from('calendar_events').insert({ ...input, user_id: userId }));
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  check(await supabase.from('calendar_events').update({ deleted_at: new Date().toISOString() }).eq('id', id));
}

// ---------------------------------------------------------------------
// Werkstätten
// ---------------------------------------------------------------------
export async function getWorkshops(): Promise<Workshop[]> {
  return check(
    await supabase
      .from('workshops')
      .select('id, name, website_url, booking_url, phone, street, postal_code, city, is_partner')
      .order('name'),
  );
}

// ---------------------------------------------------------------------
// Inhalte
// ---------------------------------------------------------------------
export async function getWarningLights(): Promise<WarningLight[]> {
  return check(
    await supabase
      .from('warning_lights')
      .select('*, warning_light_translations(locale_code, name, aliases, meaning, action)')
      .order('sort_order'),
  );
}

export async function getTipCategories(): Promise<TipCategory[]> {
  return check(await supabase.from('tip_categories').select('code, name_i18n, sort_order').order('sort_order'));
}

export async function getTips(): Promise<Tip[]> {
  return check(
    await supabase
      .from('tips')
      .select('id, category_code, slug, difficulty, sort_order, tip_translations(locale_code, title, summary, body_md)')
      .order('sort_order'),
  );
}

export async function getTip(slug: string): Promise<Tip | null> {
  return check(
    await supabase
      .from('tips')
      .select('id, category_code, slug, difficulty, sort_order, tip_translations(locale_code, title, summary, body_md)')
      .eq('slug', slug)
      .maybeSingle(),
  );
}
