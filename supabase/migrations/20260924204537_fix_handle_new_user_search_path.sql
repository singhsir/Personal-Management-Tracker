/*
# Fix handle_new_user trigger function

## Problem
The `handle_new_user()` SECURITY DEFINER trigger function had no explicit `search_path`,
causing "Database error saving new user" during signup. The Supabase database linter
flagged this as a security risk (function_search_path_mutable). Without a pinned
search_path, the function may fail to resolve the `profiles` table when the trigger
fires during auth.users INSERT.

## Changes
1. Recreate `handle_new_user()` with `search_path = public` to pin schema resolution.
2. Revoke EXECUTE from `anon` and `authenticated` roles so the function cannot be
   called directly via the REST API — it should only fire as a trigger.
3. Re-attach the existing trigger (drop + recreate to ensure it points to the fixed function).

## No schema changes
- No tables created, altered, or dropped.
- No columns changed.
- No RLS policies changed.
- The `profiles` table structure is unchanged.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO profiles (id, full_name, currency)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'INR')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
