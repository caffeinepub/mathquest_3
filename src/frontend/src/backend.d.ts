import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lesson {
    title: string;
    content: Array<string>;
    difficulty: string;
    examples: Array<string>;
    topicId: string;
}
export interface Topic {
    id: string;
    icon: string;
    name: string;
    description: string;
    availableDifficulties: Array<string>;
}
export interface QuizResult {
    id: bigint;
    total: bigint;
    difficulty: string;
    score: bigint;
    timestamp: bigint;
    topicId: string;
}
export interface Question {
    id: bigint;
    difficulty: string;
    explanation: string;
    correctAnswer: string;
    questionType: string;
    prompt: string;
    options: Array<string>;
    topicId: string;
}
export interface OverallStats {
    totalCompleted: bigint;
    topicsStarted: bigint;
    totalQuizzesTaken: bigint;
    averageScore: number;
}
export interface UserProgress {
    difficulty: string;
    completed: boolean;
    bestScore: bigint;
    totalQuestions: bigint;
    quizzesTaken: bigint;
    topicId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getLessonContent(topicId: string, difficulty: string): Promise<Lesson | null>;
    getOverallStats(): Promise<OverallStats>;
    getQuestions(topicId: string, difficulty: string): Promise<Array<Question>>;
    getQuizHistory(): Promise<Array<QuizResult>>;
    getTopics(): Promise<Array<Topic>>;
    getUserProgress(): Promise<Array<UserProgress>>;
    isCallerAdmin(): Promise<boolean>;
    submitQuizResult(topicId: string, difficulty: string, score: bigint, total: bigint): Promise<QuizResult>;
}
