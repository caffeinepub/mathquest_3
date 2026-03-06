import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Home,
  RotateCcw,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import type { QuizResultData } from "../App";

interface ResultsViewProps {
  result: QuizResultData;
  onRetry: () => void;
  onBackToTopics: () => void;
}

function getScoreMessage(percent: number): {
  message: string;
  emoji: string;
  color: string;
} {
  if (percent >= 90)
    return { message: "Outstanding!", emoji: "🏆", color: "text-amber-500" };
  if (percent >= 80)
    return { message: "Excellent!", emoji: "⭐", color: "text-primary" };
  if (percent >= 70)
    return { message: "Good Job!", emoji: "👏", color: "text-emerald-600" };
  if (percent >= 60)
    return { message: "Nice Try!", emoji: "💪", color: "text-cyan-600" };
  if (percent >= 40)
    return { message: "Keep Going!", emoji: "📚", color: "text-amber-600" };
  return {
    message: "Keep Practicing!",
    emoji: "🌱",
    color: "text-muted-foreground",
  };
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-200";
    case "hard":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
}

function ScoreRing({ percent }: { percent: number }) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 80 ? "#22c55e" : percent >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      aria-label={`Score: ${percent}%`}
      role="img"
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/40"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

export default function ResultsView({
  result,
  onRetry,
  onBackToTopics,
}: ResultsViewProps) {
  const percent =
    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const { message, emoji, color } = getScoreMessage(percent);
  const completed = percent >= 80;
  const incorrect = result.total - result.score;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="border-2 border-border shadow-lg overflow-hidden">
          {/* Top section with ring */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center border-b border-border">
            {/* Topic info */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">{result.topicIcon}</span>
              <span className="font-display font-bold text-lg text-foreground">
                {result.topicName}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(result.difficulty)}`}
              >
                {result.difficulty}
              </span>
            </div>

            {/* Score ring */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <ScoreRing percent={percent} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
                  className="font-display font-black text-4xl text-foreground"
                >
                  {percent}%
                </motion.span>
                <span className="text-sm text-muted-foreground font-medium">
                  {result.score}/{result.total}
                </span>
              </div>
            </div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-3xl mb-1">{emoji}</div>
              <h2 className={`font-display font-black text-2xl ${color}`}>
                {message}
              </h2>
            </motion.div>

            {/* Completion badge */}
            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-300 text-sm font-semibold px-4 py-2 rounded-full mt-3"
              >
                <Trophy size={14} />
                Topic Completed!
              </motion.div>
            )}
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 divide-x divide-border"
          >
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                <CheckCircle2 size={16} />
                <span className="font-display font-bold text-xl">
                  {result.score}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Correct
              </p>
            </div>
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-red-500 mb-1">
                <XCircle size={16} />
                <span className="font-display font-bold text-xl">
                  {incorrect}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Incorrect
              </p>
            </div>
          </motion.div>

          {/* Score bar */}
          <div className="px-6 pb-2 pt-1">
            <div className="flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted">
              {Array.from({ length: result.total }, (_, i) => i).map((i) => (
                <motion.div
                  key={`bar-${i}`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8 + i * 0.04 }}
                  className={`flex-1 rounded-sm ${i < result.score ? "bg-emerald-400" : "bg-red-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Motivational note */}
          {!completed && (
            <div className="px-6 pb-4 pt-2">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <Star size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Score 80% or higher to complete this topic and earn a badge!
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="p-6 pt-4 space-y-3">
            <Button
              data-ocid="results.retry.button"
              onClick={onRetry}
              size="lg"
              className="w-full h-12 font-display font-bold rounded-xl"
            >
              <RotateCcw size={16} className="mr-2" />
              Try Again
            </Button>
            <Button
              data-ocid="results.home.button"
              onClick={onBackToTopics}
              variant="outline"
              size="lg"
              className="w-full h-12 font-display font-semibold rounded-xl"
            >
              <Home size={16} className="mr-2" />
              Back to Topics
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
