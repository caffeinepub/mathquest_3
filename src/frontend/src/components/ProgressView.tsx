import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { QuizResult, Topic, UserProgress } from "../backend.d.ts";
import {
  useOverallStats,
  useQuizHistory,
  useTopics,
  useUserProgress,
} from "../hooks/useQueries";

interface ProgressViewProps {
  onSelectTopic: (topicId: string) => void;
}

const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"];

function getDifficultyColor(diff: string) {
  switch (diff.toLowerCase()) {
    case "easy":
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        bar: "bg-emerald-400",
      };
    case "medium":
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        bar: "bg-amber-400",
      };
    case "hard":
      return {
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        bar: "bg-red-400",
      };
    default:
      return {
        text: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border",
        bar: "bg-muted-foreground",
      };
  }
}

const TOPIC_GRADIENTS: Record<string, string> = {
  addition: "from-violet-50/60 to-violet-100/60 border-violet-200",
  subtraction: "from-orange-50/60 to-orange-100/60 border-orange-200",
  multiplication: "from-emerald-50/60 to-emerald-100/60 border-emerald-200",
  division: "from-cyan-50/60 to-cyan-100/60 border-cyan-200",
  fractions: "from-pink-50/60 to-pink-100/60 border-pink-200",
  algebra: "from-amber-50/60 to-amber-100/60 border-amber-200",
};

function getTopicKey(topicId: string): string {
  return topicId.toLowerCase().replace(/[^a-z]/g, "");
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000; // nanoseconds to ms
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TopicProgressCard({
  topic,
  progress,
  index,
  onClick,
}: {
  topic: Topic;
  progress: UserProgress[];
  index: number;
  onClick: () => void;
}) {
  const topicProgress = progress.filter((p) => p.topicId === topic.id);
  const completedDiffs = topicProgress.filter((p) => p.completed).length;
  const totalDiffs = topic.availableDifficulties.length;
  const overallPercent =
    totalDiffs > 0 ? Math.round((completedDiffs / totalDiffs) * 100) : 0;
  const key = getTopicKey(topic.id);
  const gradientClass =
    TOPIC_GRADIENTS[key] || "from-slate-50/60 to-slate-100/60 border-slate-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card
        data-ocid={`progress.topic.card.${index + 1}`}
        className={`bg-gradient-to-br ${gradientClass} border cursor-pointer hover:shadow-md transition-all duration-200 group`}
        onClick={onClick}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{topic.icon}</span>
              <div>
                <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {topic.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {completedDiffs}/{totalDiffs} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {completedDiffs === totalDiffs && totalDiffs > 0 && (
                <Trophy size={16} className="text-amber-500" />
              )}
              <ChevronRight
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mb-4">
            <Progress value={overallPercent} className="h-1.5 rounded-full" />
          </div>

          {/* Per-difficulty breakdown */}
          <div className="space-y-2">
            {DIFFICULTY_ORDER.map((diff) => {
              const p = topicProgress.find(
                (tp) => tp.difficulty.toLowerCase() === diff.toLowerCase(),
              );
              if (
                !p &&
                !topic.availableDifficulties.some(
                  (d) => d.toLowerCase() === diff.toLowerCase(),
                )
              ) {
                return null;
              }
              const colors = getDifficultyColor(diff);
              const scorePercent =
                p && Number(p.totalQuestions) > 0
                  ? Math.round(
                      (Number(p.bestScore) / Number(p.totalQuestions)) * 100,
                    )
                  : 0;

              return (
                <div key={diff} className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold w-16 shrink-0 px-2 py-0.5 rounded-full border text-center ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {diff}
                  </span>
                  <div className="flex-1">
                    {p ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                          {scorePercent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Not started
                      </span>
                    )}
                  </div>
                  {p?.completed && (
                    <CheckCircle2
                      size={13}
                      className="text-emerald-500 shrink-0"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuizHistoryItem({
  result,
  topicName,
  topicIcon,
}: { result: QuizResult; topicName: string; topicIcon: string }) {
  const percent =
    Number(result.total) > 0
      ? Math.round((Number(result.score) / Number(result.total)) * 100)
      : 0;
  const colors = getDifficultyColor(result.difficulty);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <span className="text-xl w-8 text-center shrink-0">{topicIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-medium text-sm text-foreground">
            {topicName}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {result.difficulty}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(result.timestamp)}
        </span>
      </div>
      <div className="text-right shrink-0">
        <div
          className={`font-display font-bold text-base ${percent >= 80 ? "text-emerald-600" : percent >= 60 ? "text-amber-600" : "text-red-500"}`}
        >
          {percent}%
        </div>
        <div className="text-xs text-muted-foreground">
          {Number(result.score)}/{Number(result.total)}
        </div>
      </div>
    </div>
  );
}

export default function ProgressView({ onSelectTopic }: ProgressViewProps) {
  const { data: topics = [], isLoading: topicsLoading } = useTopics();
  const { data: progress = [], isLoading: progressLoading } = useUserProgress();
  const { data: history = [], isLoading: historyLoading } = useQuizHistory();
  const { data: stats, isLoading: statsLoading } = useOverallStats();

  const isLoading = topicsLoading || progressLoading;

  // Fallback topics
  const fallbackTopics: Topic[] = [
    {
      id: "addition",
      icon: "➕",
      name: "Addition",
      description: "",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "subtraction",
      icon: "➖",
      name: "Subtraction",
      description: "",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "multiplication",
      icon: "✖️",
      name: "Multiplication",
      description: "",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "division",
      icon: "➗",
      name: "Division",
      description: "",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "fractions",
      icon: "🔢",
      name: "Fractions",
      description: "",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "algebra",
      icon: "🔡",
      name: "Algebra",
      description: "",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
  ];

  const displayTopics = topics.length > 0 ? topics : fallbackTopics;

  const topicMap = Object.fromEntries(
    displayTopics.map((t) => [t.id, { name: t.name, icon: t.icon }]),
  );

  const recentHistory = [...history].slice(0, 20);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-1">
          Your Progress
        </h1>
        <p className="text-muted-foreground">
          Track your learning journey across all topics.
        </p>
      </motion.div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          {
            icon: <Trophy size={20} className="text-amber-500" />,
            label: "Completed",
            value: statsLoading
              ? "—"
              : String(Number(stats?.totalCompleted ?? 0)),
            sub: "topics",
          },
          {
            icon: <BookOpen size={20} className="text-primary" />,
            label: "Started",
            value: statsLoading
              ? "—"
              : String(Number(stats?.topicsStarted ?? 0)),
            sub: "topics",
          },
          {
            icon: <Zap size={20} className="text-emerald-500" />,
            label: "Quizzes",
            value: statsLoading
              ? "—"
              : String(Number(stats?.totalQuizzesTaken ?? 0)),
            sub: "taken",
          },
          {
            icon: <Star size={20} className="text-pink-500" />,
            label: "Avg Score",
            value: statsLoading
              ? "—"
              : `${Math.round(stats?.averageScore ?? 0)}%`,
            sub: "average",
          },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm text-center"
          >
            <div className="flex justify-center mb-1.5">{item.icon}</div>
            {statsLoading ? (
              <Skeleton className="h-7 w-12 mx-auto mb-1" />
            ) : (
              <div className="font-display font-black text-2xl text-foreground">
                {item.value}
              </div>
            )}
            <div className="text-xs text-muted-foreground font-medium capitalize">
              {item.sub}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Topic cards */}
        <div className="lg:col-span-2">
          <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            Topic Progress
          </h2>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {["a", "b", "c", "d", "e", "f"].map((k) => (
                <Card key={k} className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full mb-3 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {displayTopics.map((topic, i) => (
                <TopicProgressCard
                  key={topic.id}
                  topic={topic}
                  progress={progress}
                  index={i}
                  onClick={() => onSelectTopic(topic.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quiz history */}
        <div>
          <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            Recent Quizzes
          </h2>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-0">
              {historyLoading ? (
                <div className="p-4 space-y-3">
                  {["a", "b", "c", "d", "e"].map((k) => (
                    <div key={k} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                      <Skeleton className="h-5 w-10" />
                    </div>
                  ))}
                </div>
              ) : recentHistory.length === 0 ? (
                <div
                  data-ocid="progress.quiz.empty_state"
                  className="py-12 px-6 text-center"
                >
                  <div className="text-4xl mb-3">📊</div>
                  <p className="font-display font-semibold text-foreground mb-1">
                    No quizzes yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete a quiz to see your history here.
                  </p>
                </div>
              ) : (
                <div className="px-4">
                  {recentHistory.map((result) => (
                    <QuizHistoryItem
                      key={Number(result.id)}
                      result={result}
                      topicName={
                        topicMap[result.topicId]?.name ?? result.topicId
                      }
                      topicIcon={topicMap[result.topicId]?.icon ?? "📚"}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          {!progressLoading && progress.some((p) => p.completed) && (
            <div className="mt-4">
              <h3 className="font-display font-semibold text-base text-foreground mb-3 flex items-center gap-2">
                <Trophy size={15} className="text-amber-500" />
                Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {progress
                  .filter((p) => p.completed)
                  .map((p) => {
                    const topic = displayTopics.find((t) => t.id === p.topicId);
                    return (
                      <Badge
                        key={`${p.topicId}-${p.difficulty}`}
                        className="badge-easy text-xs px-2.5 py-1 gap-1"
                      >
                        <CheckCircle2 size={10} />
                        {topic?.name ?? p.topicId} {p.difficulty}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
