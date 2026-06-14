import { motion } from "motion/react";

interface ScoreBarProps {
  score: number;
  label: string;
}

const SCORE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
const SCORE_LABELS = ["Poor", "Basic", "Good", "Excellent"];

export default function ScoreBar({ score, label }: ScoreBarProps) {
  // Ensure score stays within 0..3
  const safeScore = Math.min(3, Math.max(0, score));
  const percent = (safeScore / 3) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-[#6b7fa3] font-mono uppercase tracking-widest font-semibold">{label}</span>
        <span 
          style={{ color: SCORE_COLORS[safeScore] }}
          className="text-xs font-bold font-mono tracking-wide"
        >
          {safeScore}/3 — {SCORE_LABELS[safeScore]}
        </span>
      </div>
      <div className="h-2.5 bg-[#142035] rounded-full overflow-hidden border border-slate-800/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          style={{
            background: `linear-gradient(90deg, ${SCORE_COLORS[safeScore]}bb, ${SCORE_COLORS[safeScore]})`
          }}
          className="h-full rounded-full"
        />
      </div>
    </div>
  );
}
