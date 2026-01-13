import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const pullDistance = useMotionValue(0);
  
  const indicatorOpacity = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 1]);
  const indicatorScale = useTransform(pullDistance, [0, PULL_THRESHOLD], [0.5, 1]);
  const indicatorRotation = useTransform(pullDistance, [0, MAX_PULL], [0, 180]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance to the pull
      const resistance = 0.5;
      const pull = Math.min(diff * resistance, MAX_PULL);
      pullDistance.set(pull);
    }
  }, [isRefreshing, pullDistance]);

  const handleTouchEnd = useCallback(async () => {
    const currentPull = pullDistance.get();
    
    if (currentPull >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      // Animate to loading position
      animate(pullDistance, 60, { duration: 0.2 });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        animate(pullDistance, 0, { duration: 0.3 });
      }
    } else {
      animate(pullDistance, 0, { duration: 0.3 });
    }
    
    touchStartY.current = 0;
  }, [isRefreshing, onRefresh, pullDistance]);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Pull indicator */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center z-10 pointer-events-none"
        style={{ 
          top: useTransform(pullDistance, (v) => v - 50),
          opacity: indicatorOpacity 
        }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
          style={{ scale: indicatorScale }}
        >
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 text-[#0047AB] animate-spin" />
          ) : (
            <motion.div style={{ rotate: indicatorRotation }}>
              <RefreshCw className="w-5 h-5 text-[#0047AB]" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Content container */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{ y: pullDistance }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  );
}
