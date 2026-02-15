import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Moon, 
  Sun, 
  Stars, 
  Hash, 
  Lock, 
  Sparkles, 
  Gift,
  Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CosmicService {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  description: string;
  icon: typeof Moon;
  price: number;
  readingType: string;
  gradient: string;
  iconColor: string;
}

const COSMIC_SERVICES: CosmicService[] = [
  {
    id: "vedic",
    title: "Vedic Astrology",
    emoji: "🕉️",
    subtitle: "Full Kundli analysis with Dasha periods",
    description: "Full Kundli analysis with Dasha periods",
    icon: Moon,
    price: 2900,
    readingType: "vedic",
    gradient: "from-indigo-500/10 via-purple-500/5 to-background",
    iconColor: "text-indigo-500",
  },
  {
    id: "western",
    title: "Western Astrology",
    emoji: "♈",
    subtitle: "Birth Chart with planetary transits",
    description: "Birth Chart with planetary transits",
    icon: Sun,
    price: 1900,
    readingType: "western",
    gradient: "from-amber-500/10 via-orange-500/5 to-background",
    iconColor: "text-amber-500",
  },
  {
    id: "chinese",
    title: "Chinese Astrology",
    emoji: "🐉",
    subtitle: "BaZi Reading — Four Pillars of Destiny",
    description: "BaZi Reading — Four Pillars of Destiny",
    icon: Stars,
    price: 1900,
    readingType: "chinese",
    gradient: "from-red-500/10 via-rose-500/5 to-background",
    iconColor: "text-red-500",
  },
  {
    id: "numerology",
    title: "Numerology",
    emoji: "🔢",
    subtitle: "Life Path, Expression, Soul Urge",
    description: "Life Path, Expression, Soul Urge",
    icon: Hash,
    price: 900,
    readingType: "numerology",
    gradient: "from-emerald-500/10 via-teal-500/5 to-background",
    iconColor: "text-emerald-500",
  },
];

const BUNDLE_PRICE = 5900;
const BUNDLE_SAVINGS = 2700;

export function CosmicInsightsSection() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const hasDOB = !!profile?.date_of_birth;

  return (
    <section>
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Cosmic Insights</h2>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
            Premium
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Blend ancient wisdom with modern decision intelligence
        </p>
      </div>

      {/* DOB warning banner */}
      {!hasDOB && (
        <Card className="mb-4 border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Date of birth required</p>
              <p className="text-xs text-muted-foreground">
                Add your birth details in Settings to unlock mystical services.
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate("/settings")}
              className="flex-shrink-0"
            >
              Add DOB
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cosmic Profile Summary */}
      {hasDOB && (profile?.zodiac_western || profile?.zodiac_chinese || profile?.zodiac_vedic) && (
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 via-violet-500/5 to-background overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Your Cosmic Profile</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {profile.zodiac_western && (
                <CosmicProfileItem label="Western" value={profile.zodiac_western} icon={Sun} />
              )}
              {profile.zodiac_chinese && (
                <CosmicProfileItem label="Chinese" value={profile.zodiac_chinese} icon={Stars} />
              )}
              {profile.zodiac_vedic && (
                <CosmicProfileItem label="Vedic" value={profile.zodiac_vedic} icon={Moon} />
              )}
              {profile.life_path_number && (
                <CosmicProfileItem label="Life Path" value={`#${profile.life_path_number}`} icon={Hash} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {COSMIC_SERVICES.slice(0, 3).map((service) => (
          <CosmicServiceCard 
            key={service.id} 
            service={service} 
            locked={!hasDOB}
          />
        ))}
      </div>

      {/* Bottom Row: Numerology + Cosmic Bundle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Numerology Card */}
        <CosmicServiceCard 
          service={COSMIC_SERVICES[3]} 
          locked={!hasDOB}
        />

        {/* Cosmic Bundle Card */}
        <Card className={cn(
          "overflow-hidden transition-all hover:shadow-md border-primary/30",
          !hasDOB && "opacity-60"
        )}>
          <CardContent className="p-0">
            <div className="p-5 bg-gradient-to-br from-primary/10 via-violet-500/8 to-amber-500/5 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background/80 shadow-sm">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground">
                    ${(BUNDLE_PRICE / 100).toFixed(0)}
                  </span>
                  <p className="text-[10px] font-medium text-primary">
                    Save ${(BUNDLE_SAVINGS / 100).toFixed(0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🎁</span>
                <h3 className="text-sm font-semibold text-foreground">Cosmic Bundle</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                All 4 readings + Monthly updates for 1 year
              </p>
              <Button 
                size="sm" 
                variant={!hasDOB ? "outline" : "default"}
                className="w-full gap-2"
                disabled={!hasDOB}
              >
                {!hasDOB ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Requires DOB
                  </>
                ) : (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    Get Bundle
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function CosmicProfileItem({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  icon: typeof Moon;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60">
      <Icon className="w-4 h-4 text-primary/60" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function CosmicServiceCard({ 
  service, 
  locked 
}: { 
  service: CosmicService; 
  locked: boolean;
}) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md border-border/50",
      locked && "opacity-60"
    )}>
      <CardContent className="p-0">
        <div className={cn("p-5 bg-gradient-to-br h-full flex flex-col", service.gradient)}>
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-background/80 shadow-sm"
            )}>
              <service.icon className={cn("w-5 h-5", service.iconColor)} />
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">
                ${(service.price / 100).toFixed(0)}
              </span>
              <p className="text-[10px] text-muted-foreground">one-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{service.emoji}</span>
            <h3 className="text-sm font-semibold text-foreground">{service.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
            {service.subtitle}
          </p>
          <Button 
            size="sm" 
            variant={locked ? "outline" : "default"}
            className="w-full gap-2"
            disabled={locked}
          >
            {locked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                Requires DOB
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Get Reading
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
