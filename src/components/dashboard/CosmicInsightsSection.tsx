import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Moon, 
  Sun, 
  Stars, 
  Hash, 
  Lock, 
  Sparkles, 
  ChevronRight,
  Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CosmicService {
  id: string;
  title: string;
  description: string;
  icon: typeof Moon;
  price: number;
  readingType: string;
  gradient: string;
  iconColor: string;
  requiresDOB: boolean;
}

const COSMIC_SERVICES: CosmicService[] = [
  {
    id: "vedic",
    title: "Vedic Moon Reading",
    description: "Discover your Nakshatra and how lunar energy shapes your decision patterns.",
    icon: Moon,
    price: 499,
    readingType: "vedic",
    gradient: "from-indigo-500/10 via-purple-500/5 to-background",
    iconColor: "text-indigo-500",
    requiresDOB: true,
  },
  {
    id: "western",
    title: "Western Zodiac Deep Dive",
    description: "Full natal chart analysis with decision-making strengths and blind spots.",
    icon: Sun,
    price: 499,
    readingType: "western",
    gradient: "from-amber-500/10 via-orange-500/5 to-background",
    iconColor: "text-amber-500",
    requiresDOB: true,
  },
  {
    id: "chinese",
    title: "Chinese Astrology Profile",
    description: "Your element, animal sign, and how they influence your risk tolerance.",
    icon: Stars,
    price: 399,
    readingType: "chinese",
    gradient: "from-red-500/10 via-rose-500/5 to-background",
    iconColor: "text-red-500",
    requiresDOB: true,
  },
  {
    id: "numerology",
    title: "Numerology Life Map",
    description: "Life path number breakdown with personal year forecast and decision timing.",
    icon: Hash,
    price: 399,
    readingType: "numerology",
    gradient: "from-emerald-500/10 via-teal-500/5 to-background",
    iconColor: "text-emerald-500",
    requiresDOB: true,
  },
];

export function CosmicInsightsSection() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const hasDOB = !!profile?.date_of_birth;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Cosmic Insights</h2>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 text-primary">
            Premium
          </Badge>
        </div>
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

      {/* Cosmic Profile Summary (if DOB exists) */}
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

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COSMIC_SERVICES.map((service) => (
          <CosmicServiceCard 
            key={service.id} 
            service={service} 
            locked={!hasDOB}
          />
        ))}
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
  const Icon = service.icon;

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md group cursor-pointer border-border/50",
      locked && "opacity-60"
    )}>
      <CardContent className={cn("p-0")}>
        <div className={cn("p-5 bg-gradient-to-br", service.gradient)}>
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-background/80 shadow-sm"
            )}>
              <Icon className={cn("w-5 h-5", service.iconColor)} />
            </div>
            <span className="text-sm font-bold text-foreground">
              ${(service.price / 100).toFixed(2)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">{service.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {service.description}
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
