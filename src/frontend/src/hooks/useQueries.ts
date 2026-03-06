import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Lesson,
  OverallStats,
  Question,
  QuizResult,
  Topic,
  UserProgress,
} from "../backend.d.ts";
import { useActor } from "./useActor";

export function useTopics() {
  const { actor, isFetching } = useActor();
  return useQuery<Topic[]>({
    queryKey: ["topics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopics();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLessonContent(topicId: string, difficulty: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson | null>({
    queryKey: ["lesson", topicId, difficulty],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLessonContent(topicId, difficulty);
    },
    enabled: !!actor && !isFetching && !!topicId && !!difficulty,
    staleTime: 10 * 60 * 1000,
  });
}

export function useQuestions(
  topicId: string,
  difficulty: string,
  enabled = false,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions", topicId, difficulty],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestions(topicId, difficulty);
    },
    enabled: !!actor && !isFetching && !!topicId && !!difficulty && enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserProgress() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProgress[]>({
    queryKey: ["userProgress"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserProgress();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
  });
}

export function useQuizHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<QuizResult[]>({
    queryKey: ["quizHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuizHistory();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
  });
}

export function useOverallStats() {
  const { actor, isFetching } = useActor();
  return useQuery<OverallStats>({
    queryKey: ["overallStats"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalCompleted: 0n,
          topicsStarted: 0n,
          totalQuizzesTaken: 0n,
          averageScore: 0,
        };
      }
      return actor.getOverallStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
  });
}

export function useSubmitQuizResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      topicId,
      difficulty,
      score,
      total,
    }: {
      topicId: string;
      difficulty: string;
      score: number;
      total: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitQuizResult(
        topicId,
        difficulty,
        BigInt(score),
        BigInt(total),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["quizHistory"] });
      queryClient.invalidateQueries({ queryKey: ["overallStats"] });
    },
  });
}
