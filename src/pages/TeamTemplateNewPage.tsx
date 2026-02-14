import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useCreateTemplate, useTemplateById } from "@/hooks/useDecisionTemplates";
import type { Team } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DEPARTMENTS } from "@/lib/departments";
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface InputField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

interface BlindSpot {
  spot: string;
  category: string;
  prompt: string;
}

interface FailureMode {
  mode: string;
  mechanism: string;
  likelihood_factors: string[];
}

export default function TeamTemplateNewPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from");
  const { data: sourceTemplate } = useTemplateById(fromId || undefined);
  const createTemplate = useCreateTemplate(team?.id);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState<string>("strategy");
  const [description, setDescription] = useState("");
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [blindSpots, setBlindSpots] = useState<BlindSpot[]>([]);
  const [failureModes, setFailureModes] = useState<FailureMode[]>([]);

  // Pre-fill from source template
  useEffect(() => {
    if (sourceTemplate) {
      setName(`${sourceTemplate.name} (Custom)`);
      setDepartment(sourceTemplate.department);
      setDescription(sourceTemplate.description || "");
      setInputFields(sourceTemplate.input_fields || []);
      setBlindSpots(sourceTemplate.blind_spot_library || []);
      setFailureModes(sourceTemplate.failure_mode_library || []);
    }
  }, [sourceTemplate]);

  const addInputField = () => {
    setInputFields(prev => [...prev, { name: "", type: "text", label: "", required: false }]);
  };

  const updateInputField = (i: number, updates: Partial<InputField>) => {
    setInputFields(prev => prev.map((f, idx) => idx === i ? { ...f, ...updates } : f));
  };

  const removeInputField = (i: number) => setInputFields(prev => prev.filter((_, idx) => idx !== i));

  const addBlindSpot = () => {
    setBlindSpots(prev => [...prev, { spot: "", category: "strategic", prompt: "" }]);
  };

  const updateBlindSpot = (i: number, updates: Partial<BlindSpot>) => {
    setBlindSpots(prev => prev.map((s, idx) => idx === i ? { ...s, ...updates } : s));
  };

  const removeBlindSpot = (i: number) => setBlindSpots(prev => prev.filter((_, idx) => idx !== i));

  const addFailureMode = () => {
    setFailureModes(prev => [...prev, { mode: "", mechanism: "", likelihood_factors: [] }]);
  };

  const updateFailureMode = (i: number, updates: Partial<FailureMode>) => {
    setFailureModes(prev => prev.map((m, idx) => idx === i ? { ...m, ...updates } : m));
  };

  const removeFailureMode = (i: number) => setFailureModes(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Template name is required"); return; }

    try {
      const result = await createTemplate.mutateAsync({
        name: name.trim(),
        department,
        description: description.trim(),
        input_fields: inputFields.filter(f => f.label.trim()),
        blind_spot_library: blindSpots.filter(s => s.spot.trim()),
        failure_mode_library: failureModes.filter(m => m.mode.trim()),
      });
      toast.success("Template created");
      navigate(`/team/${team.slug}/templates`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create template");
    }
  };

  const isBusinessTier = team?.subscription_tier === "business" || team?.subscription_tier === "enterprise";

  if (!isBusinessTier) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center py-16">
        <h2 className="text-lg font-semibold text-foreground mb-2">Business Tier Required</h2>
        <p className="text-sm text-muted-foreground">Custom templates are available on the Business plan.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/team/${team.slug}/templates`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Templates
      </button>

      <h1 className="text-2xl font-bold text-foreground">
        {fromId ? "Customize Template" : "Create Template"}
      </h1>

      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Template name" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What kind of decisions is this for?" rows={2} className="resize-none" />
          </div>
        </CardContent>
      </Card>

      {/* Input Fields Builder */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Input Fields ({inputFields.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={addInputField} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {inputFields.map((field, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex gap-2">
                <Input
                  value={field.label}
                  onChange={e => updateInputField(i, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="Field label"
                  className="flex-1"
                />
                <Select value={field.type} onValueChange={v => updateInputField(i, { type: v })}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["text", "number", "select", "date", "slider", "boolean"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1.5">
                  <Switch checked={field.required} onCheckedChange={v => updateInputField(i, { required: v })} />
                  <span className="text-[10px] text-muted-foreground">Req</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeInputField(i)} className="h-9 w-9 p-0">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
          {inputFields.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No input fields yet. Add fields to customize the decision form.</p>
          )}
        </CardContent>
      </Card>

      {/* Blind Spots */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Blind Spots ({blindSpots.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={addBlindSpot} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {blindSpots.map((spot, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex gap-2">
                <Input value={spot.spot} onChange={e => updateBlindSpot(i, { spot: e.target.value })} placeholder="Blind spot name" className="flex-1" />
                <Select value={spot.category} onValueChange={v => updateBlindSpot(i, { category: v })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["strategic", "operational", "financial", "political"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => removeBlindSpot(i)} className="h-9 w-9 p-0">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              <Textarea
                value={spot.prompt}
                onChange={e => updateBlindSpot(i, { prompt: e.target.value })}
                placeholder="Evaluation prompt..."
                rows={2}
                className="resize-none text-xs"
              />
            </div>
          ))}
          {blindSpots.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No blind spots. Add domain-specific areas to evaluate.</p>
          )}
        </CardContent>
      </Card>

      {/* Failure Modes */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Failure Modes ({failureModes.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={addFailureMode} className="h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {failureModes.map((mode, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex gap-2">
                <Input value={mode.mode} onChange={e => updateFailureMode(i, { mode: e.target.value })} placeholder="Failure mode name" className="flex-1" />
                <Button size="sm" variant="ghost" onClick={() => removeFailureMode(i)} className="h-9 w-9 p-0">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              <Textarea
                value={mode.mechanism}
                onChange={e => updateFailureMode(i, { mechanism: e.target.value })}
                placeholder="How this failure happens..."
                rows={2}
                className="resize-none text-xs"
              />
              <Input
                value={mode.likelihood_factors.join(", ")}
                onChange={e => updateFailureMode(i, { likelihood_factors: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="Likelihood factors (comma separated)"
                className="text-xs"
              />
            </div>
          ))}
          {failureModes.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No failure modes. Add common ways this type of decision goes wrong.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 pb-8">
        <Button onClick={handleSave} disabled={createTemplate.isPending || !name.trim()} className="flex-1">
          <Save className="w-4 h-4 mr-1" /> {createTemplate.isPending ? "Saving..." : "Save Template"}
        </Button>
        <Button variant="outline" onClick={() => navigate(`/team/${team.slug}/templates`)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
