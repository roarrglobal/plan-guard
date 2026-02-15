import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Heart, Target, Star, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HOBBY_OPTIONS,
  LIFE_GOALS,
  getZodiacWestern,
  getChineseZodiac,
  getVedicZodiac,
  getLifePathNumber,
} from "@/components/onboarding/IndividualProfileWizard";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PersonalDetailsSection() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // DOB fields
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [birthAmPm, setBirthAmPm] = useState("AM");
  const [birthPlace, setBirthPlace] = useState("");

  // Hobbies
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState("");

  // Life goals
  const [lifeGoals, setLifeGoals] = useState<string[]>([]);

  // Populate from profile
  useEffect(() => {
    if (!profile) return;

    if (profile.date_of_birth) {
      const [y, m, d] = profile.date_of_birth.split("-");
      setBirthYear(y);
      setBirthMonth(MONTHS[parseInt(m) - 1] || "");
      setBirthDay(String(parseInt(d)));
    }

    if (profile.birth_time) {
      const [hStr, mStr] = profile.birth_time.split(":");
      let h = parseInt(hStr);
      const ampm = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      setBirthHour(String(h));
      setBirthMinute(mStr);
      setBirthAmPm(ampm);
    }

    setBirthPlace(profile.birth_place || "");
    setHobbies(profile.hobbies || []);
    setLifeGoals(profile.life_goals || []);
  }, [profile]);

  const toggleHobby = (hobby: string) => {
    setHobbies(prev => prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]);
  };

  const addCustomHobby = () => {
    const trimmed = customHobby.trim();
    if (trimmed && !hobbies.includes(trimmed)) {
      setHobbies(prev => [...prev, trimmed]);
      setCustomHobby("");
    }
  };

  const toggleGoal = (goal: string) => {
    setLifeGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const updates: Record<string, unknown> = {
        hobbies,
        life_goals: lifeGoals,
        birth_place: birthPlace || null,
      };

      if (birthMonth && birthDay && birthYear) {
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

      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;

      await refreshProfile();
      toast({ title: "Personal details saved" });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
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
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Personal Details
      </h2>

      <div className="analysis-card p-5 space-y-6">
        {/* Birth Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Date of Birth</Label>
          </div>
          <div className="grid grid-cols-3 gap-2">
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

        {/* Birth Time */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Time of Birth <span className="text-muted-foreground font-normal">(optional)</span></Label>
          </div>
          <div className="grid grid-cols-3 gap-2">
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

        {/* Birth Place */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Birth Place <span className="text-muted-foreground font-normal">(optional)</span></Label>
          </div>
          <Input value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="City, Country" />
        </div>

        {/* Calculated Zodiacs - Read only display */}
        {profile?.date_of_birth && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Your Cosmic Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Western Zodiac</p>
                <p className="font-medium text-foreground">{profile.zodiac_western || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Chinese Zodiac</p>
                <p className="font-medium text-foreground">{profile.zodiac_chinese || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Vedic Moon Sign</p>
                <p className="font-medium text-foreground">{profile.zodiac_vedic || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Life Path Number</p>
                <p className="font-medium text-foreground">{profile.life_path_number || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hobbies */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Hobbies & Interests</Label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {HOBBY_OPTIONS.map(h => (
              <button
                key={h.label}
                onClick={() => toggleHobby(h.label)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  hobbies.includes(h.label)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                )}
              >
                {h.emoji} {h.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customHobby}
              onChange={e => setCustomHobby(e.target.value)}
              placeholder="Add custom..."
              className="text-sm"
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomHobby())}
            />
            <Button variant="outline" size="sm" onClick={addCustomHobby} disabled={!customHobby.trim()}>Add</Button>
          </div>
          {hobbies.filter(h => !HOBBY_OPTIONS.find(o => o.label === h)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hobbies.filter(h => !HOBBY_OPTIONS.find(o => o.label === h)).map(h => (
                <span key={h} className="px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground cursor-pointer" onClick={() => toggleHobby(h)}>
                  {h} ×
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Life Focus */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Life Focus</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {LIFE_GOALS.map(goal => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  lifeGoals.includes(goal)
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-foreground hover:border-primary/30"
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Personal Details"}
        </Button>
      </div>
    </section>
  );
}
