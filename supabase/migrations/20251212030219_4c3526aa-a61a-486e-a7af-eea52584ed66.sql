
-- Scoring models table
CREATE TABLE public.scoring_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  criteria JSONB DEFAULT '[]'::jsonb,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project scores table
CREATE TABLE public.project_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scoring_model_id UUID NOT NULL REFERENCES public.scoring_models(id) ON DELETE CASCADE,
  criteria_scores JSONB DEFAULT '{}'::jsonb,
  total_score NUMERIC DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  calculated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, scoring_model_id)
);

-- Enable RLS
ALTER TABLE public.scoring_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scoring_models
CREATE POLICY "Users can view scoring models in their org"
  ON public.scoring_models FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage scoring models"
  ON public.scoring_models FOR ALL
  USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS Policies for project_scores
CREATE POLICY "Users can view project scores in their org"
  ON public.project_scores FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create project scores"
  ON public.project_scores FOR INSERT
  WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Users can update project scores in their org"
  ON public.project_scores FOR UPDATE
  USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can delete project scores"
  ON public.project_scores FOR DELETE
  USING (is_any_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_scoring_models_org ON public.scoring_models(organization_id);
CREATE INDEX idx_project_scores_project ON public.project_scores(project_id);
CREATE INDEX idx_project_scores_model ON public.project_scores(scoring_model_id);
CREATE INDEX idx_project_scores_org ON public.project_scores(organization_id);

-- Function to calculate weighted score
CREATE OR REPLACE FUNCTION public.calculate_project_score(
  p_criteria_scores JSONB,
  p_model_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_criteria JSONB;
  v_criterion RECORD;
  v_total_weight NUMERIC := 0;
  v_weighted_sum NUMERIC := 0;
  v_score NUMERIC;
  v_weight NUMERIC;
  v_max_scale NUMERIC;
BEGIN
  -- Get criteria from scoring model
  SELECT criteria INTO v_criteria FROM scoring_models WHERE id = p_model_id;
  
  IF v_criteria IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate weighted score
  FOR v_criterion IN SELECT * FROM jsonb_array_elements(v_criteria)
  LOOP
    v_weight := COALESCE((v_criterion.value->>'weight')::NUMERIC, 1);
    v_max_scale := COALESCE((v_criterion.value->>'scale_max')::NUMERIC, 5);
    v_score := COALESCE((p_criteria_scores->>((v_criterion.value->>'name')))::NUMERIC, 0);
    
    -- Normalize score to 0-100 scale
    v_weighted_sum := v_weighted_sum + (v_score / v_max_scale * 100 * v_weight);
    v_total_weight := v_total_weight + v_weight;
  END LOOP;
  
  IF v_total_weight = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(v_weighted_sum / v_total_weight, 2);
END;
$$;

-- Function to get portfolio ranking
CREATE OR REPLACE FUNCTION public.get_portfolio_ranking(p_model_id UUID DEFAULT NULL)
RETURNS TABLE(
  project_id UUID,
  project_name TEXT,
  project_status TEXT,
  total_score NUMERIC,
  criteria_scores JSONB,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_model_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id FROM profiles WHERE user_id = auth.uid();
  
  -- Get default model if not specified
  IF p_model_id IS NULL THEN
    SELECT id INTO v_model_id FROM scoring_models 
    WHERE organization_id = v_org_id AND is_default = true
    LIMIT 1;
  ELSE
    v_model_id := p_model_id;
  END IF;
  
  IF v_model_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.status,
    COALESCE(ps.total_score, 0),
    COALESCE(ps.criteria_scores, '{}'::jsonb),
    ROW_NUMBER() OVER (ORDER BY COALESCE(ps.total_score, 0) DESC)
  FROM projects p
  LEFT JOIN project_scores ps ON p.id = ps.project_id AND ps.scoring_model_id = v_model_id
  WHERE p.organization_id = v_org_id
  ORDER BY COALESCE(ps.total_score, 0) DESC;
END;
$$;
