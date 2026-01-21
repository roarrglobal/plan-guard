import { User, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = "individual" | "business";

interface UserTypeSelectionProps {
  selectedType: UserType | null;
  onSelect: (type: UserType) => void;
}

const userTypeOptions = [
  {
    type: "individual" as const,
    icon: User,
    title: "For Myself",
    subtitle: "Personal decisions, career moves, life choices",
    bullets: [
      "Stress-test big decisions before you commit",
      "Track outcomes and learn your patterns",
      "Journal and reflect daily",
    ],
    buttonText: "Continue as Individual",
    accentClass: "border-crimson",
    buttonClass: "bg-crimson hover:bg-crimson/90",
  },
  {
    type: "business" as const,
    icon: Building2,
    title: "For My Team",
    subtitle: "Organizational decisions, team alignment, decision governance",
    bullets: [
      "Run pre-mortems on strategic decisions",
      "Build institutional decision memory",
      "Align teams before committing resources",
    ],
    buttonText: "Continue as Business",
    accentClass: "border-cobalt",
    buttonClass: "bg-cobalt hover:bg-cobalt/90",
  },
];

export function UserTypeSelection({ selectedType, onSelect }: UserTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center px-4 py-6">
        <div className="text-center">
          <h1 className="text-h2 font-bold text-foreground mb-2">How will you use Snag?</h1>
          <p className="text-body text-muted-foreground">This helps us personalize your experience</p>
        </div>
      </header>

      {/* Cards */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {userTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;

            return (
              <div
                key={option.type}
                onClick={() => onSelect(option.type)}
                className={cn(
                  "bg-card rounded-xl p-6 border-2 cursor-pointer transition-all duration-200",
                  "hover:shadow-card hover:-translate-y-1",
                  isSelected ? option.accentClass : "border-border",
                  isSelected && "shadow-card"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                    option.type === "individual" ? "bg-crimson/10" : "bg-cobalt/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-7 h-7",
                      option.type === "individual" ? "text-crimson" : "text-cobalt"
                    )}
                  />
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-h3 font-semibold text-foreground mb-1">{option.title}</h2>
                <p className="text-body-small text-muted-foreground mb-4">{option.subtitle}</p>

                {/* Bullets */}
                <ul className="space-y-2 mb-6">
                  {option.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2 text-body-small text-foreground">
                      <Check
                        className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0",
                          option.type === "individual" ? "text-crimson" : "text-cobalt"
                        )}
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  type="button"
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-white font-medium transition-colors",
                    option.buttonClass
                  )}
                >
                  {option.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
