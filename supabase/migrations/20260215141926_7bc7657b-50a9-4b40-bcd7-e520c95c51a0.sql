
-- Remove the permissive UPDATE policy on chat_leads
-- Updates will be handled server-side via edge functions with service role
DROP POLICY IF EXISTS "Can update own chat lead by email" ON public.chat_leads;

-- No UPDATE policy for public/anon = only service role can update chat_leads
-- INSERT remains open for anonymous lead capture (this is intentional)
-- SELECT remains restricted (USING false) so no one can read leads from client
