import { BarChart3, BookOpen } from "lucide-react";
import type { AppView, NavState } from "../App";

interface NavBarProps {
  currentView: AppView;
  onNavigate: (state: NavState) => void;
}

export default function NavBar({ currentView, onNavigate }: NavBarProps) {
  const isHome =
    currentView === "home" ||
    currentView === "topic" ||
    currentView === "quiz" ||
    currentView === "results";
  const isProgress = currentView === "progress";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate({ view: "home" })}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-xl font-bold shadow-sm">
            <span className="text-white text-sm font-display font-black">
              M
            </span>
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            Math<span className="text-primary">Quest</span>
          </span>
        </button>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 bg-muted rounded-xl p-1">
          <button
            type="button"
            data-ocid="nav.home.tab"
            onClick={() => onNavigate({ view: "home" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isHome
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen size={15} />
            <span className="hidden sm:inline">Learn</span>
          </button>
          <button
            type="button"
            data-ocid="nav.progress.tab"
            onClick={() => onNavigate({ view: "progress" })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isProgress
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 size={15} />
            <span className="hidden sm:inline">Progress</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
