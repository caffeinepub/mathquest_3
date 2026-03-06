import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChevronRight, Loader2, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizResultData } from "../App";
import { useQuestions, useSubmitQuizResult } from "../hooks/useQueries";
import { useTopics } from "../hooks/useQueries";

interface QuizViewProps {
  topicId: string;
  difficulty: string;
  onComplete: (result: QuizResultData) => void;
  onQuit: () => void;
}

type AnswerState = "idle" | "correct" | "incorrect";

const OPTION_LABELS = ["A", "B", "C", "D"];

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

export default function QuizView({
  topicId,
  difficulty,
  onComplete,
  onQuit,
}: QuizViewProps) {
  const { data: topics = [] } = useTopics();
  const { data: questions = [], isLoading } = useQuestions(
    topicId,
    difficulty,
    true,
  );
  const submitMutation = useSubmitQuizResult();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillInValue, setFillInValue] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});
  const fillInRef = useRef<HTMLInputElement>(null);

  const topic = topics.find((t) => t.id === topicId);
  const currentQuestion = questions[currentIndex];
  const isAnswered = answerState !== "idle";
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent =
    questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  // Focus fill-in input when question type changes
  useEffect(() => {
    if (currentQuestion?.questionType === "fill_in" && !isAnswered) {
      setTimeout(() => fillInRef.current?.focus(), 100);
    }
  }, [currentQuestion?.questionType, isAnswered]);

  const handleSubmitAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentQuestion) return;

      const correct =
        answer.trim().toLowerCase() ===
        currentQuestion.correctAnswer.trim().toLowerCase();
      setAnswerState(correct ? "correct" : "incorrect");
      setSelectedAnswer(answer);

      if (correct) {
        setScore((prev) => prev + 1);
      }
      setAnsweredMap((prev) => ({ ...prev, [currentIndex]: correct }));
    },
    [isAnswered, currentQuestion, currentIndex],
  );

  const handleFillInSubmit = useCallback(() => {
    if (!fillInValue.trim()) return;
    handleSubmitAnswer(fillInValue.trim());
  }, [fillInValue, handleSubmitAnswer]);

  const handleNext = useCallback(async () => {
    if (isLastQuestion) {
      // Submit result and go to results
      try {
        await submitMutation.mutateAsync({
          topicId,
          difficulty,
          score,
          total: questions.length,
        });
      } catch (_e) {
        // Continue even if submission fails
      }
      onComplete({
        topicId,
        topicName: topic?.name ?? topicId,
        topicIcon: topic?.icon ?? "📚",
        difficulty,
        score,
        total: questions.length,
      });
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setFillInValue("");
    setAnswerState("idle");
  }, [
    isLastQuestion,
    score,
    submitMutation,
    topicId,
    difficulty,
    questions.length,
    onComplete,
    topic,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        currentQuestion?.questionType === "fill_in" &&
        !isAnswered
      ) {
        handleFillInSubmit();
      }
    },
    [currentQuestion?.questionType, isAnswered, handleFillInSubmit],
  );

  if (isLoading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8"
        data-ocid="quiz.loading_state"
      >
        <Skeleton className="h-4 w-full mb-6 rounded-full" />
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-24 w-full rounded-2xl mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center"
        data-ocid="quiz.error_state"
      >
        <div className="text-5xl mb-4">🤔</div>
        <h2 className="font-display font-bold text-xl mb-2">
          No questions available
        </h2>
        <p className="text-muted-foreground mb-6">
          Questions for this topic and difficulty aren't ready yet.
        </p>
        <Button onClick={onQuit} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-foreground">
            {topic?.icon} {topic?.name}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(difficulty)}`}
          >
            {difficulty}
          </span>
        </div>
        <Button
          data-ocid="quiz.quit.button"
          variant="ghost"
          size="sm"
          onClick={onQuit}
          className="text-muted-foreground hover:text-destructive gap-1.5"
        >
          <X size={15} />
          <span className="hidden sm:inline">Quit</span>
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2 font-medium">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-primary font-semibold">{score} correct</span>
        </div>
        <Progress value={progressPercent} className="h-2.5 rounded-full" />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bg-card border-2 border-border rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
            <p className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-snug">
              {currentQuestion.prompt}
            </p>
          </div>

          {/* Answer options */}
          {currentQuestion.questionType === "multiple_choice" ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                const optionIdx = i;
                const isSelected = selectedAnswer === option;
                const isCorrectOption =
                  option.trim().toLowerCase() ===
                  currentQuestion.correctAnswer.trim().toLowerCase();
                let optionClass =
                  "border-border bg-card hover:border-primary hover:bg-primary/5";

                if (isAnswered) {
                  if (isCorrectOption) {
                    optionClass = "answer-correct border-2";
                  } else if (isSelected && !isCorrectOption) {
                    optionClass = "answer-incorrect border-2";
                  } else {
                    optionClass = "border-border bg-card opacity-60";
                  }
                }

                return (
                  <motion.button
                    key={option}
                    data-ocid={`quiz.option.button.${optionIdx + 1}`}
                    onClick={() => !isAnswered && handleSubmitAnswer(option)}
                    disabled={isAnswered}
                    className={`w-full flex items-center gap-4 px-5 py-4 min-h-[4rem] rounded-2xl border-2 text-left transition-all duration-200 ${optionClass} ${!isAnswered ? "cursor-pointer active:scale-[0.99]" : "cursor-default"}`}
                    whileHover={
                      !isAnswered
                        ? { scale: 1.015, transition: { duration: 0.15 } }
                        : {}
                    }
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    animate={
                      isAnswered && isCorrectOption
                        ? {
                            scale: [1, 1.04, 1],
                            transition: { duration: 0.35 },
                          }
                        : {}
                    }
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        isAnswered && isCorrectOption
                          ? "bg-emerald-500 text-white"
                          : isAnswered && isSelected && !isCorrectOption
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {OPTION_LABELS[i]}
                    </span>
                    <span className="flex-1 text-base font-medium leading-snug">
                      {option}
                    </span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2
                        size={22}
                        className="text-emerald-500 shrink-0"
                      />
                    )}
                    {isAnswered && isSelected && !isCorrectOption && (
                      <XCircle size={22} className="text-red-500 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  data-ocid="quiz.fill_in.input"
                  ref={fillInRef}
                  value={fillInValue}
                  onChange={(e) => setFillInValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAnswered}
                  placeholder="Type your answer..."
                  className={`h-14 text-lg rounded-xl border-2 font-medium ${
                    isAnswered
                      ? answerState === "correct"
                        ? "answer-correct"
                        : "answer-incorrect"
                      : ""
                  }`}
                />
                {!isAnswered && (
                  <Button
                    data-ocid="quiz.submit.button"
                    onClick={handleFillInSubmit}
                    disabled={!fillInValue.trim()}
                    size="lg"
                    className="h-14 px-6 rounded-xl font-bold shrink-0"
                  >
                    Check
                  </Button>
                )}
              </div>

              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    answerState === "correct"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {answerState === "correct" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  <span className="font-medium text-sm">
                    {answerState === "correct"
                      ? "Correct!"
                      : `Correct answer: ${currentQuestion.correctAnswer}`}
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Explanation + Next */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="mt-5 space-y-4"
              >
                {currentQuestion.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <span className="font-semibold">💡 Explanation: </span>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                <Button
                  data-ocid="quiz.next.button"
                  onClick={handleNext}
                  disabled={submitMutation.isPending}
                  size="lg"
                  className="w-full h-16 font-display font-bold text-lg rounded-2xl shadow-md hover:shadow-lg transition-all"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      Finish Quiz
                      <ChevronRight size={18} className="ml-1" />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ChevronRight size={18} className="ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Question dots */}
      <div className="flex justify-center gap-1.5 mt-8 flex-wrap">
        {questions.map((q, i) => (
          <div
            key={Number(q.id)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i < currentIndex
                ? answeredMap[i]
                  ? "bg-emerald-400"
                  : "bg-red-400"
                : i === currentIndex
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
