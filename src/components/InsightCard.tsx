import { motion } from "framer-motion";
import { Insight } from "../utils/aiInsights";
import { WeatherTheme } from "../utils/weatherThemes";

interface Props {
  insight: Insight;
  index: number;
  theme: WeatherTheme;
}

export default function InsightCard({ insight, index, theme }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
      className="flex items-start gap-3 p-4 rounded-2xl backdrop-blur-sm"
    >
      <div
        style={{
          background: theme.pill,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          minWidth: "32px",
          height: "32px",
        }}
        className="rounded-full flex items-center justify-center text-sm flex-shrink-0"
      >
        {insight.icon}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
        {insight.text}
      </p>
    </motion.div>
  );
}