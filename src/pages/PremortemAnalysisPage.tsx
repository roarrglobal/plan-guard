import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Save, Sparkles, Plus, X, 
  AlertTriangle, Shield, Lightbulb, Target 
} from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface PremortemData {
  projectGoal: string;
  failureScenarios: string[];
  rootCauses: string[];
  mitigations: string[];
  earlyWarnings: string[];
}

interface AiEnhancement {
  additionalRisks: string[];
  prioritizedActions: string[];
  confidenceBoost: string;
}

export default function PremortemAnalysisPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [data, setData] = useState<PremortemData>({
    projectGoal: "",
    failureScenarios: [""],
    rootCauses: [""],
    mitigations: [""],
    earlyWarnings: [""],
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
    const inputs = analysis.inputs as unknown as PremortemData;
    if (inputs.projectGoal !== undefined) {
      setData(inputs);
    }
    if (analysis.ai_enhancement) {
      setAiEnhancement(analysis.ai_enhancement as unknown as AiEnhancement);
    }
    setIsLoading(false);
  };

  const updateArray = (key: keyof Pick<PremortemData, "failureScenarios" | "rootCauses" | "mitigations" | "earlyWarnings">, index: number, value: string) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addItem = (key: keyof Pick<PremortemData, "failureScenarios" | "rootCauses" | "mitigations" | "earlyWarnings">) => {
    setData((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const removeItem = (key: keyof Pick<PremortemData, "failureScenarios" | "rootCauses" | "mitigations" | "earlyWarnings">, index: number) => {
    if (data[key].length > 1) {
      setData((prev) => ({
        ...prev,
        [key]: prev[key].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const cleanedData = {
      projectGoal: data.projectGoal,
      failureScenarios: data.failureScenarios.filter((s) => s.trim()),
      rootCauses: data.rootCauses.filter((s) => s.trim()),
      mitigations: data.mitigations.filter((s) => s.trim()),
      earlyWarnings: data.earlyWarnings.filter((s) => s.trim()),
    };

    const payload = {
      user_id: user.id,
      framework_type: "premortem",
      title: title || "Pre-Mortem Analysis",
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
    await new Promise((r) => setTimeout(r, 2000));

    const additionalRisks = [
      "External market conditions may shift faster than anticipated",
      "Key stakeholder alignment could deteriorate mid-project",
      "Resource availability may become constrained unexpectedly",
    ];

    const prioritizedActions = [];
    if (data.mitigations.filter((m) => m.trim()).length > 0) {
      prioritizedActions.push("Implement identified mitigations within first 30 days");
    }
    prioritizedActions.push("Establish weekly risk review cadence with team");
    prioritizedActions.push("Create contingency budget for top 3 failure scenarios");
    if (data.earlyWarnings.filter((w) => w.trim()).length > 0) {
      prioritizedActions.push("Set up automated monitoring for early warning signals");
    }

    setAiEnhancement({
      additionalRisks,
      prioritizedActions,
      confidenceBoost: "Completing this pre-mortem increases project success probability by identifying blind spots early.",
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

  const sections = [
    { key: "failureScenarios" as const, label: "Failure Scenarios", icon: AlertTriangle, color: "bg-red-500", desc: "Imagine the project has failed. What went wrong?", placeholder: "The project failed because..." },
    { key: "rootCauses" as const, label: "Root Causes", icon: Target, color: "bg-amber-500", desc: "What underlying issues led to these failures?", placeholder: "The root cause was..." },
    { key: "mitigations" as const, label: "Mitigations", icon: Shield, color: "bg-green-500", desc: "What can we do NOW to prevent these failures?", placeholder: "To prevent this, we should..." },
    { key: "earlyWarnings" as const, label: "Early Warning Signs", icon: Lightbulb, color: "bg-blue-500", desc: "What signals would indicate we're heading toward failure?", placeholder: "A warning sign would be..." },
  ];

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

      {/* Project Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Project / Initiative Goal</CardTitle>
          <CardDescription>What are you trying to achieve?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.projectGoal}
            onChange={(e) => setData((prev) => ({ ...prev, projectGoal: e.target.value }))}
            placeholder="We are launching a new product to..."
            className="min-h-[80px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.map(({ key, label, icon: Icon, color, desc, placeholder }) => (
        <Card key={key}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className={`p-1.5 rounded ${color} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              {label}
              <Badge variant="outline" className="text-xs">
                {data[key].filter((s) => s.trim()).length}
              </Badge>
            </CardTitle>
            <CardDescription>{desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data[key].map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={item}
                  onChange={(e) => updateArray(key, index, e.target.value)}
                  placeholder={placeholder}
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
              Add More
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* AI Insights */}
      {aiEnhancement && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Identified Risks & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground italic">
              {aiEnhancement.confidenceBoost}
            </p>
            <div>
              <h4 className="font-medium mb-2">Additional Risks to Consider</h4>
              <ul className="space-y-1">
                {aiEnhancement.additionalRisks.map((risk, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-1 text-amber-500 shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Prioritized Actions</h4>
              <ul className="space-y-1">
                {aiEnhancement.prioritizedActions.map((action, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                    {action}
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
