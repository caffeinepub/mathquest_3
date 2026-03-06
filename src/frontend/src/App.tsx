import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import HomeView from "./components/HomeView";
import NavBar from "./components/NavBar";
import ProgressView from "./components/ProgressView";
import QuizView from "./components/QuizView";
import ResultsView from "./components/ResultsView";
import TopicView from "./components/TopicView";

export type AppView = "home" | "topic" | "quiz" | "results" | "progress";

export interface NavState {
  view: AppView;
  topicId?: string;
  difficulty?: string;
}

export interface QuizResultData {
  topicId: string;
  topicName: string;
  topicIcon: string;
  difficulty: string;
  score: number;
  total: number;
}

export default function App() {
  const [navState, setNavState] = useState<NavState>({ view: "home" });
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);

  const navigate = useCallback((state: NavState) => {
    setNavState(state);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleQuizComplete = useCallback((result: QuizResultData) => {
    setQuizResult(result);
    setNavState({ view: "results" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleRetryQuiz = useCallback(() => {
    if (quizResult) {
      navigate({
        view: "quiz",
        topicId: quizResult.topicId,
        difficulty: quizResult.difficulty,
      });
    }
  }, [quizResult, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar currentView={navState.view} onNavigate={navigate} />

      <main className="flex-1">
        {navState.view === "home" && (
          <HomeView
            onSelectTopic={(topicId) => navigate({ view: "topic", topicId })}
          />
        )}

        {navState.view === "topic" && navState.topicId && (
          <TopicView
            topicId={navState.topicId}
            onBack={() => navigate({ view: "home" })}
            onStartQuiz={(topicId, difficulty) =>
              navigate({ view: "quiz", topicId, difficulty })
            }
          />
        )}

        {navState.view === "quiz" &&
          navState.topicId &&
          navState.difficulty && (
            <QuizView
              topicId={navState.topicId}
              difficulty={navState.difficulty}
              onComplete={handleQuizComplete}
              onQuit={() =>
                navigate({ view: "topic", topicId: navState.topicId })
              }
            />
          )}

        {navState.view === "results" && quizResult && (
          <ResultsView
            result={quizResult}
            onRetry={handleRetryQuiz}
            onBackToTopics={() => navigate({ view: "home" })}
          />
        )}

        {navState.view === "progress" && (
          <ProgressView
            onSelectTopic={(topicId) => navigate({ view: "topic", topicId })}
          />
        )}
      </main>

      <footer className="py-6 px-4 text-center text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
