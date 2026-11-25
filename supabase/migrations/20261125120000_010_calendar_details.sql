-- =====================================================================
--  Migration 010 · Termin-Details (aus dem Test vom 25.11.2026)
--  Ausfahrt: Treffpunkt und Ziel, damit man Leute einladen kann.
--  Werkstatt-Termin: Name, Telefon, Website und Adresse der Werkstatt.
-- =====================================================================

alter table public.calendar_events
  add column if not exists location    text check (char_length(location) <= 300),     -- Treffpunkt bzw. Adresse
  add column if not exists destination text check (char_length(destination) <= 300),  -- Ziel der Ausfahrt
  add column if not exists place_name  text check (char_length(place_name) <= 200),   -- Name der Werkstatt
  add column if not exists phone       text check (char_length(phone) <= 50),
  add column if not exists website     text check (char_length(website) <= 500);

comment on column public.calendar_events.location is 'Ausfahrt: Treffpunkt. Werkstatt: Adresse.';
comment on column public.calendar_events.destination is 'Ausfahrt: Ziel.';
comment on column public.calendar_events.place_name is 'Werkstatt: Name.';
