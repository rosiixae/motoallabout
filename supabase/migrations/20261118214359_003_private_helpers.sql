-- =====================================================================
--  Migration 003 · Hilfsfunktionen aus der öffentlichen API nehmen
-- =====================================================================
--  Die Funktionen, die Row Level Security prüfen (owns_motorcycle,
--  owns_maintenance_event) und der Trigger für neue Konten laufen mit
--  erhöhten Rechten (security definer). Im Schema «public» wären sie über
--  die API als /rest/v1/rpc/... aufrufbar. Im Schema «private» sind sie
--  das nicht, die Regeln (Policies) funktionieren aber genau gleich weiter.
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter function public.owns_motorcycle(uuid)        set schema private;
alter function public.owns_maintenance_event(uuid) set schema private;
alter function public.handle_new_user()            set schema private;
