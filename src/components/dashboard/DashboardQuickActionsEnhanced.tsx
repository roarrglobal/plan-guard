import { Zap, Compass, Upload, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function DashboardQuickActionsEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available in the Pro plan.`,
    });
  };

  return (
    <div className="mb-6">
      <h2
        className="text-[16px] font-semibold text-[#1A1A1A] mb-3"
        style={{ fontFamily: "Inter" }}
      >
        What's on your mind?
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {/* Quick Snag - Primary */}
        <button
          onClick={() => navigate("/analyze")}
          className="flex flex-col items-center justify-center gap-2 bg-[#0047AB] text-white rounded-xl p-4 min-h-[100px] hover:bg-[#003A8C] transition-colors"
        >
          <Zap className="w-6 h-6" />
          <span className="text-[13px] font-medium">Quick Snag</span>
        </button>

        {/* Deep Snag - Pro */}
        <button
          onClick={() => handleProFeature("Deep Snag wizard")}
          className="relative flex flex-col items-center justify-center gap-2 bg-white border border-[#0047AB] text-[#0047AB] rounded-xl p-4 min-h-[100px] hover:bg-[#F0F7FF] transition-colors"
        >
          <Compass className="w-6 h-6" />
          <span className="text-[13px] font-medium">Deep Snag</span>
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#0047AB] text-white px-1.5 py-0.5 rounded">
            PRO
          </span>
        </button>

        {/* Upload & Snag - Pro */}
        <button
          onClick={() => handleProFeature("Upload & Snag")}
          className="relative flex flex-col items-center justify-center gap-2 bg-white border border-[#E5E5E5] text-[#666666] rounded-xl p-4 min-h-[100px] hover:bg-[#F8F8F8] transition-colors"
        >
          <Upload className="w-6 h-6" />
          <span className="text-[13px] font-medium">Upload</span>
          <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#666666] text-white px-1.5 py-0.5 rounded">
            PRO
          </span>
        </button>
      </div>
    </div>
  );
}
