import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  PenLine,
  Heart,
  Sparkles,
  Sun,
  Moon,
  FileText,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type EntryType = "free_write" | "gratitude" | "manifestation" | "reflection" | "morning" | "evening";
type Mood = "great" | "good" | "okay" | "low" | "difficult";

const ENTRY_TYPE_OPTIONS = [
  { id: "free_write" as EntryType, label: "Free Write", icon: PenLine, description: "Open space for your thoughts" },
  { id: "gratitude" as EntryType, label: "Gratitude", icon: Heart, description: "What are you thankful for?" },
  { id: "manifestation" as EntryType, label: "Manifestation", icon: Sparkles, description: "What are you calling in?" },
  { id: "reflection" as EntryType, label: "Reflection", icon: FileText, description: "Review and learn" },
  { id: "morning" as EntryType, label: "Morning Pages", icon: Sun, description: "Start your day with clarity" },
  { id: "evening" as EntryType, label: "Evening Review", icon: Moon, description: "Close your day with intention" },
];

const MOOD_OPTIONS: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: "great", emoji: "😄", label: "Great", color: "#10B981" },
  { id: "good", emoji: "🙂", label: "Good", color: "#34D399" },
  { id: "okay", emoji: "😐", label: "Okay", color: "#FBBF24" },
  { id: "low", emoji: "😔", label: "Low", color: "#F97316" },
  { id: "difficult", emoji: "😢", label: "Difficult", color: "#EF4444" },
];

const MANIFESTATION_CATEGORIES = [
  "Career & Purpose",
  "Health & Vitality",
  "Relationships & Love",
  "Wealth & Abundance",
  "Personal Growth",
  "Creativity",
  "Other",
];

export default function JournalNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"type" | "mood" | "write">("type");
  const [entryType, setEntryType] = useState<EntryType | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form data
  const [freeWriteContent, setFreeWriteContent] = useState("");
  const [gratitudeData, setGratitudeData] = useState({
    gratitude_1: "",
    gratitude_1_why: "",
    gratitude_2: "",
    gratitude_2_why: "",
    gratitude_3: "",
    gratitude_3_why: "",
    person: "",
    appreciation_action: "",
  });
  const [manifestationData, setManifestationData] = useState({
    category: "",
    vision: "",
    affirmations: [""],
    daily_action: "",
    success_indicator: "",
  });
  const [morningData, setMorningData] = useState({
    sleep_rating: 3,
    sleep_notes: "",
    intention: "",
    looking_forward_to: "",
    nervous_about: "",
    letting_go_of: "",
    additional_thoughts: "",
  });
  const [eveningData, setEveningData] = useState({
    day_rating: 3,
    went_well: "",
    could_be_better: "",
    learned: "",
    tomorrow_will: "",
    gratitude: "",
  });

  const handleTypeSelect = (type: EntryType) => {
    setEntryType(type);
    setStep("mood");
  };

  const handleMoodSelect = (selectedMood: Mood | null) => {
    setMood(selectedMood);
    setStep("write");
  };

  const calculateWordCount = (): number => {
    let text = "";
    switch (entryType) {
      case "free_write":
      case "reflection":
        text = freeWriteContent;
        break;
      case "gratitude":
        text = Object.values(gratitudeData).join(" ");
        break;
      case "manifestation":
        text = [
          manifestationData.vision,
          ...manifestationData.affirmations,
          manifestationData.daily_action,
          manifestationData.success_indicator,
        ].join(" ");
        break;
      case "morning":
        text = Object.values(morningData).filter(v => typeof v === "string").join(" ");
        break;
      case "evening":
        text = Object.values(eveningData).join(" ");
        break;
    }
    return text.split(/\s+/).filter(Boolean).length;
  };

  const getContent = (): Record<string, unknown> => {
    switch (entryType) {
      case "free_write":
      case "reflection":
        return { text: freeWriteContent };
      case "gratitude":
        return gratitudeData;
      case "manifestation":
        return manifestationData;
      case "morning":
        return morningData;
      case "evening":
        return eveningData;
      default:
        return {};
    }
  };

  const handleSave = async () => {
    if (!user || !entryType) return;

    setIsSaving(true);
    
    const { error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        entry_type: entryType,
        mood,
        content: getContent(),
        word_count: calculateWordCount(),
      });

    if (error) {
      toast({
        title: "Error saving entry",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved.",
      });
      navigate("/journal");
    }

    setIsSaving(false);
  };

  const renderWriteStep = () => {
    switch (entryType) {
      case "free_write":
      case "reflection":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                {entryType === "reflection" ? "What's on your mind?" : "Write freely..."}
              </Label>
              <Textarea
                value={freeWriteContent}
                onChange={(e) => setFreeWriteContent(e.target.value)}
                placeholder="Let your thoughts flow..."
                className="mt-2 min-h-[300px] bg-white"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {calculateWordCount()} words
              </p>
            </div>
          </div>
        );

      case "gratitude":
        return (
          <div className="space-y-6">
            <p className="text-sm font-medium text-foreground">
              Three things I'm grateful for today:
            </p>
            {[1, 2, 3].map((num) => (
              <div key={num} className="space-y-2">
                <Input
                  value={gratitudeData[`gratitude_${num}` as keyof typeof gratitudeData]}
                  onChange={(e) => setGratitudeData(prev => ({
                    ...prev,
                    [`gratitude_${num}`]: e.target.value
                  }))}
                  placeholder={`${num}. I'm grateful for...`}
                  className="bg-white"
                />
                <Input
                  value={gratitudeData[`gratitude_${num}_why` as keyof typeof gratitudeData]}
                  onChange={(e) => setGratitudeData(prev => ({
                    ...prev,
                    [`gratitude_${num}_why`]: e.target.value
                  }))}
                  placeholder="Why does this matter to me?"
                  className="bg-white text-sm"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>One person I appreciate:</Label>
              <Input
                value={gratitudeData.person}
                onChange={(e) => setGratitudeData(prev => ({ ...prev, person: e.target.value }))}
                placeholder="Name or describe this person..."
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>I could show appreciation by:</Label>
              <Input
                value={gratitudeData.appreciation_action}
                onChange={(e) => setGratitudeData(prev => ({ ...prev, appreciation_action: e.target.value }))}
                placeholder="A specific action I could take..."
                className="bg-white"
              />
            </div>
          </div>
        );

      case "manifestation":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>What I'm calling into my life:</Label>
              <div className="flex flex-wrap gap-2">
                {MANIFESTATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setManifestationData(prev => ({ ...prev, category: cat }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      manifestationData.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Describe your vision as if it's already true:</Label>
              <p className="text-xs text-muted-foreground">
                Write in present tense. Be specific. Feel it.
              </p>
              <Textarea
                value={manifestationData.vision}
                onChange={(e) => setManifestationData(prev => ({ ...prev, vision: e.target.value }))}
                placeholder="I am living in..."
                className="bg-white min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>"I am..." Affirmations:</Label>
              {manifestationData.affirmations.map((aff, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={aff}
                    onChange={(e) => {
                      const newAff = [...manifestationData.affirmations];
                      newAff[idx] = e.target.value;
                      setManifestationData(prev => ({ ...prev, affirmations: newAff }));
                    }}
                    placeholder="I am..."
                    className="bg-white"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManifestationData(prev => ({
                  ...prev,
                  affirmations: [...prev.affirmations, ""]
                }))}
              >
                + Add another
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Daily action toward this:</Label>
              <Input
                value={manifestationData.daily_action}
                onChange={(e) => setManifestationData(prev => ({ ...prev, daily_action: e.target.value }))}
                placeholder="One small step I can take today..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>I will know I've achieved this when:</Label>
              <Input
                value={manifestationData.success_indicator}
                onChange={(e) => setManifestationData(prev => ({ ...prev, success_indicator: e.target.value }))}
                placeholder="The specific sign that this is real..."
                className="bg-white"
              />
            </div>
          </div>
        );

      case "morning":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>How did I sleep?</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMorningData(prev => ({ ...prev, sleep_rating: rating }))}
                    className={cn(
                      "w-10 h-10 rounded-full font-medium transition-colors",
                      morningData.sleep_rating === rating
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <Input
                value={morningData.sleep_notes}
                onChange={(e) => setMorningData(prev => ({ ...prev, sleep_notes: e.target.value }))}
                placeholder="Notes about my sleep..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>My intention for today:</Label>
              <Input
                value={morningData.intention}
                onChange={(e) => setMorningData(prev => ({ ...prev, intention: e.target.value }))}
                placeholder="Today I will focus on..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>I'm looking forward to:</Label>
              <Input
                value={morningData.looking_forward_to}
                onChange={(e) => setMorningData(prev => ({ ...prev, looking_forward_to: e.target.value }))}
                placeholder="Something that excites me..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>I'm nervous about:</Label>
              <Input
                value={morningData.nervous_about}
                onChange={(e) => setMorningData(prev => ({ ...prev, nervous_about: e.target.value }))}
                placeholder="Something on my mind..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Today I will let go of:</Label>
              <Input
                value={morningData.letting_go_of}
                onChange={(e) => setMorningData(prev => ({ ...prev, letting_go_of: e.target.value }))}
                placeholder="Something I'm releasing..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Additional thoughts:</Label>
              <Textarea
                value={morningData.additional_thoughts}
                onChange={(e) => setMorningData(prev => ({ ...prev, additional_thoughts: e.target.value }))}
                placeholder="Anything else on my mind..."
                className="bg-white min-h-[100px]"
              />
            </div>
          </div>
        );

      case "evening":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Rate your day:</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setEveningData(prev => ({ ...prev, day_rating: rating }))}
                    className={cn(
                      "w-10 h-10 rounded-full font-medium transition-colors flex items-center justify-center",
                      eveningData.day_rating === rating
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {"⭐".repeat(rating > 3 ? 1 : 0) || rating}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>What went well today?</Label>
              <Textarea
                value={eveningData.went_well}
                onChange={(e) => setEveningData(prev => ({ ...prev, went_well: e.target.value }))}
                placeholder="Celebrate your wins..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>What could have gone better?</Label>
              <Textarea
                value={eveningData.could_be_better}
                onChange={(e) => setEveningData(prev => ({ ...prev, could_be_better: e.target.value }))}
                placeholder="Be honest with yourself..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>What did I learn?</Label>
              <Input
                value={eveningData.learned}
                onChange={(e) => setEveningData(prev => ({ ...prev, learned: e.target.value }))}
                placeholder="A lesson from today..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>Tomorrow I will:</Label>
              <Input
                value={eveningData.tomorrow_will}
                onChange={(e) => setEveningData(prev => ({ ...prev, tomorrow_will: e.target.value }))}
                placeholder="Set an intention..."
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label>One thing from today I'm thankful for:</Label>
              <Input
                value={eveningData.gratitude}
                onChange={(e) => setEveningData(prev => ({ ...prev, gratitude: e.target.value }))}
                placeholder="End with gratitude..."
                className="bg-white"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === "write") setStep("mood");
              else if (step === "mood") setStep("type");
              else navigate("/journal");
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            {step === "type" && "New Journal Entry"}
            {step === "mood" && "How are you feeling?"}
            {step === "write" && ENTRY_TYPE_OPTIONS.find(t => t.id === entryType)?.label}
          </h1>
        </div>

        {/* Step 1: Entry Type Selection */}
        {step === "type" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">What would you like to write?</p>
            <div className="grid gap-3">
              {ENTRY_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleTypeSelect(option.id)}
                    className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Mood Selection */}
        {step === "mood" && (
          <div className="space-y-6">
            <p className="text-muted-foreground">How are you feeling right now?</p>
            <div className="flex justify-center gap-4">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleMoodSelect(option.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                    mood === option.id
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-white hover:bg-muted"
                  )}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: option.color }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => handleMoodSelect(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Write Entry */}
        {step === "write" && (
          <div>
            {/* Mood indicator */}
            {mood && (
              <div className="flex items-center gap-2 mb-6 p-3 bg-white rounded-lg border border-border">
                <span className="text-lg">{MOOD_OPTIONS.find(m => m.id === mood)?.emoji}</span>
                <span className="text-sm text-muted-foreground">
                  Feeling {mood}
                </span>
              </div>
            )}

            {renderWriteStep()}

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Save Entry
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
