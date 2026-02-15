import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Check, Sparkles, Target, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export const HOBBY_OPTIONS = [
  { label: "Reading", emoji: "📚" },
  { label: "Travel", emoji: "✈️" },
  { label: "Fitness", emoji: "💪" },
  { label: "Music", emoji: "🎵" },
  { label: "Cooking", emoji: "🍳" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Art", emoji: "🎨" },
  { label: "Photography", emoji: "📷" },
  { label: "Sports", emoji: "⚽" },
  { label: "Meditation", emoji: "🧘" },
  { label: "Writing", emoji: "✍️" },
  { label: "Tech", emoji: "💻" },
  { label: "Nature", emoji: "🌿" },
  { label: "Movies", emoji: "🎬" },
  { label: "Fashion", emoji: "👗" },
  { label: "Finance", emoji: "💰" },
];

export const LIFE_GOALS = [
  "Career growth",
  "Starting a business",
  "Relationships",
  "Health & wellness",
  "Financial freedom",
  "Learning & education",
  "Travel & experiences",
  "Family & home",
  "Creative pursuits",
  "Spiritual growth",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function getZodiacWestern(month: number, day: number): string {
  const signs = [
    { sign: "Capricorn", end: [1, 19] },
    { sign: "Aquarius", end: [2, 18] },
    { sign: "Pisces", end: [3, 20] },
    { sign: "Aries", end: [4, 19] },
    { sign: "Taurus", end: [5, 20] },
    { sign: "Gemini", end: [6, 20] },
    { sign: "Cancer", end: [7, 22] },
    { sign: "Leo", end: [8, 22] },
    { sign: "Virgo", end: [9, 22] },
    { sign: "Libra", end: [10, 22] },
    { sign: "Scorpio", end: [11, 21] },
    { sign: "Sagittarius", end: [12, 21] },
    { sign: "Capricorn", end: [12, 31] },
  ];
  for (const s of signs) {
    if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return s.sign;
  }
  return "Capricorn";
}

export function getChineseZodiac(year: number): string {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  return animals[(year - 4) % 12];
}

export function getVedicZodiac(month: number, day: number): string {
  const signs = [
    { sign: "Makara (Capricorn)", end: [1, 14] },
    { sign: "Kumbha (Aquarius)", end: [2, 12] },
    { sign: "Meena (Pisces)", end: [3, 14] },
    { sign: "Mesha (Aries)", end: [4, 13] },
    { sign: "Vrishabha (Taurus)", end: [5, 14] },
    { sign: "Mithuna (Gemini)", end: [6, 14] },
    { sign: "Karka (Cancer)", end: [7, 16] },
    { sign: "Simha (Leo)", end: [8, 16] },
    { sign: "Kanya (Virgo)", end: [9, 16] },
    { sign: "Tula (Libra)", end: [10, 16] },
    { sign: "Vrishchika (Scorpio)", end: [11, 15] },
    { sign: "Dhanu (Sagittarius)", end: [12, 15] },
    { sign: "Makara (Capricorn)", end: [12, 31] },
  ];
  for (const s of signs) {
    if (month < s.end[0] || (month === s.end[0] && day <= s.end[1])) return s.sign;
  }
  return "Makara (Capricorn)";
}

export function getLifePathNumber(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

interface Props {
  onComplete: (skippedDob?: boolean) => void;
}

export function IndividualProfileWizard({ onComplete }: Props) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Birth details
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [birthAmPm, setBirthAmPm] = useState("AM");
  const [birthPlace, setBirthPlace] = useState("");

  // Step 2: Hobbies
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState("");

  // Step 3: Life goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Track if DOB was skipped
  const [dobSkipped, setDobSkipped] = useState(false);

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    );
  };

  const addCustomHobby = () => {
    const trimmed = customHobby.trim();
    if (trimmed && !selectedHobbies.includes(trimmed)) {
      setSelectedHobbies(prev => [...prev, trimmed]);
      setCustomHobby("");
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleSkipStep = () => {
    if (step === 1) {
      setDobSkipped(true);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      handleComplete(true);
    }
  };

  const handleComplete = async (isSkip = false) => {
    if (!user) return;
    setSaving(true);

    try {
      const updates: Record<string, unknown> = {
        profile_completed: true,
        hobbies: selectedHobbies,
        life_goals: selectedGoals,
      };

      const hasDob = birthMonth && birthDay && birthYear;

      if (hasDob) {
        const monthNum = MONTHS.indexOf(birthMonth) + 1;
        const dayNum = parseInt(birthDay);
        const yearNum = parseInt(birthYear);
        const dateStr = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        updates.date_of_birth = dateStr;
        updates.zodiac_western = getZodiacWestern(monthNum, dayNum);
        updates.zodiac_chinese = getChineseZodiac(yearNum);
        updates.zodiac_vedic = getVedicZodiac(monthNum, dayNum);
        updates.life_path_number = getLifePathNumber(dateStr);
      }

      if (birthHour && birthMinute) {
        let hour = parseInt(birthHour);
        if (birthAmPm === "PM" && hour !== 12) hour += 12;
        if (birthAmPm === "AM" && hour === 12) hour = 0;
        updates.birth_time = `${String(hour).padStart(2, "0")}:${birthMinute}:00`;
      }

      if (birthPlace) updates.birth_place = birthPlace;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      onComplete(dobSkipped || !hasDob);
    } catch (err: any) {
      toast({ title: "Error saving profile", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i - 10));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                s === step ? "bg-primary" : s < step ? "bg-primary/40" : "bg-border"
              )}
            />
          ))}
          <span className="text-caption text-muted-foreground ml-2">Step {step} of 3</span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {/* STEP 1: Birth Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-h3 font-bold text-foreground">Let's personalize your experience</h2>
                <p className="text-body-small text-muted-foreground mt-2">
                  Your birth details help us provide deeper insights into your decision-making patterns.
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Date of Birth *</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} className="input-field text-sm">
                    <option value="">Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={birthDay} onChange={e => setBirthDay(e.target.value)} className="input-field text-sm">
                    <option value="">Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={birthYear} onChange={e => setBirthYear(e.target.value)} className="input-field text-sm">
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Time of Birth <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <select value={birthHour} onChange={e => setBirthHour(e.target.value)} className="input-field text-sm">
                    <option value="">Hour</option>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={birthMinute} onChange={e => setBirthMinute(e.target.value)} className="input-field text-sm">
                    <option value="">Min</option>
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={birthAmPm} onChange={e => setBirthAmPm(e.target.value)} className="input-field text-sm">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Birth Place <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="City, Country" className="mt-1.5" />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!birthMonth || !birthDay || !birthYear}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* STEP 2: Hobbies & Interests */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-h3 font-bold text-foreground">What are you into?</h2>
                <p className="text-body-small text-muted-foreground mt-2">Select your hobbies (optional)</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map(h => (
                  <button
                    key={h.label}
                    onClick={() => toggleHobby(h.label)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      selectedHobbies.includes(h.label)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/40"
                    )}
                  >
                    {h.emoji} {h.label}
                  </button>
                ))}
              </div>

              <div>
                <Label className="text-sm font-medium">Or add your own</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={customHobby}
                    onChange={e => setCustomHobby(e.target.value)}
                    placeholder="Type and press Enter..."
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomHobby())}
                  />
                  <Button variant="outline" onClick={addCustomHobby} disabled={!customHobby.trim()}>Add</Button>
                </div>
                {selectedHobbies.filter(h => !HOBBY_OPTIONS.find(o => o.label === h)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedHobbies.filter(h => !HOBBY_OPTIONS.find(o => o.label === h)).map(h => (
                      <span key={h} className="px-2.5 py-1 rounded-full text-xs bg-primary text-primary-foreground cursor-pointer" onClick={() => toggleHobby(h)}>
                        {h} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Life Focus */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-h3 font-bold text-foreground">What matters most right now?</h2>
                <p className="text-body-small text-muted-foreground mt-2">Select your current life focus (optional)</p>
              </div>

              <div className="space-y-2">
                {LIFE_GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center gap-3",
                      selectedGoals.includes(goal)
                        ? "bg-primary/5 border-primary text-foreground"
                        : "bg-card border-border text-foreground hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                      selectedGoals.includes(goal) ? "bg-primary border-primary" : "border-border"
                    )}>
                      {selectedGoals.includes(goal) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium">{goal}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => handleComplete(false)}
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saving ? "Saving..." : "Complete"} {!saving && <Check className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        <p className="text-center mt-4">
          <button
            onClick={handleSkipStep}
            className="text-caption text-muted-foreground hover:text-foreground hover:underline"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
