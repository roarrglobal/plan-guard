import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Clock, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface SavedAnalysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchAnalyses();
    }
  }, [user, authLoading, navigate]);

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses:", error);
      toast({
        title: "Error loading analyses",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAnalyses(data || []);
    }
    setIsLoading(false);
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting analysis",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Analysis deleted",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#E5E5E5] border-t-[#0047AB] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[18px] font-bold text-[#1A1A1A]">
            My Analyses
          </span>
          <button
            onClick={handleSignOut}
            className="p-2 -mr-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 max-w-[680px] mx-auto w-full">
        {/* User info */}
        <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 mb-4">
          <p className="text-[15px] text-[#333333]">
            Welcome, <span className="font-medium">{profile?.display_name || user?.email}</span>
          </p>
          <p className="text-[13px] text-[#666666] mt-1">
            {analyses.length} saved {analyses.length === 1 ? "analysis" : "analyses"}
          </p>
        </div>

        {/* New Analysis button */}
        <Button
          onClick={() => navigate("/analyze")}
          className="w-full bg-[#0047AB] hover:bg-[#003A8C] text-white font-semibold py-3 rounded-lg mb-6 gap-2"
        >
          <Plus className="w-5 h-5" />
          New Analysis
        </Button>

        {/* Analyses list */}
        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[15px] text-[#666666] mb-2">
              No saved analyses yet
            </p>
            <p className="text-[13px] text-[#999999]">
              Start a new analysis to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-white border border-[#E5E5E5] rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() =>
                      navigate(`/analysis/${analysis.id}`, {
                        state: { analysis },
                      })
                    }
                    className="flex-1 text-left"
                  >
                    <p className="text-[15px] font-medium text-[#333333] line-clamp-2">
                      {analysis.title || analysis.original_input.slice(0, 100)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[12px] text-[#999999]">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(analysis.created_at), "MMM d, yyyy")}
                    </div>
                  </button>
                  <button
                    onClick={() => deleteAnalysis(analysis.id)}
                    className="p-2 text-[#999999] hover:text-[#D64045] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
