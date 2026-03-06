# MathQuest - Math Learning App

## Current State
New project with no existing frontend or backend code.

## Requested Changes (Diff)

### Add
- **Topics**: Interactive lessons for addition, subtraction, multiplication, division, fractions, and basic algebra.
- **Difficulty Levels**: Easy, Medium, Hard -- affects problem complexity and number ranges.
- **Quizzes**: Multiple-choice and fill-in-the-blank questions per topic with instant right/wrong feedback.
- **Progress Tracker**: Per-user tracking of completed topics, quiz scores, streaks, and overall completion percentage.
- **Lesson Content**: Step-by-step explanations with worked examples for each topic.
- **Home/Dashboard**: Overview of topics, progress summary, and quick-start buttons.
- **Quiz Result Screen**: Score breakdown after each quiz with encouragement messages.
- **Backend Data Models**: Topic, Lesson, Question, UserProgress, QuizResult.

### Modify
Nothing -- new project.

### Remove
Nothing -- new project.

## Implementation Plan

### Backend (Motoko)
1. Define `Topic` type: id, name, description, difficulty levels available.
2. Define `Lesson` type: topicId, difficulty, title, content (step-by-step text), examples.
3. Define `Question` type: topicId, difficulty, prompt, options (for multiple choice), correct answer, explanation.
4. Define `UserProgress` type: topicId, difficulty, quizzesTaken, bestScore, completed.
5. Define `QuizResult` type: topicId, difficulty, score, total, timestamp.
6. Seed data: 6 topics x 3 difficulties = 18 lesson entries, ~5 questions each (90 questions total).
7. APIs:
   - `getTopics()` -> list of all topics
   - `getLessons(topicId, difficulty)` -> lesson content
   - `getQuestions(topicId, difficulty)` -> list of questions (shuffled subset)
   - `submitQuizResult(topicId, difficulty, score, total)` -> stores result, updates progress
   - `getUserProgress()` -> all progress records
   - `getQuizHistory()` -> past quiz results

### Frontend (React + TypeScript)
1. **Dashboard/Home page**: Grid of topic cards showing topic name, icon, difficulty badges, and completion status.
2. **Topic page**: Lesson content viewer with difficulty selector; next button to start quiz.
3. **Quiz page**: Question-by-question interface, answer selection, instant feedback with explanation, progress bar.
4. **Results page**: Score display, topic completion update, retry and back buttons.
5. **Progress page**: Overall stats (topics completed, average score, streak), per-topic progress cards.
6. **Navigation**: Top nav with Home, Progress tabs.
7. Deterministic `data-ocid` markers on all interactive surfaces.
