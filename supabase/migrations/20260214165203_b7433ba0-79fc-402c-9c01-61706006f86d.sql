
-- Add search_vector column to team_decisions
ALTER TABLE public.team_decisions ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS team_decisions_search_idx ON public.team_decisions USING GIN(search_vector);

-- Trigger function to auto-update search vector
CREATE OR REPLACE FUNCTION public.team_decisions_search_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.decision_text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.input_context, '')), 'C');
  RETURN NEW;
END;
$$;

-- Trigger to run on insert/update
CREATE TRIGGER team_decisions_search_trigger
  BEFORE INSERT OR UPDATE ON public.team_decisions
  FOR EACH ROW EXECUTE FUNCTION public.team_decisions_search_update();

-- Backfill existing rows
UPDATE public.team_decisions SET search_vector =
  setweight(to_tsvector('english', coalesce(decision_text, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(input_context, '')), 'C');

-- Create search_team_decisions function for advanced search with filters
CREATE OR REPLACE FUNCTION public.search_team_decisions(
  p_team_id uuid,
  p_query text DEFAULT NULL,
  p_categories text[] DEFAULT NULL,
  p_stakes text[] DEFAULT NULL,
  p_statuses text[] DEFAULT NULL,
  p_creator_id uuid DEFAULT NULL,
  p_visibilities text[] DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_has_outcome boolean DEFAULT NULL,
  p_sort_by text DEFAULT 'created_desc',
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
  v_decisions jsonb;
  v_total integer;
  v_offset integer;
  v_tsquery tsquery;
BEGIN
  -- Security: must be team member
  IF NOT is_team_member(p_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  -- Build tsquery if search provided
  IF p_query IS NOT NULL AND trim(p_query) != '' THEN
    -- Convert to websearch for natural language queries
    v_tsquery := websearch_to_tsquery('english', p_query);
  END IF;

  -- Get total count
  SELECT count(*) INTO v_total
  FROM public.team_decisions td
  LEFT JOIN public.team_outcomes tou ON tou.decision_id = td.id
  WHERE td.team_id = p_team_id
    AND (v_tsquery IS NULL OR td.search_vector @@ v_tsquery)
    AND (p_categories IS NULL OR td.category = ANY(p_categories))
    AND (p_stakes IS NULL OR td.stakes = ANY(p_stakes))
    AND (p_statuses IS NULL OR td.status = ANY(p_statuses))
    AND (p_creator_id IS NULL OR td.created_by = p_creator_id)
    AND (p_visibilities IS NULL OR td.visibility = ANY(p_visibilities))
    AND (p_date_from IS NULL OR td.created_at >= p_date_from)
    AND (p_date_to IS NULL OR td.created_at <= p_date_to)
    AND (p_has_outcome IS NULL OR 
         (p_has_outcome = true AND tou.id IS NOT NULL) OR
         (p_has_outcome = false AND tou.id IS NULL));

  -- Get paginated results
  SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb) INTO v_decisions
  FROM (
    SELECT td.*,
      CASE WHEN v_tsquery IS NOT NULL THEN ts_rank(td.search_vector, v_tsquery) ELSE 0 END as relevance
    FROM public.team_decisions td
    LEFT JOIN public.team_outcomes tou ON tou.decision_id = td.id
    WHERE td.team_id = p_team_id
      AND (v_tsquery IS NULL OR td.search_vector @@ v_tsquery)
      AND (p_categories IS NULL OR td.category = ANY(p_categories))
      AND (p_stakes IS NULL OR td.stakes = ANY(p_stakes))
      AND (p_statuses IS NULL OR td.status = ANY(p_statuses))
      AND (p_creator_id IS NULL OR td.created_by = p_creator_id)
      AND (p_visibilities IS NULL OR td.visibility = ANY(p_visibilities))
      AND (p_date_from IS NULL OR td.created_at >= p_date_from)
      AND (p_date_to IS NULL OR td.created_at <= p_date_to)
      AND (p_has_outcome IS NULL OR 
           (p_has_outcome = true AND tou.id IS NOT NULL) OR
           (p_has_outcome = false AND tou.id IS NULL))
    ORDER BY
      CASE WHEN p_sort_by = 'relevance' AND v_tsquery IS NOT NULL THEN ts_rank(td.search_vector, v_tsquery) END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'created_desc' OR (p_sort_by = 'relevance' AND v_tsquery IS NULL) THEN td.created_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'created_asc' THEN td.created_at END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'title_asc' THEN td.decision_text END ASC NULLS LAST
    LIMIT p_page_size
    OFFSET v_offset
  ) r;

  v_result := jsonb_build_object(
    'decisions', v_decisions,
    'total_count', v_total,
    'page', p_page,
    'page_size', p_page_size,
    'has_more', (v_offset + p_page_size) < v_total
  );

  RETURN v_result;
END;
$$;
