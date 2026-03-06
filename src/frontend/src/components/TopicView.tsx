import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Play,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useLessonContent,
  useTopics,
  useUserProgress,
} from "../hooks/useQueries";

interface TopicViewProps {
  topicId: string;
  onBack: () => void;
  onStartQuiz: (topicId: string, difficulty: string) => void;
}

const DIFFICULTY_ORDER = ["Easy", "Medium", "Hard"];

function getDifficultyBadgeClass(diff: string) {
  switch (diff.toLowerCase()) {
    case "easy":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "medium":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "hard":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function DifficultyIcon({ difficulty }: { difficulty: string }) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return <span className="text-emerald-500">●</span>;
    case "medium":
      return <span className="text-amber-500">●●</span>;
    case "hard":
      return <span className="text-red-500">●●●</span>;
    default:
      return null;
  }
}

interface LessonContentProps {
  topicId: string;
  difficulty: string;
  onStartQuiz: () => void;
}

function LessonContent({
  topicId,
  difficulty,
  onStartQuiz,
}: LessonContentProps) {
  const { data: lesson, isLoading } = useLessonContent(topicId, difficulty);
  const { data: progress = [] } = useUserProgress();

  const progressItem = progress.find(
    (p) =>
      p.topicId === topicId &&
      p.difficulty.toLowerCase() === difficulty.toLowerCase(),
  );

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="topic.loading_state">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-6">
          <Skeleton className="h-6 w-40 mb-3" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12" data-ocid="topic.error_state">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-muted-foreground">
          Lesson content coming soon for this difficulty!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={`${topicId}-${difficulty}`}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Lesson title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getDifficultyBadgeClass(difficulty)}`}
          >
            <DifficultyIcon difficulty={difficulty} /> {difficulty}
          </span>
          {progressItem?.completed && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={11} /> Completed
            </span>
          )}
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground">
          {lesson.title}
        </h2>
      </div>

      {/* Step-by-step content */}
      <div className="space-y-5">
        {lesson.content.map((paragraph, i) => (
          <motion.div
            key={paragraph.slice(0, 20)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-4"
          >
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-foreground text-base leading-relaxed pt-1">
              {paragraph}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Examples */}
      {lesson.examples.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="font-display font-semibold text-base text-foreground">
              Examples
            </h3>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            {lesson.examples.map((example) => (
              <div
                key={example.slice(0, 20)}
                className="flex items-start gap-2"
              >
                <span className="text-amber-400 font-bold text-sm mt-0.5">
                  →
                </span>
                <p className="text-foreground font-medium">{example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best score */}
      {progressItem && Number(progressItem.quizzesTaken) > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your Best Score
            </p>
            <p className="text-xs text-muted-foreground">
              {Number(progressItem.quizzesTaken)} quiz
              {Number(progressItem.quizzesTaken) !== 1 ? "zes" : ""} taken
            </p>
          </div>
          <div className="text-right">
            <span className="font-display font-black text-2xl text-primary">
              {Number(progressItem.bestScore)}/
              {Number(progressItem.totalQuestions)}
            </span>
          </div>
        </div>
      )}

      {/* Start Quiz button */}
      <Button
        data-ocid="topic.start_quiz.button"
        onClick={onStartQuiz}
        size="lg"
        className="w-full font-display font-bold text-base h-14 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
      >
        <Play size={18} className="mr-2" />
        Start {difficulty} Quiz
      </Button>
    </motion.div>
  );
}

export default function TopicView({
  topicId,
  onBack,
  onStartQuiz,
}: TopicViewProps) {
  const { data: topics = [] } = useTopics();
  const [difficulty, setDifficulty] = useState("Easy");

  const topic = topics.find((t) => t.id === topicId) || {
    id: topicId,
    icon: "📚",
    name: topicId.charAt(0).toUpperCase() + topicId.slice(1),
    description: "",
    availableDifficulties: ["Easy", "Medium", "Hard"],
  };

  const availableDiffs = DIFFICULTY_ORDER.filter((d) =>
    topic.availableDifficulties.some(
      (ad) => ad.toLowerCase() === d.toLowerCase(),
    ),
  );

  // Normalize difficulty to available
  const normalizedDifficulty =
    availableDiffs.find((d) => d.toLowerCase() === difficulty.toLowerCase()) ||
    availableDiffs[0] ||
    "Easy";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back nav */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Topics
        </Button>
      </div>

      {/* Topic header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl shadow-sm">
          {topic.icon}
        </div>
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground">
            {topic.name}
          </h1>
          {topic.description && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {topic.description}
            </p>
          )}
        </div>
      </motion.div>

      {/* Difficulty tabs */}
      <Tabs
        value={normalizedDifficulty}
        onValueChange={(v) => setDifficulty(v)}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-muted p-1">
          {availableDiffs.map((diff) => (
            <TabsTrigger
              key={diff}
              value={diff}
              data-ocid={`topic.difficulty.${diff.toLowerCase()}.tab`}
              className={`rounded-lg font-medium text-sm transition-all data-[state=active]:shadow-sm ${
                diff.toLowerCase() === "easy"
                  ? "data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                  : diff.toLowerCase() === "medium"
                    ? "data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
                    : "data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
              }`}
            >
              <BookOpen size={13} className="mr-1.5" />
              {diff}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableDiffs.map((diff) => (
          <TabsContent key={diff} value={diff} className="mt-6">
            <LessonContent
              topicId={topicId}
              difficulty={diff}
              onStartQuiz={() => onStartQuiz(topicId, diff)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
