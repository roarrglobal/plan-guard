import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Star } from "lucide-react";

interface Props {
  show: boolean;
  onDone: () => void;
}

export function CelebrationOverlay({ show, onDone }: Props) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDone, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        {/* Confetti particles */}
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 1,
              x: 0, 
              y: 0,
              scale: 0 
            }}
            animate={{ 
              opacity: [1, 1, 0],
              x: (Math.random() - 0.5) * 600,
              y: (Math.random() - 0.5) * 600,
              scale: [0, 1, 0.5],
              rotate: Math.random() * 720 
            }}
            transition={{ 
              duration: 2,
              ease: "easeOut",
              delay: Math.random() * 0.3
            }}
            className="absolute"
            style={{
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              backgroundColor: [
                "hsl(var(--primary))",
                "hsl(var(--crimson))",
                "#FFD700",
                "#FF6B6B",
                "#4ECDC4",
                "#A78BFA",
              ][Math.floor(Math.random() * 6)],
            }}
          />
        ))}

        {/* Center message */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.1, 1], opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="bg-card border border-border rounded-2xl shadow-2xl px-8 py-6 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <PartyPopper className="w-12 h-12 text-primary mx-auto mb-3" />
          </motion.div>
          <h3 className="text-lg font-bold text-foreground">You're all set! 🎉</h3>
          <p className="text-sm text-muted-foreground mt-1">Your experience is now personalized</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
