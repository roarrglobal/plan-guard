import { Plus, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardQuickActionsProps {
  hasAnalyses: boolean;
  onShowHistory: () => void;
}

export function DashboardQuickActions({ hasAnalyses, onShowHistory }: DashboardQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* New Snag */}
      <button
        onClick={() => navigate("/analyze")}
        className="flex items-center justify-center gap-2 bg-[#0047AB] text-white rounded-xl p-4 font-medium text-[14px] hover:bg-[#003A8C] transition-colors"
      >
        <Plus className="w-5 h-5" />
        New Snag
      </button>

      {/* Revisit */}
      <button
        onClick={onShowHistory}
        disabled={!hasAnalyses}
        className={`flex items-center justify-center gap-2 rounded-xl p-4 font-medium text-[14px] transition-colors ${
          hasAnalyses
            ? "bg-[#F8F8F8] text-[#666666] hover:bg-[#F0F0F0]"
            : "bg-[#F8F8F8] text-[#CCCCCC] cursor-not-allowed"
        }`}
      >
        <History className="w-5 h-5" />
        Revisit
      </button>
    </div>
  );
}
