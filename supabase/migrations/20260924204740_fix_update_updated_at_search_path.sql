/*
# Fix update_updated_at search_path

Pin search_path = public on the update_updated_at trigger function
to resolve the function_search_path_mutable security advisor warning.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
