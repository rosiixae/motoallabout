-- =====================================================================
--  Motorrad-Pflege-App – Datenbankschema
--  Migration 001 · PostgreSQL 15+ (gebaut für Supabase)
-- =====================================================================
--
--  AUFBAU
--    1. Grundlagen       Hilfsfunktionen
--    2. Nachschlagewerte Sprachen, Kategorien, Antriebe, Wartungsarten …
--    3. Katalog          Marken → Modelle → Baujahr-Varianten → Intervalle
--    4. Inhalte          Warnleuchten, Tipps & Tricks (mehrsprachig)
--    5. Nutzerdaten      Profil, eigene Motorräder, km-Stände, Wartungen
--    6. Werkstätten & Kalender
--    7. Benachrichtigungen
--    8. Views            «Was ist wann fällig?»
--    9. Sicherheit       Row Level Security + Rechte
--
--  KONVENTIONEN (damit es wartbar bleibt)
--    - Tabellen- und Spaltennamen englisch, snake_case, Tabellen im Plural.
--    - Nutzerdaten haben uuid-Schlüssel; Nachschlagewerte einen
--      lesbaren Text-Code (z.B. 'oil_change'). Statt Postgres-ENUMs werden
--      Nachschlage-Tabellen benutzt: neue Werte = ein INSERT, keine Migration.
--    - Jede Tabelle hat created_at / updated_at (updated_at per Trigger).
--    - Nutzerdaten werden «weich» gelöscht (deleted_at), damit
--      Wartungshistorie nicht versehentlich verloren geht.
--    - Änderungen am Schema NIE direkt in der Datenbank, sondern immer als
--      neue, nummerierte Datei: 002_…, 003_… (Supabase CLI: supabase migration new).
--    - Der Katalog (Modelle, Intervalle, Inhalte) wird nur vom Admin
--      gepflegt; Nutzer*innen dürfen ihn nur lesen.
-- =====================================================================


-- =====================================================================
-- 1. GRUNDLAGEN
-- =====================================================================

-- Setzt updated_at automatisch bei jedem UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =====================================================================
-- 2. NACHSCHLAGEWERTE
--    Kurze Bezeichnungen mehrsprachig als jsonb: {"de": "...", "en": "..."}
-- =====================================================================

create table public.locales (
  code        text primary key,                  -- 'de', 'en', 'fr', 'it'
  name        text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.drive_types (                 -- Antrieb
  code        text primary key,                  -- 'chain', 'shaft', 'belt', 'cvt'
  name_i18n   jsonb not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.bike_categories (             -- steuert auch das Pixel-Motorrad
  code        text primary key,                  -- 'naked', 'supersport', …
  name_i18n   jsonb not null,
  sprite_key  text not null,                     -- Ordnername der Pixel-Sprites, z.B. 'naked'
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.data_statuses (               -- wie verlässlich sind Katalogdaten?
  code        text primary key,                  -- 'verified', 'to_check', 'open'
  name_i18n   jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.maintenance_task_types (      -- Arten von Wartung/Kontrolle
  code                    text primary key,      -- 'oil_change', 'chain_care', …
  name_i18n               jsonb not null,
  description_i18n        jsonb,
  -- gilt nur für diesen Antrieb (z.B. Kettenpflege nur bei 'chain'); null = für alle
  drive_type_code         text references public.drive_types(code),
  -- Standardwerte, falls für ein Modell nichts im Katalog steht (optional)
  default_interval_km     integer  check (default_interval_km > 0),
  default_interval        interval check (default_interval > interval '0'),
  -- saisonale Aufgabe, z.B. Winter-Vorbereitung im Monat 10
  seasonal_month          smallint check (seasonal_month between 1 and 12),
  can_do_yourself         boolean not null default false,
  sort_order              smallint not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table public.warning_severities (
  code        text primary key,                  -- 'red', 'yellow', 'info'
  name_i18n   jsonb not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.tip_categories (              -- Tipps & Tricks fürs Fahrenlernen
  code        text primary key,                  -- 'basics', 'curves', 'braking', …
  name_i18n   jsonb not null,
  sort_order  smallint not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- =====================================================================
-- 3. KATALOG  (nur Admin schreibt, alle lesen)
--
--    manufacturers ─┬─ models ─── model_variants ─── model_maintenance_intervals
--                   │                                         │
--                   │                                data_sources (Quellen)
--                   └─ model_registration_stats (Zulassungszahlen)
-- =====================================================================

create table public.manufacturers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,            -- 'Yamaha'
  slug          text not null unique,            -- 'yamaha'
  country_code  char(2),                         -- ISO-Land des Herstellers
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.models (
  id                uuid primary key default gen_random_uuid(),
  manufacturer_id   uuid not null references public.manufacturers(id) on delete restrict,
  name              text not null,               -- 'MT-07'
  slug              text not null,               -- 'mt-07'
  category_code     text not null references public.bike_categories(code),
  drive_type_code   text references public.drive_types(code),
  is_active         boolean not null default true,  -- im Auswahlmenü anzeigen?
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (manufacturer_id, slug)
);
create index models_category_idx on public.models (category_code);

-- Eine Variante = Baujahr-Bereich/Generation mit eigenen technischen Daten.
-- So kann die MT-07 von 2014 andere Werte haben als die von 2021.
create table public.model_variants (
  id                          uuid primary key default gen_random_uuid(),
  model_id                    uuid not null references public.models(id) on delete cascade,
  label                       text,              -- '1. Generation', 'DCT' …
  year_from                   smallint check (year_from between 1900 and 2100),
  year_to                     smallint check (year_to between 1900 and 2100),  -- null = bis heute
  engine_cc                   smallint check (engine_cc > 0),
  oil_spec                    text,              -- '10W-40, JASO MA'
  oil_capacity_with_filter_l  numeric(4,2) check (oil_capacity_with_filter_l > 0),
  data_status_code            text not null default 'open' references public.data_statuses(code),
  notes                       text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  check (year_to is null or year_from is null or year_to >= year_from)
);
create index model_variants_model_idx on public.model_variants (model_id);

create table public.data_sources (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,             -- 'S1'
  title        text,
  url          text,
  accessed_on  date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Herstellerintervalle pro Variante und Wartungsart.
-- Was zuerst eintritt (km oder Zeit), gilt.
create table public.model_maintenance_intervals (
  id                uuid primary key default gen_random_uuid(),
  model_variant_id  uuid not null references public.model_variants(id) on delete cascade,
  task_type_code    text not null references public.maintenance_task_types(code),
  interval_km       integer  check (interval_km > 0),
  interval_period   interval check (interval_period > interval '0'),   -- z.B. '12 months'
  first_at_km       integer  check (first_at_km > 0),  -- z.B. Einfahrinspektion bei 1000 km
  data_status_code  text not null default 'open' references public.data_statuses(code),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (model_variant_id, task_type_code),
  check (interval_km is not null or interval_period is not null)
);

create table public.model_maintenance_interval_sources (
  interval_id  uuid not null references public.model_maintenance_intervals(id) on delete cascade,
  source_id    uuid not null references public.data_sources(id) on delete cascade,
  primary key (interval_id, source_id)
);

-- Quellen für die Variante allgemein (Ölsorte, Ölmenge …)
create table public.model_variant_sources (
  model_variant_id  uuid not null references public.model_variants(id) on delete cascade,
  source_id         uuid not null references public.data_sources(id) on delete cascade,
  primary key (model_variant_id, source_id)
);

-- Zulassungszahlen, z.B. um beliebte Modelle in der Auswahl zuerst zu zeigen.
create table public.model_registration_stats (
  model_id       uuid not null references public.models(id) on delete cascade,
  country_code   char(2) not null,               -- 'CH'
  year           smallint not null,
  registrations  integer not null check (registrations >= 0),
  rank           smallint,
  list_name      text,                           -- 'Top 50 Motorräder', 'Top 10 Roller'
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (model_id, country_code, year)
);


-- =====================================================================
-- 4. INHALTE  (mehrsprachig: Grundtabelle + *_translations)
-- =====================================================================

create table public.warning_lights (
  code             text primary key,             -- 'oil_pressure'
  severity_code    text not null references public.warning_severities(code),
  colors           text,                         -- 'rot oder gelb'
  is_standardized  boolean not null default false,  -- genormtes Symbol (ISO 2575)?
  icon_key         text,                         -- Dateiname des Icons in der App
  sort_order       smallint not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.warning_light_translations (
  warning_light_code  text not null references public.warning_lights(code) on delete cascade,
  locale_code         text not null references public.locales(code),
  name                text not null,
  aliases             text,                      -- andere Namen / Varianten
  meaning             text not null,
  action              text not null,             -- Was tun?
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  primary key (warning_light_code, locale_code)
);

create table public.tips (
  id                uuid primary key default gen_random_uuid(),
  category_code     text not null references public.tip_categories(code),
  slug              text not null unique,
  difficulty        smallint check (difficulty between 1 and 3),  -- 1 Anfänger … 3 Fortgeschritten
  cover_image_path  text,                        -- Pfad im Storage
  published_at      timestamptz,                 -- null = Entwurf
  sort_order        smallint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index tips_published_idx on public.tips (category_code, published_at);

create table public.tip_translations (
  tip_id       uuid not null references public.tips(id) on delete cascade,
  locale_code  text not null references public.locales(code),
  title        text not null,
  summary      text,
  body_md      text not null,                    -- Inhalt als Markdown
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (tip_id, locale_code)
);


-- =====================================================================
-- 5. NUTZERDATEN
--    auth.users ist die Login-Tabelle von Supabase. Ohne Supabase:
--    eine eigene Tabelle users(id uuid primary key, email text unique …).
-- =====================================================================

create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  locale_code    text not null default 'de' references public.locales(code),
  country_code   char(2) not null default 'CH',
  distance_unit  text not null default 'km' check (distance_unit in ('km', 'mi')),
  riding_since   date,                           -- seit wann Fahrausweis/fahrend
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.motorcycles (
  id                       uuid primary key default gen_random_uuid(),
  owner_id                 uuid not null references public.profiles(id) on delete cascade,
  -- aus dem Katalog gewählt …
  model_variant_id         uuid references public.model_variants(id) on delete set null,
  -- … oder von Hand eingetragen, wenn das Modell (noch) fehlt
  custom_manufacturer      text,
  custom_model             text,
  -- überschreibt Werte aus dem Katalog (oder ersetzt sie bei Handeingabe)
  category_code            text references public.bike_categories(code),
  drive_type_code          text references public.drive_types(code),
  model_year               smallint check (model_year between 1900 and 2100),
  nickname                 text,
  paint_color              char(7) check (paint_color ~ '^#[0-9A-Fa-f]{6}$'),  -- Lackfarbe Pixel-Motorrad
  purchased_on             date,
  odometer_at_purchase_km  integer check (odometer_at_purchase_km >= 0),
  is_primary               boolean not null default false,
  sold_at                  date,                 -- verkauft: bleibt in der Historie
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz,
  check (model_variant_id is not null or custom_model is not null)
);
create index motorcycles_owner_idx on public.motorcycles (owner_id) where deleted_at is null;
-- höchstens ein «Haupt-Motorrad» pro Person
create unique index motorcycles_one_primary_idx
  on public.motorcycles (owner_id) where is_primary and deleted_at is null;

create table public.odometer_readings (           -- Kilometerstände
  id             uuid primary key default gen_random_uuid(),
  motorcycle_id  uuid not null references public.motorcycles(id) on delete cascade,
  reading_km     integer not null check (reading_km >= 0),
  recorded_at    timestamptz not null default now(),
  source         text not null default 'manual'
                 check (source in ('manual', 'maintenance', 'import', 'gps', 'obd')),
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index odometer_readings_bike_idx on public.odometer_readings (motorcycle_id, recorded_at desc);

-- Eigene Anpassungen der Intervalle (nur Abweichungen speichern!).
-- Korrigiert der Admin den Katalog, profitieren alle anderen automatisch.
create table public.motorcycle_interval_overrides (
  id               uuid primary key default gen_random_uuid(),
  motorcycle_id    uuid not null references public.motorcycles(id) on delete cascade,
  task_type_code   text not null references public.maintenance_task_types(code),
  interval_km      integer  check (interval_km > 0),
  interval_period  interval check (interval_period > interval '0'),
  is_enabled       boolean not null default true,   -- Erinnerung ausschalten
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (motorcycle_id, task_type_code)
);

-- Ein Wartungs-Ereignis = ein Termin/Tag (z.B. «Service bei Werkstatt X»).
-- Was dabei gemacht wurde, steht in maintenance_event_items.
create table public.maintenance_events (
  id             uuid primary key default gen_random_uuid(),
  motorcycle_id  uuid not null references public.motorcycles(id) on delete cascade,
  performed_on   date not null,
  odometer_km    integer check (odometer_km >= 0),
  performed_by   text not null default 'self' check (performed_by in ('self', 'workshop', 'other')),
  workshop_id    uuid,                           -- Fremdschlüssel unten (Tabelle kommt in Teil 6)
  total_cost     numeric(10,2) check (total_cost >= 0),
  currency       char(3) not null default 'CHF',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index maintenance_events_bike_idx on public.maintenance_events (motorcycle_id, performed_on desc);

create table public.maintenance_event_items (
  event_id        uuid not null references public.maintenance_events(id) on delete cascade,
  task_type_code  text not null references public.maintenance_task_types(code),
  notes           text,                          -- z.B. «Motul 7100 10W-40»
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (event_id, task_type_code)
);
create index maintenance_event_items_task_idx on public.maintenance_event_items (task_type_code);

-- Fotos & Belege. Die Datei selbst liegt im Storage, hier nur der Pfad.
create table public.attachments (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references public.profiles(id) on delete cascade,
  motorcycle_id         uuid references public.motorcycles(id) on delete cascade,
  maintenance_event_id  uuid references public.maintenance_events(id) on delete cascade,
  kind                  text not null default 'photo' check (kind in ('photo', 'receipt', 'document')),
  storage_path          text not null unique,    -- z.B. '<user-id>/<datei>.jpg'
  mime_type             text,
  size_bytes            bigint check (size_bytes >= 0),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index attachments_event_idx on public.attachments (maintenance_event_id);


-- =====================================================================
-- 6. WERKSTÄTTEN & KALENDER
--    Vorerst: App empfiehlt einen Termin und verlinkt auf die Website.
--    Später (Partner-Werkstätten): Tabelle bookings mit Status ergänzen.
-- =====================================================================

create table public.workshops (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  website_url   text,
  booking_url   text,                            -- direkter Link zur Online-Terminbuchung
  phone         text,
  email         text,
  street        text,
  postal_code   text,
  city          text,
  country_code  char(2) not null default 'CH',
  latitude      numeric(9,6) check (latitude between -90 and 90),
  longitude     numeric(9,6) check (longitude between -180 and 180),
  is_partner    boolean not null default false,
  verified_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index workshops_location_idx on public.workshops (country_code, postal_code);

alter table public.maintenance_events
  add constraint maintenance_events_workshop_fk
  foreign key (workshop_id) references public.workshops(id) on delete set null;

create table public.workshop_manufacturers (      -- welche Marken betreut die Werkstatt?
  workshop_id      uuid not null references public.workshops(id) on delete cascade,
  manufacturer_id  uuid not null references public.manufacturers(id) on delete cascade,
  primary key (workshop_id, manufacturer_id)
);

create table public.favorite_workshops (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  workshop_id  uuid not null references public.workshops(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, workshop_id)
);

create table public.calendar_events (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  motorcycle_id         uuid references public.motorcycles(id) on delete cascade,
  event_type            text not null default 'other'
                        check (event_type in ('workshop_appointment', 'maintenance', 'tour', 'other')),
  title                 text not null,
  starts_at             timestamptz not null,
  ends_at               timestamptz,
  is_all_day            boolean not null default false,
  workshop_id           uuid references public.workshops(id) on delete set null,
  task_type_code        text references public.maintenance_task_types(code),
  -- nach dem Termin mit der erledigten Wartung verknüpfen
  maintenance_event_id  uuid references public.maintenance_events(id) on delete set null,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz,
  check (ends_at is null or ends_at >= starts_at)
);
create index calendar_events_user_idx on public.calendar_events (user_id, starts_at) where deleted_at is null;


-- =====================================================================
-- 7. BENACHRICHTIGUNGEN
-- =====================================================================

create table public.notification_preferences (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  maintenance_reminders  boolean not null default true,
  seasonal_reminders     boolean not null default true,
  remind_km_before       integer not null default 500 check (remind_km_before >= 0),
  remind_days_before     integer not null default 14  check (remind_days_before >= 0),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table public.push_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  token         text not null unique,
  platform      text not null check (platform in ('ios', 'android', 'web')),
  last_seen_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Verlauf aller verschickten Hinweise. dedupe_key verhindert, dass dieselbe
-- Erinnerung zweimal rausgeht (z.B. 'oil_change:<bike-id>:2026-12').
create table public.notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  motorcycle_id   uuid references public.motorcycles(id) on delete cascade,
  task_type_code  text references public.maintenance_task_types(code),
  kind            text not null check (kind in ('maintenance_due', 'maintenance_overdue', 'seasonal', 'system')),
  title           text not null,
  body            text,
  due_on          date,
  due_km          integer,
  dedupe_key      text unique,
  sent_at         timestamptz,
  read_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);


-- =====================================================================
-- 8. VIEWS
-- =====================================================================

-- Aktueller km-Stand pro Motorrad (höchster erfasster Wert).
create view public.motorcycle_current_odometer
with (security_invoker = true) as
select
  m.id as motorcycle_id,
  greatest(
    coalesce(max(r.reading_km), 0),
    coalesce(max(e.odometer_km), 0),
    coalesce(m.odometer_at_purchase_km, 0)
  ) as current_km
from public.motorcycles m
left join public.odometer_readings r on r.motorcycle_id = m.id
left join public.maintenance_events e on e.motorcycle_id = m.id and e.deleted_at is null
where m.deleted_at is null
group by m.id;

-- «Was ist wann fällig?» – eine Zeile pro Motorrad und Wartungsart.
-- Intervall-Reihenfolge: eigene Anpassung → Katalog → Standardwert.
create view public.motorcycle_maintenance_status
with (security_invoker = true) as
with bikes as (
  select
    m.*,
    coalesce(m.drive_type_code, md.drive_type_code) as effective_drive_type
  from public.motorcycles m
  left join public.model_variants v on v.id = m.model_variant_id
  left join public.models md       on md.id = v.model_id
  where m.deleted_at is null and m.sold_at is null
),
intervals as (
  select
    b.id    as motorcycle_id,
    b.owner_id,
    t.code  as task_type_code,
    coalesce(o.interval_km,     mi.interval_km,     t.default_interval_km) as interval_km,
    coalesce(o.interval_period, mi.interval_period, t.default_interval)    as interval_period,
    case when o.id is not null then 'own'
         when mi.id is not null then 'catalog'
         else 'default' end as interval_source,
    b.purchased_on,
    b.created_at,
    b.odometer_at_purchase_km
  from bikes b
  cross join public.maintenance_task_types t
  left join public.model_maintenance_intervals mi
         on mi.model_variant_id = b.model_variant_id and mi.task_type_code = t.code
  left join public.motorcycle_interval_overrides o
         on o.motorcycle_id = b.id and o.task_type_code = t.code
  where (t.drive_type_code is null or t.drive_type_code = b.effective_drive_type)
    and coalesce(o.is_enabled, true)
),
last_done as (
  select distinct on (e.motorcycle_id, i.task_type_code)
    e.motorcycle_id, i.task_type_code, e.performed_on, e.odometer_km
  from public.maintenance_events e
  join public.maintenance_event_items i on i.event_id = e.id
  where e.deleted_at is null
  order by e.motorcycle_id, i.task_type_code, e.performed_on desc, e.created_at desc
)
select
  iv.motorcycle_id,
  iv.owner_id,
  iv.task_type_code,
  iv.interval_km,
  iv.interval_period,
  iv.interval_source,
  ld.performed_on        as last_done_on,
  ld.odometer_km         as last_done_km,
  co.current_km,
  d.due_at_km,
  d.due_on,
  d.due_at_km - co.current_km as km_remaining   -- negativ = überfällig
from intervals iv
left join last_done ld
       on ld.motorcycle_id = iv.motorcycle_id and ld.task_type_code = iv.task_type_code
left join public.motorcycle_current_odometer co
       on co.motorcycle_id = iv.motorcycle_id
cross join lateral (
  select
    -- schon einmal gemacht: letzter km-Stand + Intervall.
    -- noch nie erfasst: nächster Punkt im Herstellerplan (Vielfaches des
    -- Intervalls ab 0 km), z.B. Kauf bei 8000 km, Intervall 10000 → 10000.
    case
      when iv.interval_km is null then null
      when ld.odometer_km is not null then ld.odometer_km + iv.interval_km
      else (coalesce(iv.odometer_at_purchase_km, 0) / iv.interval_km + 1) * iv.interval_km
    end as due_at_km,
    (coalesce(ld.performed_on, iv.purchased_on, iv.created_at::date)
       + iv.interval_period)::date as due_on
) d
where iv.interval_km is not null or iv.interval_period is not null;


-- Jeder Fremdschlüssel bekommt einen Index (schnelle Joins und Löschungen).
-- Gilt für alles oben; spätere Migrationen legen ihre Indizes selbst an.
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass::text as tbl, a.attname as col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and c.connamespace = 'public'::regnamespace
      and array_length(c.conkey, 1) = 1
      and not exists (
        select 1 from pg_index i
        where i.indrelid = c.conrelid and i.indkey[0] = c.conkey[1])
  loop
    execute format('create index %I on %s (%I)',
                   replace(r.tbl, 'public.', '') || '_' || r.col || '_idx', r.tbl, r.col);
  end loop;
end $$;


-- =====================================================================
-- 9. SICHERHEIT
-- =====================================================================

-- updated_at-Trigger an alle Tabellen hängen, die die Spalte haben.
do $$
declare t record;
begin
  for t in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema and tb.table_name = c.table_name
    where c.table_schema = 'public' and c.column_name = 'updated_at'
      and tb.table_type = 'BASE TABLE'
  loop
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t.table_name || '_set_updated_at', t.table_name);
  end loop;
end $$;

-- Neues Konto → Profil + Benachrichtigungs-Einstellungen anlegen.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Gehört das Motorrad der eingeloggten Person?
create or replace function public.owns_motorcycle(p_motorcycle_id uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.motorcycles
    where id = p_motorcycle_id and owner_id = (select auth.uid())
  );
$$;

-- Gehört das Wartungs-Ereignis der eingeloggten Person?
create or replace function public.owns_maintenance_event(p_event_id uuid)
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.maintenance_events e
    join public.motorcycles m on m.id = e.motorcycle_id
    where e.id = p_event_id and m.owner_id = (select auth.uid())
  );
$$;

-- Row Level Security überall einschalten.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- 9a) Katalog & Inhalte: alle dürfen lesen, niemand schreibt über die App
--     (Admin pflegt über das Supabase-Dashboard / service_role).
do $$
declare t text;
begin
  foreach t in array array[
    'locales', 'drive_types', 'bike_categories', 'data_statuses',
    'maintenance_task_types', 'warning_severities', 'tip_categories',
    'manufacturers', 'models', 'model_variants', 'data_sources',
    'model_maintenance_intervals', 'model_maintenance_interval_sources',
    'model_variant_sources', 'model_registration_stats',
    'warning_lights', 'warning_light_translations',
    'tip_translations', 'workshops', 'workshop_manufacturers'
  ] loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
end $$;

-- Tipps: nur veröffentlichte sichtbar
create policy "public read published" on public.tips
  for select using (published_at is not null and published_at <= now());

-- 9b) Eigene Daten: nur die Besitzerin / der Besitzer
create policy "own profile" on public.profiles
  for all using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own motorcycles" on public.motorcycles
  for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "own odometer readings" on public.odometer_readings
  for all using (public.owns_motorcycle(motorcycle_id))
  with check (public.owns_motorcycle(motorcycle_id));

create policy "own interval overrides" on public.motorcycle_interval_overrides
  for all using (public.owns_motorcycle(motorcycle_id))
  with check (public.owns_motorcycle(motorcycle_id));

create policy "own maintenance events" on public.maintenance_events
  for all using (public.owns_motorcycle(motorcycle_id))
  with check (public.owns_motorcycle(motorcycle_id));

create policy "own maintenance items" on public.maintenance_event_items
  for all using (public.owns_maintenance_event(event_id))
  with check (public.owns_maintenance_event(event_id));

do $$
declare t text;
begin
  foreach t in array array['attachments'] loop
    execute format(
      'create policy "own rows" on public.%I for all
         using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t);
  end loop;
  foreach t in array array['favorite_workshops', 'calendar_events', 'notification_preferences',
                           'push_tokens', 'notifications'] loop
    execute format(
      'create policy "own rows" on public.%I for all
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- 9c) Rechte. Neue Supabase-Projekte verlangen ausdrückliche GRANTs,
--     damit Tabellen über die API erreichbar sind. Zuerst alles entziehen,
--     dann genau das freigeben, was die App braucht.
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on
  public.locales, public.drive_types, public.bike_categories, public.data_statuses,
  public.maintenance_task_types, public.warning_severities, public.tip_categories,
  public.manufacturers, public.models, public.model_variants, public.data_sources,
  public.model_maintenance_intervals, public.model_maintenance_interval_sources,
  public.model_variant_sources, public.model_registration_stats,
  public.warning_lights, public.warning_light_translations,
  public.tips, public.tip_translations, public.workshops, public.workshop_manufacturers
to anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.motorcycles, public.odometer_readings,
  public.motorcycle_interval_overrides, public.maintenance_events,
  public.maintenance_event_items, public.attachments, public.favorite_workshops,
  public.calendar_events, public.notification_preferences, public.push_tokens,
  public.notifications
to authenticated;

grant select on public.motorcycle_current_odometer, public.motorcycle_maintenance_status
to authenticated;

-- Hilfsfunktionen nicht für alle öffentlich aufrufbar machen
-- (Postgres erlaubt standardmässig jedem, Funktionen auszuführen).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.owns_motorcycle(uuid), public.owns_maintenance_event(uuid)
  from public, anon;
grant execute on function public.owns_motorcycle(uuid), public.owns_maintenance_event(uuid)
  to authenticated;
