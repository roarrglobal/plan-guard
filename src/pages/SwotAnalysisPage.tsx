import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Save, Sparkles, Plus, X, 
  TrendingUp, TrendingDown, Target, AlertTriangle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { exportFrameworkPDF, type FrameworkData } from "@/lib/pdfExport";

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface AiEnhancement {
  insights: string[];
  recommendations: string[];
}

export default function SwotAnalysisPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoading: authLoading, profile } = useAuth();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [data, setData] = useState<SwotData>({
    strengths: [""],
    weaknesses: [""],
    opportunities: [""],
    threats: [""],
  });
  const [aiEnhancement, setAiEnhancement] = useState<AiEnhancement | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isNew && user) {
      loadAnalysis();
    }
  }, [id, user]);

  const loadAnalysis = async () => {
    const { data: analysis, error } = await supabase
      .from("framework_analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !analysis) {
      toast.error("Failed to load analysis");
      navigate("/frameworks");
      return;
    }

    setTitle(analysis.title || "");
    const inputs = analysis.inputs as Record<string, unknown>;
    setData({
      strengths: (inputs.strengths as string[]) || [""],
      weaknesses: (inputs.weaknesses as string[]) || [""],
      opportunities: (inputs.opportunities as string[]) || [""],
      threats: (inputs.threats as string[]) || [""],
    });
    if (analysis.ai_enhancement) {
      setAiEnhancement(analysis.ai_enhancement as unknown as AiEnhancement);
    }
    setIsLoading(false);
  };

  const updateItem = (category: keyof SwotData, index: number, value: string) => {
    setData((prev) => ({
      ...prev,
      [category]: prev[category].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addItem = (category: keyof SwotData) => {
    setData((prev) => ({
      ...prev,
      [category]: [...prev[category], ""],
    }));
  };

  const removeItem = (category: keyof SwotData, index: number) => {
    if (data[category].length > 1) {
      setData((prev) => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const cleanedData = {
      strengths: data.strengths.filter((s) => s.trim()),
      weaknesses: data.weaknesses.filter((s) => s.trim()),
      opportunities: data.opportunities.filter((s) => s.trim()),
      threats: data.threats.filter((s) => s.trim()),
    };

    const payload = {
      user_id: user.id,
      framework_type: "swot",
      title: title || "SWOT Analysis",
      inputs: cleanedData as unknown as Json,
      ai_enhancement: aiEnhancement as unknown as Json,
    };

    if (isNew) {
      const { error } = await supabase.from("framework_analyses").insert(payload);
      if (error) {
        toast.error("Failed to save");
      } else {
        toast.success("Analysis saved");
        navigate("/frameworks");
      }
    } else {
      const { error } = await supabase
        .from("framework_analyses")
        .update(payload)
        .eq("id", id);
      if (error) {
        toast.error("Failed to update");
      } else {
        toast.success("Analysis updated");
      }
    }
    setIsSaving(false);
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    // Simulate AI enhancement
    await new Promise((r) => setTimeout(r, 2000));
    
    const cleanedData = {
      strengths: data.strengths.filter((s) => s.trim()),
      weaknesses: data.weaknesses.filter((s) => s.trim()),
      opportunities: data.opportunities.filter((s) => s.trim()),
      threats: data.threats.filter((s) => s.trim()),
    };

    // Generate insights based on the data
    const insights = [];
    if (cleanedData.strengths.length > cleanedData.weaknesses.length) {
      insights.push("Strong foundation - leverage your strengths to capitalize on opportunities");
    }
    if (cleanedData.threats.length > 0) {
      insights.push(`${cleanedData.threats.length} threats identified - consider mitigation strategies`);
    }
    if (cleanedData.opportunities.length > 0) {
      insights.push("Growth potential exists - align resources with top opportunities");
    }

    const recommendations = [
      "Cross-reference strengths with opportunities for strategic initiatives",
      "Address weaknesses that amplify threats as priority",
      "Consider converting threats into opportunities where possible",
    ];

    setAiEnhancement({ insights, recommendations });
    setIsEnhancing(false);
    toast.success("AI analysis complete");
  };

  const handleExportPDF = () => {
    const cleanedData = {
      strengths: data.strengths.filter((s) => s.trim()),
      weaknesses: data.weaknesses.filter((s) => s.trim()),
      opportunities: data.opportunities.filter((s) => s.trim()),
      threats: data.threats.filter((s) => s.trim()),
    };

    const pdfData: FrameworkData = {
      title: title || "SWOT Analysis",
      frameworkType: "swot",
      inputs: cleanedData,
      aiEnhancement: aiEnhancement ? {
        insights: aiEnhancement.insights,
        recommendations: aiEnhancement.recommendations,
      } : undefined,
    };

    try {
      exportFrameworkPDF(pdfData, profile?.display_name || undefined);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const categories = [
    { key: "strengths" as const, label: "Strengths", icon: TrendingUp, color: "bg-green-500" },
    { key: "weaknesses" as const, label: "Weaknesses", icon: TrendingDown, color: "bg-red-500" },
    { key: "opportunities" as const, label: "Opportunities", icon: Target, color: "bg-blue-500" },
    { key: "threats" as const, label: "Threats", icon: AlertTriangle, color: "bg-amber-500" },
  ];

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/frameworks")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Analysis title..."
            className="text-xl font-bold border-0 px-0 focus-visible:ring-0"
          />
        </div>
        <Button variant="outline" onClick={handleEnhance} disabled={isEnhancing}>
          <Sparkles className="h-4 w-4 mr-2" />
          {isEnhancing ? "Analyzing..." : "AI Enhance"}
        </Button>
        {!isNew && (
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* SWOT Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className={`p-1.5 rounded ${color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data[key].map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={item}
                    onChange={(e) => updateItem(key, index, e.target.value)}
                    placeholder={`Add ${label.toLowerCase().slice(0, -1)}...`}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeItem(key, index)}
                    disabled={data[key].length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => addItem(key)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {label.slice(0, -1)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      {aiEnhancement && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {aiEnhancement.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {aiEnhancement.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
