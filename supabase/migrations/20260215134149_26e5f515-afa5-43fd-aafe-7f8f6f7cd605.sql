
-- Create the auth email hook function that forwards to our edge function
CREATE OR REPLACE FUNCTION public.custom_auth_email_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  edge_url text;
  service_key text;
  request_id bigint;
BEGIN
  edge_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-auth-email';
  service_key := current_setting('app.settings.service_role_key', true);

  -- Use net.http_post to call our edge function asynchronously
  SELECT net.http_post(
    url := edge_url,
    body := jsonb_build_object(
      'type', event->'email_data'->>'email_action_type',
      'email', event->'user'->>'email',
      'confirmation_url', event->'email_data'->>'confirmation_url',
      'token_hash', event->'email_data'->>'token_hash',
      'redirect_to', event->'email_data'->>'redirect_to'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    )
  ) INTO request_id;

  -- Return the event unchanged to signal Supabase Auth that we handled the email
  RETURN event;
END;
$$;

-- Grant execute to supabase_auth_admin so the hook can be called
GRANT EXECUTE ON FUNCTION public.custom_auth_email_hook TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_auth_email_hook FROM public;
REVOKE EXECUTE ON FUNCTION public.custom_auth_email_hook FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_auth_email_hook FROM authenticated;
