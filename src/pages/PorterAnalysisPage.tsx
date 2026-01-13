import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Save, Sparkles, Users, Building, 
  Package, ShoppingCart, Swords 
} from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface ForceData {
  rating: number;
  notes: string;
  factors: string[];
}

interface PorterData {
  rivalry: ForceData;
  newEntrants: ForceData;
  substitutes: ForceData;
  buyerPower: ForceData;
  supplierPower: ForceData;
}

interface AiEnhancement {
  overallAssessment: string;
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
}

const defaultForce: ForceData = { rating: 50, notes: "", factors: [""] };

export default function PorterAnalysisPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [data, setData] = useState<PorterData>({
    rivalry: { ...defaultForce },
    newEntrants: { ...defaultForce },
    substitutes: { ...defaultForce },
    buyerPower: { ...defaultForce },
    supplierPower: { ...defaultForce },
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
    const inputs = analysis.inputs as unknown as PorterData;
    if (inputs.rivalry) {
      setData(inputs);
    }
    if (analysis.ai_enhancement) {
      setAiEnhancement(analysis.ai_enhancement as unknown as AiEnhancement);
    }
    setIsLoading(false);
  };

  const updateForce = (key: keyof PorterData, updates: Partial<ForceData>) => {
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      user_id: user.id,
      framework_type: "porter",
      title: title || "Porter's Five Forces",
      inputs: data as unknown as Json,
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
    await new Promise((r) => setTimeout(r, 2000));

    const avgRating = (
      data.rivalry.rating +
      data.newEntrants.rating +
      data.substitutes.rating +
      data.buyerPower.rating +
      data.supplierPower.rating
    ) / 5;

    const riskLevel = avgRating > 66 ? "high" : avgRating > 33 ? "medium" : "low";
    
    const recommendations = [];
    if (data.rivalry.rating > 60) {
      recommendations.push("High rivalry - focus on differentiation or cost leadership");
    }
    if (data.newEntrants.rating > 60) {
      recommendations.push("Threat of new entrants - strengthen barriers to entry");
    }
    if (data.buyerPower.rating > 60) {
      recommendations.push("Strong buyer power - diversify customer base or increase switching costs");
    }
    if (data.supplierPower.rating > 60) {
      recommendations.push("Strong supplier power - consider backward integration");
    }
    if (recommendations.length === 0) {
      recommendations.push("Industry dynamics are favorable - focus on growth");
    }

    setAiEnhancement({
      overallAssessment: `Industry attractiveness is ${riskLevel === "low" ? "high" : riskLevel === "high" ? "low" : "moderate"} based on competitive forces analysis.`,
      recommendations,
      riskLevel,
    });
    setIsEnhancing(false);
    toast.success("AI analysis complete");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const forces = [
    { key: "rivalry" as const, label: "Competitive Rivalry", icon: Swords, color: "bg-red-500", desc: "How intense is competition among existing players?" },
    { key: "newEntrants" as const, label: "Threat of New Entrants", icon: Building, color: "bg-purple-500", desc: "How easy is it for new competitors to enter?" },
    { key: "substitutes" as const, label: "Threat of Substitutes", icon: Package, color: "bg-amber-500", desc: "How easily can customers switch to alternatives?" },
    { key: "buyerPower" as const, label: "Buyer Power", icon: ShoppingCart, color: "bg-blue-500", desc: "How much leverage do customers have?" },
    { key: "supplierPower" as const, label: "Supplier Power", icon: Users, color: "bg-green-500", desc: "How much leverage do suppliers have?" },
  ];

  const getRatingLabel = (value: number) => {
    if (value <= 33) return { label: "Low", color: "text-green-600" };
    if (value <= 66) return { label: "Medium", color: "text-amber-600" };
    return { label: "High", color: "text-red-600" };
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
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
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Forces */}
      <div className="space-y-4">
        {forces.map(({ key, label, icon: Icon, color, desc }) => {
          const ratingInfo = getRatingLabel(data[key].rating);
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`p-1.5 rounded ${color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {label}
                  <Badge variant="outline" className={ratingInfo.color}>
                    {ratingInfo.label}
                  </Badge>
                </CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Force Intensity</span>
                    <span className={ratingInfo.color}>{data[key].rating}%</span>
                  </div>
                  <Slider
                    value={[data[key].rating]}
                    onValueChange={([value]) => updateForce(key, { rating: value })}
                    max={100}
                    step={1}
                  />
                </div>
                <Textarea
                  value={data[key].notes}
                  onChange={(e) => updateForce(key, { notes: e.target.value })}
                  placeholder="Add notes about this force..."
                  className="min-h-[80px] resize-none"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights */}
      {aiEnhancement && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Assessment
              <Badge 
                variant={aiEnhancement.riskLevel === "low" ? "default" : aiEnhancement.riskLevel === "high" ? "destructive" : "secondary"}
              >
                {aiEnhancement.riskLevel} industry risk
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{aiEnhancement.overallAssessment}</p>
            <div>
              <h4 className="font-medium mb-2">Strategic Recommendations</h4>
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
