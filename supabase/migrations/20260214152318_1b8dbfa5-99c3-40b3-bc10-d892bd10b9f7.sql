
-- Database function for team analytics
CREATE OR REPLACE FUNCTION public.get_team_analytics(p_team_id uuid, p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_current_start date;
  v_previous_start date;
  v_current_count integer;
  v_previous_count integer;
  v_completed integer;
  v_total integer;
  v_correct integer;
  v_total_predictions integer;
  v_avg_sat numeric;
  v_prev_avg_sat numeric;
BEGIN
  IF NOT is_team_member(p_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_current_start := CURRENT_DATE - p_days;
  v_previous_start := v_current_start - p_days;

  -- Decision volume
  SELECT count(*) INTO v_current_count FROM team_decisions
  WHERE team_id = p_team_id AND created_at >= v_current_start;
  
  SELECT count(*) INTO v_previous_count FROM team_decisions
  WHERE team_id = p_team_id AND created_at >= v_previous_start AND created_at < v_current_start;

  -- Completion rate (all time)
  SELECT count(*) INTO v_total FROM team_decisions WHERE team_id = p_team_id;
  SELECT count(*) INTO v_completed FROM team_outcomes WHERE team_id = p_team_id;

  -- Prediction accuracy from outcomes
  SELECT 
    COALESCE(sum(jsonb_array_length(COALESCE(predictions_hit, '[]'::jsonb))), 0),
    COALESCE(sum(
      jsonb_array_length(COALESCE(predictions_hit, '[]'::jsonb)) + 
      jsonb_array_length(COALESCE(predictions_missed, '[]'::jsonb))
    ), 0)
  INTO v_correct, v_total_predictions
  FROM team_outcomes WHERE team_id = p_team_id;

  -- Avg satisfaction
  SELECT avg(satisfaction) INTO v_avg_sat FROM team_outcomes WHERE team_id = p_team_id AND satisfaction IS NOT NULL;
  SELECT avg(satisfaction) INTO v_prev_avg_sat FROM team_outcomes 
  WHERE team_id = p_team_id AND satisfaction IS NOT NULL AND created_at < v_current_start;

  v_result := jsonb_build_object(
    'decision_volume', jsonb_build_object('current', v_current_count, 'previous', v_previous_count),
    'completion', jsonb_build_object('completed', v_completed, 'total', v_total),
    'prediction_accuracy', jsonb_build_object('correct', v_correct, 'total', v_total_predictions, 'outcome_count', v_completed),
    'avg_satisfaction', jsonb_build_object('score', round(COALESCE(v_avg_sat, 0)::numeric, 1), 'previous', round(COALESCE(v_prev_avg_sat, 0)::numeric, 1))
  );

  RETURN v_result;
END;
$function$;
