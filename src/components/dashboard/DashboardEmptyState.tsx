import { Target, Briefcase, Rocket, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EXAMPLE_PROMPTS = [
  {
    icon: Briefcase,
    text: "Should I take this job offer?",
    color: "#0047AB",
  },
  {
    icon: Rocket,
    text: "Is my product ready to launch?",
    color: "#059669",
  },
  {
    icon: MapPin,
    text: "Should I relocate for this opportunity?",
    color: "#D97706",
  },
];

export function DashboardEmptyState() {
  const navigate = useNavigate();

  const handleExampleClick = (prompt: string) => {
    // Store the prompt and navigate to analyze
    sessionStorage.setItem("snag_input", prompt);
    navigate("/analyze");
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* Illustration */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EBF2FF] to-[#F0F7FF] flex items-center justify-center mb-6">
        <Target className="w-10 h-10 text-[#0047AB]" />
      </div>

      {/* Headline */}
      <h2 className="text-[22px] font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Inter' }}>
        Ready to stress-test your first decision?
      </h2>
      
      {/* Subhead */}
      <p className="text-[15px] text-[#666666] mb-8 max-w-[300px]">
        The best decisions are the ones you've already poked holes in.
      </p>

      {/* Example prompts */}
      <div className="w-full space-y-3 mb-6">
        {EXAMPLE_PROMPTS.map((prompt, i) => {
          const Icon = prompt.icon;
          return (
            <button
              key={i}
              onClick={() => handleExampleClick(prompt.text)}
              className="w-full flex items-center gap-3 bg-white border border-[#E5E5E5] rounded-lg p-4 text-left hover:border-[#0047AB] hover:bg-[#FAFBFF] transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${prompt.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: prompt.color }} />
              </div>
              <span className="text-[15px] text-[#333333] group-hover:text-[#0047AB] transition-colors">
                "{prompt.text}"
              </span>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate("/analyze")}
        className="text-[14px] font-medium text-[#BE3455] hover:underline"
      >
        Or describe your own →
      </button>
    </div>
  );
}
