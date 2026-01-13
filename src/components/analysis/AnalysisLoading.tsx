import { useEffect, useState, forwardRef } from "react";

const loadingMessages = [
  "Analyzing your plan...",
  "Finding blind spots...",
  "Mapping failure modes...",
  "Identifying warning signals...",
  "Crafting the unasked question...",
];

export const AnalysisLoading = forwardRef<HTMLDivElement>((_, ref) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Simple spinner */}
        <div className="w-12 h-12 border-3 border-[#E5E5E5] border-t-[#666666] rounded-full animate-spin" />

        {/* Loading message */}
        <div className="text-center">
          <p
            className="text-[16px] text-[#666666] transition-opacity duration-300"
            key={messageIndex}
          >
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-[13px] text-[#999999] mt-3">
            This usually takes 15-30 seconds
          </p>
        </div>
      </div>
    </div>
  );
});

AnalysisLoading.displayName = "AnalysisLoading";
