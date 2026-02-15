
-- Create audit event type enum
CREATE TYPE public.audit_event_type AS ENUM (
  'decision.created', 'decision.updated', 'decision.deleted', 'decision.status_changed', 'decision.visibility_changed',
  'analysis.started', 'analysis.completed', 'analysis.failed',
  'outcome.logged', 'outcome.updated',
  'team.created', 'team.updated', 'team.settings_changed',
  'member.invited', 'member.joined', 'member.role_changed', 'member.removed', 'member.left',
  'template.created', 'template.updated', 'template.deleted',
  'auth.login', 'auth.logout', 'auth.password_changed',
  'export.pdf_generated', 'export.csv_downloaded'
);

-- Create audit entity type enum
CREATE TYPE public.audit_entity_type AS ENUM (
  'decision', 'analysis', 'outcome', 'team', 'member', 'template', 'settings', 'export'
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event_type public.audit_event_type NOT NULL,
  entity_type public.audit_entity_type NOT NULL,
  entity_id uuid,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address varchar(45),
  user_agent varchar(500),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_log_team_id ON public.audit_log(team_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_event_type ON public.audit_log(event_type);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Immutable: only INSERT, no UPDATE or DELETE
-- Team members can insert audit events
CREATE POLICY "Team members can insert audit events"
  ON public.audit_log FOR INSERT
  WITH CHECK (is_team_member(team_id, auth.uid()) AND user_id = auth.uid());

-- Only admins/owners can read
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (is_team_admin(team_id, auth.uid()));

-- No UPDATE or DELETE policies = immutable
