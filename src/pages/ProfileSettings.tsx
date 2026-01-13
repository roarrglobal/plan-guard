import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, ProfileUpdates } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FOCUS_AREAS = [
  { id: "career", label: "Career" },
  { id: "business", label: "Business" },
  { id: "investment", label: "Investment" },
  { id: "personal", label: "Personal" },
  { id: "travel", label: "Travel" },
  { id: "other", label: "Other" },
];

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, updateProfile, refreshProfile, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Privacy settings
  const [visibility, setVisibility] = useState("private");
  const [showSnags, setShowSnags] = useState(false);
  const [allowConnections, setAllowConnections] = useState(false);
  const [discoverable, setDiscoverable] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setRole(profile.role || "");
      setFocusAreas(profile.focus_areas || []);
      setLocation(profile.location || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setAvatarUrl(profile.avatar_url);
      setVisibility(profile.visibility || "private");
      setShowSnags(profile.show_snags || false);
      setAllowConnections(profile.allow_connections || false);
      setDiscoverable(profile.discoverable || false);
    }
  }, [user, profile, authLoading, navigate]);

  const handleFocusAreaToggle = (areaId: string) => {
    setFocusAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((a) => a !== areaId)
        : [...prev, areaId]
    );
  };

  const validateLinkedIn = (url: string) => {
    if (!url) return true;
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/i;
    return linkedinRegex.test(url);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });

      toast({
        title: "Photo updated",
        description: "Your profile photo has been uploaded.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter your display name.",
        variant: "destructive",
      });
      return;
    }

    if (linkedinUrl && !validateLinkedIn(linkedinUrl)) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const updates: ProfileUpdates = {
      display_name: displayName.trim().slice(0, 50),
      bio: bio.trim().slice(0, 160) || null,
      role: role.trim() || null,
      focus_areas: focusAreas,
      location: location.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      visibility,
      show_snags: showSnags,
      allow_connections: allowConnections,
      discoverable,
    };

    const { error } = await updateProfile(updates);

    if (error) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile saved",
        description: "Your changes have been saved.",
      });
      await refreshProfile();
    }

    setIsSaving(false);
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const name = displayName || user?.email?.split("@")[0] || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color from name
  const getAvatarColor = () => {
    const name = displayName || user?.email || "";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#0047AB", "#059669", "#7C3AED", "#D97706", "#BE3455", "#0891B2"];
    return colors[Math.abs(hash) % colors.length];
  };

  if (authLoading) {
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
            onClick={() => navigate("/settings")}
            className="p-2 -ml-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[18px] font-semibold text-[#1A1A1A]">Profile</span>
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-[600px] mx-auto w-full">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div
                className="w-[120px] h-[120px] rounded-full flex items-center justify-center text-white text-[32px] font-semibold border-4 border-white shadow-lg"
                style={{ backgroundColor: getAvatarColor() }}
              >
                {getInitials()}
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            >
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <p className="text-[13px] text-[#666666] mt-2">
            JPG or PNG, max 5MB
          </p>
        </div>

        {/* Profile Fields */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#999999] uppercase tracking-wide">
              Basic Info
            </h2>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-[14px] font-medium">
                Display Name <span className="text-[#D64045]">*</span>
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                placeholder="Your name"
                maxLength={50}
                className="bg-[#F8F8F8] border-[#E5E5E5]"
              />
              <p className="text-[12px] text-[#999999]">{displayName.length}/50</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[14px] font-medium">
                Bio / Tagline
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                placeholder="What kind of decisions do you make?"
                maxLength={160}
                rows={2}
                className="bg-[#F8F8F8] border-[#E5E5E5] resize-none"
              />
              <p className="text-[12px] text-[#999999]">{bio.length}/160</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-[14px] font-medium">
                Professional Role
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Product Manager, Founder, Consultant"
                className="bg-[#F8F8F8] border-[#E5E5E5]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[14px] font-medium">
                Decision Focus Areas
              </Label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleFocusAreaToggle(area.id)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                      focusAreas.includes(area.id)
                        ? "bg-[#0047AB] text-white"
                        : "bg-[#F2F2F2] text-[#666666] hover:bg-[#E5E5E5]"
                    }`}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-[14px] font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="bg-[#F8F8F8] border-[#E5E5E5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-[14px] font-medium">
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="bg-[#F8F8F8] border-[#E5E5E5]"
              />
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#999999] uppercase tracking-wide">
              Privacy Settings
            </h2>

            <div className="space-y-2">
              <Label className="text-[14px] font-medium">Profile Visibility</Label>
              <div className="flex gap-2">
                {[
                  { id: "private", label: "Private" },
                  { id: "network", label: "Network" },
                  { id: "public", label: "Public" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setVisibility(option.id)}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      visibility === option.id
                        ? "bg-[#0047AB] text-white"
                        : "bg-[#F2F2F2] text-[#666666] hover:bg-[#E5E5E5]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-[12px] text-[#999999]">
                {visibility === "private" && "Only you can see your profile"}
                {visibility === "network" && "Only your connections can see your profile"}
                {visibility === "public" && "Anyone can see your profile"}
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[14px] font-medium">Show snags on profile</Label>
                <p className="text-[12px] text-[#999999]">Display recent analyses</p>
              </div>
              <Switch
                checked={showSnags}
                onCheckedChange={setShowSnags}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[14px] font-medium">Allow connection requests</Label>
                <p className="text-[12px] text-[#999999]">Others can request to connect</p>
              </div>
              <Switch
                checked={allowConnections}
                onCheckedChange={setAllowConnections}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-[14px] font-medium">Appear in directory</Label>
                <p className="text-[12px] text-[#999999]">Discoverable in network search</p>
              </div>
              <Switch
                checked={discoverable}
                onCheckedChange={setDiscoverable}
              />
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-8 pb-8">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#0047AB] text-white py-3 rounded-xl text-[15px] font-medium hover:bg-[#003A8C] min-h-[48px]"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
