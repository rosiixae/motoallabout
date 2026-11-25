// Datentypen der Supabase-Tabellen, die die App benutzt.
// Spaltennamen genau wie in supabase/migrations.

export type I18n = { de?: string; en?: string; [locale: string]: string | undefined };

export type Profile = {
  id: string;
  display_name: string | null;
  locale_code: string;
  country_code: string;
  distance_unit: 'km' | 'mi';
  riding_since: string | null;
};

export type Manufacturer = { id: string; name: string; slug: string };

export type Model = {
  id: string;
  manufacturer_id: string;
  name: string;
  slug: string;
  category_code: string;
  drive_type_code: string | null;
  manufacturers?: Manufacturer | null;
};

export type ModelVariant = {
  id: string;
  model_id: string;
  label: string | null;
  year_from: number | null;
  year_to: number | null;
  oil_spec: string | null;
  oil_capacity_with_filter_l: number | null;
  data_status_code: 'verified' | 'to_check' | 'open';
  notes: string | null;
  models?: Model | null;
};

export type Motorcycle = {
  id: string;
  owner_id: string;
  model_variant_id: string | null;
  custom_manufacturer: string | null;
  custom_model: string | null;
  category_code: string | null;
  drive_type_code: string | null;
  model_year: number | null;
  nickname: string | null;
  paint_color: string | null;
  purchased_on: string | null;
  odometer_at_purchase_km: number | null;
  is_primary: boolean;
  sold_at: string | null;
  first_registration_on: string | null;
  next_inspection_on: string | null;
  created_at: string;
  model_variants?: ModelVariant | null;
};

export type TaskType = {
  code: string;
  name_i18n: I18n;
  description_i18n: I18n | null;
  drive_type_code: string | null;
  default_interval_km: number | null;
  default_interval: string | null;
  seasonal_month: number | null;
  can_do_yourself: boolean;
  sort_order: number;
};

export type MaintenanceStatusRow = {
  motorcycle_id: string;
  owner_id: string;
  task_type_code: string;
  interval_km: number | null;
  interval_period: string | null;
  interval_source: 'own' | 'catalog' | 'default';
  last_done_on: string | null;
  last_done_km: number | null;
  current_km: number | null;
  due_at_km: number | null;
  due_on: string | null;
  km_remaining: number | null;
};

export type MaintenanceEvent = {
  id: string;
  motorcycle_id: string;
  performed_on: string;
  odometer_km: number | null;
  performed_by: 'self' | 'workshop' | 'other';
  workshop_id: string | null;
  total_cost: number | null;
  currency: string;
  notes: string | null;
  maintenance_event_items?: { task_type_code: string; notes: string | null }[];
};

export type OdometerReading = {
  id: string;
  motorcycle_id: string;
  reading_km: number;
  recorded_at: string;
  source: string;
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  motorcycle_id: string | null;
  event_type: 'workshop_appointment' | 'maintenance' | 'tour' | 'other';
  title: string;
  starts_at: string;
  ends_at: string | null;
  is_all_day: boolean;
  workshop_id: string | null;
  task_type_code: string | null;
  notes: string | null;
  /** Ausfahrt: Treffpunkt. Werkstatt: Adresse. */
  location: string | null;
  /** Ausfahrt: Ziel. */
  destination: string | null;
  /** Werkstatt: Name. */
  place_name: string | null;
  phone: string | null;
  website: string | null;
};

export type Workshop = {
  id: string;
  name: string;
  website_url: string | null;
  booking_url: string | null;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  is_partner: boolean;
};

export type WarningLight = {
  code: string;
  severity_code: 'red' | 'yellow' | 'info';
  colors: string | null;
  is_standardized: boolean;
  icon_key: string | null;
  sort_order: number;
  warning_light_translations: { locale_code: string; name: string; aliases: string | null; meaning: string; action: string }[];
};

export type Tip = {
  id: string;
  category_code: string;
  slug: string;
  difficulty: number | null;
  sort_order: number;
  tip_translations: { locale_code: string; title: string; summary: string | null; body_md: string }[];
};

export type TipCategory = { code: string; name_i18n: I18n; sort_order: number };

export type NotificationPreferences = {
  user_id: string;
  maintenance_reminders: boolean;
  seasonal_reminders: boolean;
  remind_km_before: number;
  remind_days_before: number;
};
