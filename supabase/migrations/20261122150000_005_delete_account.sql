-- =====================================================================
--  Migration 005 · Konto selber löschen
-- =====================================================================
--  Die App ruft supabase.rpc('delete_my_account') auf. Die Funktion
--  löscht nur das Konto der eingeloggten Person. Alle eigenen Daten
--  (Profil, Motorräder, Wartungen, Termine …) hängen per
--  «on delete cascade» am Konto und verschwinden mit.
--  Apple und Google verlangen, dass man das Konto in der App löschen kann.
-- =====================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
