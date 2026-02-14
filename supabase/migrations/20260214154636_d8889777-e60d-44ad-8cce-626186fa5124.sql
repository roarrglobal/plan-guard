
-- Create department enum type
CREATE TYPE public.department_type AS ENUM ('sales', 'finance', 'product', 'hr', 'marketing', 'operations', 'strategy');

-- Create insight type enum
CREATE TYPE public.insight_type AS ENUM ('blind_spot_pattern', 'failure_pattern', 'success_pattern');

-- Create decision_templates table
CREATE TABLE public.decision_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  department public.department_type NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  input_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompt_additions TEXT,
  blind_spot_library JSONB NOT NULL DEFAULT '[]'::jsonb,
  failure_mode_library JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create department_insights table
CREATE TABLE public.department_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  department public.department_type NOT NULL,
  insight_type public.insight_type NOT NULL,
  insight_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  decision_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add template_id to team_decisions
ALTER TABLE public.team_decisions ADD COLUMN template_id UUID REFERENCES public.decision_templates(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.decision_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_insights ENABLE ROW LEVEL SECURITY;

-- RLS for decision_templates
CREATE POLICY "Anyone can view system templates"
  ON public.decision_templates FOR SELECT
  USING (is_system = true);

CREATE POLICY "Team members can view team templates"
  ON public.decision_templates FOR SELECT
  USING (team_id IS NOT NULL AND is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create templates"
  ON public.decision_templates FOR INSERT
  WITH CHECK (team_id IS NOT NULL AND is_team_member(team_id, auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Creator or admin can update templates"
  ON public.decision_templates FOR UPDATE
  USING (is_system = false AND (created_by = auth.uid() OR (team_id IS NOT NULL AND is_team_admin(team_id, auth.uid()))));

CREATE POLICY "Creator or admin can delete templates"
  ON public.decision_templates FOR DELETE
  USING (is_system = false AND (created_by = auth.uid() OR (team_id IS NOT NULL AND is_team_admin(team_id, auth.uid()))));

-- RLS for department_insights
CREATE POLICY "Team members can view insights"
  ON public.department_insights FOR SELECT
  USING (is_team_member(team_id, auth.uid()));

CREATE POLICY "Team members can create insights"
  ON public.department_insights FOR INSERT
  WITH CHECK (is_team_member(team_id, auth.uid()));

CREATE POLICY "Team admins can update insights"
  ON public.department_insights FOR UPDATE
  USING (is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can delete insights"
  ON public.department_insights FOR DELETE
  USING (is_team_admin(team_id, auth.uid()));

-- Seed system templates

-- 1. Sales: Deal Pursuit Analysis
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'sales',
  'Deal Pursuit Analysis',
  'Should we pursue this opportunity?',
  true,
  '[
    {"name": "deal_value", "type": "number", "label": "Deal Value ($)", "required": true},
    {"name": "deal_stage", "type": "select", "label": "Deal Stage", "required": true, "options": ["Discovery", "Qualification", "Proposal", "Negotiation", "Closing"]},
    {"name": "champion_name", "type": "text", "label": "Champion Name", "required": false},
    {"name": "competitor_names", "type": "text", "label": "Competitor Names", "required": false},
    {"name": "expected_close_date", "type": "date", "label": "Expected Close Date", "required": false},
    {"name": "win_probability_gut", "type": "slider", "label": "Gut Win Probability (%)", "required": false, "min": 0, "max": 100}
  ]'::jsonb,
  '[
    {"spot": "Champion dependency", "category": "political", "prompt": "What happens if the champion leaves, gets reassigned, or loses influence?"},
    {"spot": "Budget assumption", "category": "financial", "prompt": "Is budget actually approved, or just expected? When does fiscal year end?"},
    {"spot": "Competitive blind spot", "category": "strategic", "prompt": "Who else is in this deal? What is their positioning vs ours?"},
    {"spot": "Timeline reality", "category": "operational", "prompt": "Is the expected close date based on their process or our wishful thinking?"},
    {"spot": "Technical fit gap", "category": "operational", "prompt": "Can we actually deliver what they need, or are we stretching?"},
    {"spot": "Decision-maker access", "category": "political", "prompt": "Have we talked to the actual decision-maker, or just influencers?"},
    {"spot": "Procurement surprise", "category": "operational", "prompt": "What is their procurement process? Legal review timeline?"}
  ]'::jsonb,
  '[
    {"mode": "Deal slips quarter", "mechanism": "Procurement/legal takes longer than expected", "likelihood_factors": ["Late stage entry", "No legal contact yet", "Q4 timing"]},
    {"mode": "Discount spiral", "mechanism": "Competitor undercuts, we match, margins erode", "likelihood_factors": ["Commodity perception", "Multiple competitors", "Procurement-led"]},
    {"mode": "Champion leaves", "mechanism": "Internal reorg, champion reassigned or exits", "likelihood_factors": ["Recent M&A", "Leadership changes", "Restructuring rumors"]},
    {"mode": "No decision", "mechanism": "Prospect chooses to do nothing, keeps status quo", "likelihood_factors": ["No burning platform", "Change fatigue", "Budget constraints"]},
    {"mode": "Wrong stakeholder", "mechanism": "Selling to someone without authority", "likelihood_factors": ["No exec sponsor", "Delegated evaluation", "No budget discussion"]}
  ]'::jsonb
);

-- 2. Finance: Budget Approval Analysis
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'finance',
  'Budget Approval Analysis',
  'Should this budget request be approved?',
  true,
  '[
    {"name": "request_amount", "type": "number", "label": "Request Amount ($)", "required": true},
    {"name": "requesting_department", "type": "select", "label": "Requesting Department", "required": false, "options": ["Sales", "Engineering", "Marketing", "Operations", "HR", "Product", "Other"]},
    {"name": "budget_category", "type": "select", "label": "Budget Category", "required": true, "options": ["Capex", "Opex", "Headcount", "Project"]},
    {"name": "roi_claimed", "type": "text", "label": "Claimed ROI", "required": false},
    {"name": "payback_period_months", "type": "number", "label": "Payback Period (months)", "required": false}
  ]'::jsonb,
  '[
    {"spot": "Hidden costs", "category": "financial", "prompt": "What implementation, training, and ongoing costs are not in the request?"},
    {"spot": "Opportunity cost", "category": "strategic", "prompt": "What else could this money fund? What is being deprioritized?"},
    {"spot": "Sunk cost influence", "category": "financial", "prompt": "Is this request justified by past spend rather than future value?"},
    {"spot": "Fiscal year timing", "category": "operational", "prompt": "How does this affect close, audit, or quarterly reporting?"},
    {"spot": "Vendor lock-in", "category": "strategic", "prompt": "Does this create dependency that increases future costs?"},
    {"spot": "ROI assumptions", "category": "financial", "prompt": "Are the claimed benefits realistic? What is the evidence?"}
  ]'::jsonb,
  '[
    {"mode": "Budget overrun", "mechanism": "Scope creep, hidden costs, change orders", "likelihood_factors": ["Vague scope", "New vendor", "Complex integration"]},
    {"mode": "ROI never realized", "mechanism": "Benefits depend on adoption/behavior change that does not happen", "likelihood_factors": ["Requires training", "Culture change needed", "No owner post-implementation"]},
    {"mode": "Cash flow crunch", "mechanism": "Large outflows before value realization", "likelihood_factors": ["Upfront payment", "Long implementation", "Revenue uncertainty"]}
  ]'::jsonb
);

-- 3. Product: Feature Prioritization
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'product',
  'Feature Prioritization',
  'Should we build this feature?',
  true,
  '[
    {"name": "feature_name", "type": "text", "label": "Feature Name", "required": true},
    {"name": "estimated_effort", "type": "select", "label": "Estimated Effort", "required": true, "options": ["XS", "S", "M", "L", "XL"]},
    {"name": "requesting_source", "type": "select", "label": "Requesting Source", "required": false, "options": ["Customer", "Sales", "Internal", "Competitive"]},
    {"name": "customer_impact", "type": "slider", "label": "Customer Impact", "required": false, "min": 1, "max": 10},
    {"name": "strategic_alignment", "type": "slider", "label": "Strategic Alignment", "required": false, "min": 1, "max": 10}
  ]'::jsonb,
  '[
    {"spot": "Adoption assumption", "category": "strategic", "prompt": "Will users actually use this? What is the evidence beyond requests?"},
    {"spot": "Engineering complexity", "category": "operational", "prompt": "Is the effort estimate realistic? What dependencies exist?"},
    {"spot": "Competitive timing", "category": "strategic", "prompt": "Will the market wait for us? What are competitors shipping?"},
    {"spot": "Maintenance burden", "category": "operational", "prompt": "What is the ongoing cost to maintain this feature?"},
    {"spot": "Data availability", "category": "operational", "prompt": "Do we have the data needed? What integrations are required?"},
    {"spot": "Segment mismatch", "category": "strategic", "prompt": "Is this for our target segment, or pulling us off-focus?"}
  ]'::jsonb,
  '[
    {"mode": "Feature ships, no one uses", "mechanism": "Built for vocal minority, silent majority does not care", "likelihood_factors": ["Single customer request", "No usage data", "Nice-to-have framing"]},
    {"mode": "Scope explosion", "mechanism": "Edge cases multiply, simple becomes complex", "likelihood_factors": ["Vague requirements", "Multiple stakeholders", "Integration needed"]},
    {"mode": "Launch delay", "mechanism": "Dependencies, tech debt, resource constraints", "likelihood_factors": ["New technology", "Team stretched", "Q4 timing"]}
  ]'::jsonb
);

-- 4. HR: Hiring Decision
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'hr',
  'Hiring Decision',
  'Should we hire this candidate?',
  true,
  '[
    {"name": "candidate_name", "type": "text", "label": "Candidate Name", "required": true},
    {"name": "role_level", "type": "select", "label": "Role Level", "required": true, "options": ["IC", "Senior", "Lead", "Manager", "Director", "VP", "C-level"]},
    {"name": "team_size_current", "type": "number", "label": "Current Team Size", "required": false},
    {"name": "interview_score_avg", "type": "slider", "label": "Interview Score (Avg)", "required": false, "min": 1, "max": 10},
    {"name": "culture_fit_score", "type": "slider", "label": "Culture Fit Score", "required": false, "min": 1, "max": 10},
    {"name": "references_completed", "type": "boolean", "label": "References Completed?", "required": false}
  ]'::jsonb,
  '[
    {"spot": "Culture fit assumption", "category": "political", "prompt": "Is culture fit masking bias? What specifically fits or does not?"},
    {"spot": "Reference validity", "category": "operational", "prompt": "Are references telling the truth? Who chose them?"},
    {"spot": "Hiring urgency bias", "category": "operational", "prompt": "Are we lowering the bar because we are desperate to fill?"},
    {"spot": "Team dynamics", "category": "political", "prompt": "How will existing team react? Any personality conflicts?"},
    {"spot": "Competitor risk", "category": "strategic", "prompt": "Will they actually accept? What is their BATNA?"},
    {"spot": "Onboarding reality", "category": "operational", "prompt": "Do we have capacity to onboard properly right now?"}
  ]'::jsonb,
  '[
    {"mode": "Offer rejected", "mechanism": "Counter-offer, competing offer, changed mind", "likelihood_factors": ["Long process", "Multiple offers", "Passive candidate"]},
    {"mode": "90-day exit", "mechanism": "Mismatch becomes clear, either party exits", "likelihood_factors": ["Fast process", "Limited interviews", "Role ambiguity"]},
    {"mode": "Team disruption", "mechanism": "New hire creates conflict, existing members leave", "likelihood_factors": ["Strong personalities", "Unclear reporting", "Culture mismatch"]}
  ]'::jsonb
);

-- 5. Marketing: Campaign Launch
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'marketing',
  'Campaign Launch',
  'Should we launch this campaign?',
  true,
  '[
    {"name": "campaign_name", "type": "text", "label": "Campaign Name", "required": true},
    {"name": "budget", "type": "number", "label": "Budget ($)", "required": false},
    {"name": "channels", "type": "multiselect", "label": "Channels", "required": false, "options": ["Paid", "Organic", "Email", "Social", "Events", "PR"]},
    {"name": "target_audience", "type": "text", "label": "Target Audience", "required": false},
    {"name": "success_metric", "type": "text", "label": "Success Metric", "required": false},
    {"name": "timeline_weeks", "type": "number", "label": "Timeline (weeks)", "required": false}
  ]'::jsonb,
  '[
    {"spot": "Attribution assumption", "category": "operational", "prompt": "Can we actually measure ROI? What is the attribution model?"},
    {"spot": "Audience assumption", "category": "strategic", "prompt": "Do we really know this audience? What data supports targeting?"},
    {"spot": "Competitive timing", "category": "strategic", "prompt": "What else is happening in market? Will we be drowned out?"},
    {"spot": "Internal alignment", "category": "political", "prompt": "Is sales ready to support? Product aligned with messaging?"},
    {"spot": "Creative fatigue", "category": "operational", "prompt": "Is this fresh, or are we repeating what stopped working?"}
  ]'::jsonb,
  '[
    {"mode": "No measurable impact", "mechanism": "Cannot attribute results, declared failure or success randomly", "likelihood_factors": ["Brand campaign", "Long sales cycle", "Multi-touch journey"]},
    {"mode": "Audience miss", "mechanism": "Message resonates with wrong segment, right segment ignores", "likelihood_factors": ["New audience", "Assumed persona", "No testing"]},
    {"mode": "Budget burn", "mechanism": "Spend without optimization, money wasted early", "likelihood_factors": ["Fixed commitment", "No test phase", "Agency-led"]}
  ]'::jsonb
);

-- 6. Operations: Process Automation
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'operations',
  'Process Automation',
  'Should we automate this process?',
  true,
  '[
    {"name": "process_name", "type": "text", "label": "Process Name", "required": true},
    {"name": "current_manual_hours_weekly", "type": "number", "label": "Current Manual Hours/Week", "required": false},
    {"name": "implementation_cost_estimate", "type": "number", "label": "Implementation Cost ($)", "required": false},
    {"name": "affected_team_size", "type": "number", "label": "Affected Team Size", "required": false}
  ]'::jsonb,
  '[
    {"spot": "Exception handling", "category": "operational", "prompt": "What edge cases require human judgment? How often do they occur?"},
    {"spot": "Training requirements", "category": "operational", "prompt": "How long to train team? What is the productivity dip during transition?"},
    {"spot": "Integration complexity", "category": "operational", "prompt": "What systems does this touch? What breaks if one changes?"},
    {"spot": "Rollback capability", "category": "operational", "prompt": "If this fails, can we go back? How quickly?"},
    {"spot": "Vendor dependency", "category": "strategic", "prompt": "Are we creating single point of failure with this vendor?"}
  ]'::jsonb,
  '[
    {"mode": "Implementation drags", "mechanism": "Scope grows, timeline extends, cost overruns", "likelihood_factors": ["Legacy systems", "Multiple integrations", "Unclear requirements"]},
    {"mode": "Adoption failure", "mechanism": "Team resists, works around system, dual processes", "likelihood_factors": ["No change management", "Forced rollout", "Poor UX"]},
    {"mode": "Garbage in, garbage out", "mechanism": "Automation amplifies bad data/process at scale", "likelihood_factors": ["Data quality issues", "Process not standardized", "No audit"]}
  ]'::jsonb
);

-- 7. Strategy: M&A Evaluation
INSERT INTO public.decision_templates (department, name, description, is_system, input_fields, blind_spot_library, failure_mode_library)
VALUES (
  'strategy',
  'M&A Evaluation',
  'Should we acquire/merge with this company?',
  true,
  '[
    {"name": "target_company", "type": "text", "label": "Target Company", "required": true},
    {"name": "deal_value_estimate", "type": "number", "label": "Deal Value Estimate ($)", "required": false},
    {"name": "strategic_rationale", "type": "select", "label": "Strategic Rationale", "required": false, "options": ["Market expansion", "Technology", "Team", "Revenue", "Defensive"]},
    {"name": "integration_complexity", "type": "select", "label": "Integration Complexity", "required": false, "options": ["Low", "Medium", "High"]}
  ]'::jsonb,
  '[
    {"spot": "Synergy fantasy", "category": "financial", "prompt": "Are projected synergies realistic? What is the track record?"},
    {"spot": "Culture collision", "category": "political", "prompt": "How different are the cultures? Who is staying post-acquisition?"},
    {"spot": "Integration cost", "category": "financial", "prompt": "What is the real cost to integrate systems, processes, people?"},
    {"spot": "Customer overlap", "category": "strategic", "prompt": "Will we lose customers due to overlap or confusion?"},
    {"spot": "Key person dependency", "category": "political", "prompt": "Does the value walk out the door if key people leave?"},
    {"spot": "Regulatory risk", "category": "operational", "prompt": "Any antitrust, regulatory, or compliance blockers?"}
  ]'::jsonb,
  '[
    {"mode": "Integration fails", "mechanism": "Systems do not merge, teams do not gel, synergies do not materialize", "likelihood_factors": ["Different tech stacks", "Remote teams", "Culture mismatch"]},
    {"mode": "Key talent exits", "mechanism": "Best people leave during transition uncertainty", "likelihood_factors": ["No retention packages", "Role ambiguity", "Competing offers"]},
    {"mode": "Overpayment", "mechanism": "Paid for growth/synergies that never happened", "likelihood_factors": ["Competitive auction", "FOMO", "Aggressive projections"]}
  ]'::jsonb
);

-- Create updated_at trigger for decision_templates
CREATE TRIGGER update_decision_templates_updated_at
  BEFORE UPDATE ON public.decision_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for department_insights
CREATE TRIGGER update_department_insights_updated_at
  BEFORE UPDATE ON public.department_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
