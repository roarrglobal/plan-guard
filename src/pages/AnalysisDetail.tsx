import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResults, type AnalysisResult } from "@/components/analysis/AnalysisResults";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalysisDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<{
    original_input: string;
    result: AnalysisResult;
  } | null>(location.state?.analysis || null);
  const [isLoading, setIsLoading] = useState(!analysis);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (!analysis && id && user) {
      fetchAnalysis();
    }
  }, [id, user, authLoading, analysis]);

  const fetchAnalysis = async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      navigate("/dashboard");
      return;
    }

    setAnalysis({
      original_input: data.original_input,
      result: data.result as unknown as AnalysisResult,
    });
    setIsLoading(false);
  };

  if (authLoading || isLoading || !analysis) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#E5E5E5] border-t-[#0047AB] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnalysisResults
      result={analysis.result}
      originalInput={analysis.original_input}
      onNewAnalysis={() => navigate("/analyze")}
      isLoggedIn={!!user}
    />
  );
}
