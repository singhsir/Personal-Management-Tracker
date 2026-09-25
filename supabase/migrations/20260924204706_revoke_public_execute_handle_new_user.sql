/*
# Revoke PUBLIC EXECUTE on handle_new_user

Supabase grants EXECUTE on functions to PUBLIC by default, which means
anon and authenticated inherit it. Revoke from PUBLIC to close this.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
