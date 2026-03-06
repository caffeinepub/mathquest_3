import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Star, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { Topic, UserProgress } from "../backend.d.ts";
import { useTopics } from "../hooks/useQueries";
import { useUserProgress } from "../hooks/useQueries";
import { useOverallStats } from "../hooks/useQueries";

interface HomeViewProps {
  onSelectTopic: (topicId: string) => void;
}

const TOPIC_GRADIENTS: Record<string, string> = {
  addition:
    "from-violet-50 to-violet-100 border-violet-200 hover:border-violet-400",
  subtraction:
    "from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400",
  multiplication:
    "from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-400",
  division: "from-cyan-50 to-cyan-100 border-cyan-200 hover:border-cyan-400",
  fractions: "from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400",
  algebra: "from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400",
};

const TOPIC_ICON_BG: Record<string, string> = {
  addition: "bg-violet-100 text-violet-600",
  subtraction: "bg-orange-100 text-orange-600",
  multiplication: "bg-emerald-100 text-emerald-600",
  division: "bg-cyan-100 text-cyan-600",
  fractions: "bg-pink-100 text-pink-600",
  algebra: "bg-amber-100 text-amber-600",
};

function getTopicKey(topicId: string): string {
  return topicId.toLowerCase().replace(/[^a-z]/g, "");
}

function getDifficultyStyle(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "badge-easy";
    case "medium":
      return "badge-medium";
    case "hard":
      return "badge-hard";
    default:
      return "";
  }
}

interface TopicCardProps {
  topic: Topic;
  progress: UserProgress[];
  index: number;
  onClick: () => void;
}

function TopicCard({ topic, progress, index, onClick }: TopicCardProps) {
  const key = getTopicKey(topic.id);
  const gradientClass =
    TOPIC_GRADIENTS[key] ||
    "from-slate-50 to-slate-100 border-slate-200 hover:border-slate-400";
  const iconBgClass = TOPIC_ICON_BG[key] || "bg-slate-100 text-slate-600";

  const topicProgress = progress.filter((p) => p.topicId === topic.id);
  const completedCount = topicProgress.filter((p) => p.completed).length;
  const totalDifficulties = topic.availableDifficulties.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        data-ocid={`topic.card.${index + 1}`}
        onClick={onClick}
        className={`cursor-pointer border-2 bg-gradient-to-br ${gradientClass} transition-all duration-200 shadow-sm hover:shadow-md group`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-14 h-14 rounded-2xl ${iconBgClass} flex items-center justify-center text-3xl shadow-sm`}
            >
              {topic.icon}
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={11} />
                <span>
                  {completedCount}/{totalDifficulties}
                </span>
              </div>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
            {topic.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {topic.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {topic.availableDifficulties.map((diff) => {
              const progressItem = topicProgress.find(
                (p) => p.difficulty.toLowerCase() === diff.toLowerCase(),
              );
              return (
                <span
                  key={diff}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyStyle(diff)}`}
                >
                  {progressItem?.completed && <CheckCircle2 size={10} />}
                  {diff}
                </span>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function StatsBar() {
  const { data: stats, isLoading } = useOverallStats();

  const items = [
    {
      icon: <Trophy size={18} className="text-amber-500" />,
      label: "Topics Completed",
      value: isLoading ? "—" : String(Number(stats?.totalCompleted ?? 0)),
    },
    {
      icon: <Star size={18} className="text-primary" />,
      label: "Average Score",
      value: isLoading ? "—" : `${Math.round(stats?.averageScore ?? 0)}%`,
    },
    {
      icon: <Zap size={18} className="text-emerald-500" />,
      label: "Quizzes Taken",
      value: isLoading ? "—" : String(Number(stats?.totalQuizzesTaken ?? 0)),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-card border border-border rounded-2xl p-3 sm:p-4 text-center shadow-sm"
        >
          <div className="flex justify-center mb-1">{item.icon}</div>
          {isLoading ? (
            <Skeleton className="h-7 w-12 mx-auto mb-1" />
          ) : (
            <div className="font-display font-bold text-xl sm:text-2xl text-foreground">
              {item.value}
            </div>
          )}
          <div className="text-xs text-muted-foreground font-medium">
            {item.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function HomeView({ onSelectTopic }: HomeViewProps) {
  const { data: topics = [], isLoading: topicsLoading } = useTopics();
  const { data: progress = [] } = useUserProgress();

  // Fallback topics for first load / loading state
  const fallbackTopics: Topic[] = [
    {
      id: "addition",
      icon: "➕",
      name: "Addition",
      description: "Master the fundamentals of adding numbers together.",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "subtraction",
      icon: "➖",
      name: "Subtraction",
      description: "Learn to find differences and take away quantities.",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "multiplication",
      icon: "✖️",
      name: "Multiplication",
      description: "Explore times tables and scaling quantities.",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "division",
      icon: "➗",
      name: "Division",
      description: "Divide numbers and understand equal sharing.",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "fractions",
      icon: "🔢",
      name: "Fractions",
      description: "Work with parts of a whole and mixed numbers.",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
    {
      id: "algebra",
      icon: "🔡",
      name: "Algebra",
      description: "Solve for unknowns and understand equations.",
      availableDifficulties: ["Easy", "Medium", "Hard"],
    },
  ];

  const displayTopics = topicsLoading
    ? fallbackTopics
    : topics.length > 0
      ? topics
      : fallbackTopics;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-10"
      >
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-foreground mb-3 tracking-tight">
          Welcome to <span className="text-primary">MathQuest</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Pick a topic below to start learning at your own pace.
        </p>
      </motion.div>

      {/* Topics grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
            Choose a Topic
          </h2>
          <Badge variant="secondary" className="text-xs font-medium">
            {displayTopics.length} Topics
          </Badge>
        </div>

        {topicsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <Card key={k} className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTopics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                progress={progress}
                index={index}
                onClick={() => onSelectTopic(topic.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats — shown below topics as secondary context */}
      <div className="mt-10 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-4">
          Your Progress
        </p>
        <StatsBar />
      </div>
    </div>
  );
}
