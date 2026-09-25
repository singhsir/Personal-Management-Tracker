/*
# Revoke EXECUTE on handle_new_user from anon and authenticated

The previous migration included REVOKE but the permissions persisted.
This strips direct EXECUTE access so the function can only fire as a trigger,
not be called via the REST API by anon or authenticated roles.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
