import { FlashCard, Option, Video, Question as dbQ } from "@prisma/client";
import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";
import useCategoryStore from "./category";
import { ParsedQuestion } from "@/app/(dahboard)/category/_components/forms/AddQuestion";
import { ParsedFlashCard } from "@/app/(dahboard)/_parser/flash-cards";

interface MindMapNode {
  id: string;
  name: string;
  color: string;
  table: boolean;
  children: MindMapNode[];
}

export interface MindMap {
  id: string;
  name: string;
  mindMap: MindMapNode[];
  description: string;
}

export interface Question extends dbQ {
  options: Option[];
}

export interface TaggedImg {
  tag: string;
  data: string;
}

export interface QuestionBundle {
  id: string;
  name: string;
  description: string;
  _count: { question: number };
}

export interface FcBundle {
  id: string;
  name: string;
  description: string;
  _count: { question: number };
}

export interface CreateQuestionBundle {
  name: string;
  questions: ParsedQuestion[];
  description?: string;
}

export interface CreateFcBundle {
  name: string;
  flashcards: ParsedFlashCard[];
  description?: string;
}

interface ContentState {
  mindMaps: MindMap[];
  questions: Question[];
  questionBundles: QuestionBundle[];
  fcBundles: FcBundle[];
  flashCards: FlashCard[];
  videos: Video[];

  loadingMindMaps: boolean;
  loadingQuestions: boolean;
  loadingQuestionBundles: boolean;
  loadingFcBundles: boolean;
  loadingFlashCards: boolean;
  loadingVideo: boolean;

  creatingMindMaps: boolean;
  creatingQuestions: boolean;
  creatingQuestionBundles: boolean;
  creatingFcBundles: boolean;
  creatingFlashCards: boolean;
  creatingVideos: boolean;

  updatingMindMaps: boolean;
  updatingQuestions: boolean;
  updatingQuestionBundles: boolean;
  updatingFcBundles: boolean;
  updatingFc: boolean;
  updatingVideo: boolean;

  deletingMindMap: boolean;
  deletingQuestions: boolean;
  deletingQuestionBundle: boolean;
  deletingFcBundle: boolean;
  deletingFlashCard: boolean;
  deletingFlashCardBundle: boolean;
  deletingVideo: boolean;

  createMindMaps: (args: {
    topicId: string;
    mindMaps: MindMap[];
  }) => Promise<void>;
  createQuestions: (args: {
    topicId: string;
    questions: Question[];
  }) => Promise<void>;
  createQuestionBundles: (args: {
    topicId: string;
    bundles: CreateQuestionBundle[];
  }) => Promise<void>;

  fetchMindMaps: (topicId: string) => Promise<void>;
  fetchQuestions: (bundleId: string) => Promise<void>;
  fetchQuestionBundles: (topicId: string) => Promise<void>;

  updateMindMap: (args: {
    mindMapId: string;
    mindMap?: MindMap;
    name?: string;
    description?: string | null;
  }) => Promise<void>;
  updateQuestionBundle: (args: {
    bundleId: string;
    bundle: Partial<QuestionBundle>;
  }) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;

  deleteMindMap: (id: string) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  deleteQuestionBundle: (id: string) => Promise<void>;

  fetchFlashCards: (bundleId: string) => Promise<void>;
  fetchFlashCardBundles: (topicId: string) => Promise<void>;
  createFlashCards: (
    cards: ParsedFlashCard[],
    bundleId: string
  ) => Promise<void>;
  createFlashCardBundles: (args: {
    topicId: string;
    bundles: FcBundle[];
  }) => Promise<void>;
  updateFc: (fc: FlashCard) => Promise<void>;
  deleteFlashCard: (id: string) => Promise<void>;
  deleteFlashCardBundle: (id: string) => Promise<void>;

  fetchVideos: (topicId: string) => Promise<void>;
  createVideos: ({
    topicId,
    videos,
  }: {
    topicId: string;
    videos: string[];
  }) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
}

const initialState = {
  mindMaps: [],
  questions: [],
  questionBundles: [],
  fcBundles: [],
  flashCards: [],
  videos: [],

  loadingMindMaps: false,
  loadingQuestions: false,
  loadingQuestionBundles: false,
  loadingFcBundles: false,
  loadingFlashCards: false,
  loadingVideo: false,

  creatingMindMaps: false,
  creatingQuestions: false,
  creatingQuestionBundles: false,
  creatingFcBundles: false,
  creatingFlashCards: false,
  creatingVideos: false,

  updatingMindMaps: false,
  updatingQuestions: false,
  updatingQuestionBundles: false,
  updatingFcBundles: false,
  updatingFc: false,
  updatingVideo: false,

  deletingMindMap: false,
  deletingQuestions: false,
  deletingQuestionBundle: false,
  deletingFcBundle: false,
  deletingFlashCard: false,
  deletingFlashCardBundle: false,
  deletingVideo: false,
};

const useContentStore = create<ContentState>((set, get) => ({
  ...initialState,

  async createMindMaps({ topicId, mindMaps }) {
    return catchStoreError(async () => {
      set({ creatingMindMaps: true });
      const res = await fetch("/api/mind-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, mindMaps }),
      });

      const result = await res.json();

      handleApiResponse(res.ok, result.message, () => {
        if (res.ok) {
          set({ mindMaps: [...get().mindMaps, result.data] });
          const { topics } = useCategoryStore.getState();
          const updatedTopics = topics.map((topic) =>
            topic.id === topicId
              ? {
                ...topic,
                _count: {
                  ...topic._count,
                  mindMaps: topic._count.mindMaps + mindMaps.length,
                },
              }
              : topic
          );
          useCategoryStore.setState({ topics: updatedTopics });
        }
      });

      set({ creatingMindMaps: false });
    });
  },

  async createQuestions({ topicId, questions }) {
    return catchStoreError(async () => {
      set({ creatingQuestions: true });
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, file: questions }),
      });

      const result = await res.json();

      handleApiResponse(res.ok, result.message, () => {
        if (res.ok) {
          set({ questions: [...get().questions, ...questions] });
          const { topics } = useCategoryStore.getState();
          const updatedTopics = topics.map((topic) =>
            topic.id === topicId
              ? {
                ...topic,
                _count: {
                  ...topic._count,
                  question: topic._count.question + questions.length,
                },
              }
              : topic
          );
          useCategoryStore.setState({ topics: updatedTopics });
        }
      });

      set({ creatingQuestions: false });
    });
  },

  async createQuestionBundles({ topicId, bundles }) {
    return catchStoreError(async () => {
      set({ creatingQuestionBundles: true });
      const res = await fetch("/api/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, bundles }),
      });

      const result = await res.json();

      handleApiResponse(res.ok, result.message, () => {
        if (res.ok) {
          set({ questionBundles: [...get().questionBundles, ...result.data] });
          const totalQuestions = bundles.reduce(
            (sum, b) => sum + b.questions.length,
            0
          );
          const { topics } = useCategoryStore.getState();
          const updatedTopics = topics.map((topic) =>
            topic.id === topicId
              ? {
                ...topic,
                _count: {
                  ...topic._count,
                  question: topic._count.question + totalQuestions,
                },
              }
              : topic
          );
          useCategoryStore.setState({ topics: updatedTopics });
        }
      });

      set({ creatingQuestionBundles: false });
    });
  },

  async fetchMindMaps(topicId) {
    return catchStoreError(async () => {
      set({ loadingMindMaps: true });
      const res = await fetch(`/api/topic/${topicId}/mind-map`);
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ mindMaps: result.data });
      });
      set({ loadingMindMaps: false });
    });
  },

  async fetchQuestions(bundleId) {
    return catchStoreError(async () => {
      set({ loadingQuestions: true });
      const res = await fetch(`/api/bundle/${bundleId}/question`);
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ questions: result.data });
      });
      set({ loadingQuestions: false });
    });
  },

  async fetchQuestionBundles(topicId) {
    return catchStoreError(async () => {
      set({ loadingQuestionBundles: true });
      const res = await fetch(`/api/topic/${topicId}/bundle?type=MCQ`);
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ questionBundles: result.data });
      });
      set({ loadingQuestionBundles: false });
    });
  },

  async updateMindMap({ mindMapId, mindMap, name, description }) {
    return catchStoreError(async () => {
      set({ updatingMindMaps: true });
      const res = await fetch(`/api/mind-map/${mindMapId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          description,
          mindMap: JSON.stringify(mindMap),
        }),
      });
      const result = await res.json();
      handleApiResponse(result.ok, result.message, () => {
        set({
          mindMaps: get().mindMaps.map((m) =>
            m.id === mindMapId ? result.data : m
          ),
        });
      });
      set({ updatingMindMaps: false });
    });
  },

  async updateQuestionBundle({ bundleId, bundle }) {
    return catchStoreError(async () => {
      set({ updatingQuestionBundles: true });
      const res = await fetch(`/api/bundle/${bundleId}`, {
        method: "PUT",
        body: JSON.stringify(bundle),
      });
      const result = await res.json();
      handleApiResponse(result.ok, result.message, () => {
        set({
          questionBundles: get().questionBundles.map((b) =>
            b.id === bundleId ? result.data : b
          ),
        });
      });
      set({ updatingQuestionBundles: false });
    });
  },

  async updateQuestion(question) {
    return catchStoreError(async () => {
      set({ updatingQuestions: true });
      const res = await fetch("/api/question/" + question.id, {
        method: "PUT",
        body: JSON.stringify(question),
      });
      const result = await res.json();

      handleApiResponse(result.ok, result.message, () => {
        set({
          questions: [
            ...get().questions.map((q) =>
              q.id == question.id ? result.data : q
            ),
          ],
        });
      });

      set({ updatingQuestions: false });
    });
  },

  async deleteMindMap(id) {
    return catchStoreError(async () => {
      set({ deletingMindMap: true });
      const res = await fetch(`/api/mind-map/${id}`, { method: "DELETE" });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ mindMaps: get().mindMaps.filter((m) => m.id !== id) });
      });
      set({ deletingMindMap: false });
    });
  },

  async deleteQuestion(id) {
    return catchStoreError(async () => {
      set({ deletingQuestions: true });
      const res = await fetch(`/api/question/${id}`, { method: "DELETE" });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ questions: get().questions.filter((q) => q.id !== id) });
      });
      set({ deletingQuestions: false });
    });
  },

  async deleteQuestionBundle(id) {
    return catchStoreError(async () => {
      set({ deletingQuestionBundle: true });
      const res = await fetch(`/api/bundle/${id}`, { method: "DELETE" });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({
          questionBundles: get().questionBundles.filter((b) => b.id !== id),
        });
      });
      set({ deletingQuestionBundle: false });
    });
  },

  async fetchFlashCards(bundleId) {
    return catchStoreError(async () => {
      set({ loadingFlashCards: true });
      const res = await fetch(`/api/bundle/${bundleId}/flashcard`);
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ flashCards: result.data });
      });
      set({ loadingFlashCards: false });
    });
  },

  async fetchFlashCardBundles(topicId) {
    return catchStoreError(async () => {
      set({ loadingFcBundles: true });
      const res = await fetch(`/api/topic/${topicId}/bundle?type=FlashCard`);
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ fcBundles: result.data });
      });
      set({ loadingFcBundles: false });
    });
  },

  async createFlashCards(cards, bundleId) {
    return catchStoreError(async () => {
      set({ creatingFlashCards: true });
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards, bundleId }),
      });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ flashCards: [...get().flashCards, ...result.data] });
      });
      set({ creatingFlashCards: false });
    });
  },

  async createFlashCardBundles(bundles) {
    return catchStoreError(async () => {
      set({ creatingFcBundles: true });
      const res = await fetch("/api/bundle/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundles),
      });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ fcBundles: [...get().fcBundles, ...result.data] });
      });
      set({ creatingFcBundles: false });
    });
  },

  async updateFc(fc) {
    return catchStoreError(async () => {
      set({ updatingFc: true });
      const res = await fetch(`/api/flashcard/${fc.id}`, {
        method: "PUT",
        body: JSON.stringify(fc),
      });

      const result = await res.json();
      handleApiResponse(
        res.ok,
        result.message ?? "Flashcard updated successfully!",
        () => {
          set({
            flashCards: [
              ...get().flashCards.map((f) => (f.id == fc.id ? result.data : f)),
            ],
          });
        }
      );

      set({ updatingFc: false });
    });
  },

  async deleteFlashCard(id) {
    return catchStoreError(async () => {
      set({ deletingFlashCard: true });
      const res = await fetch(`/api/flashcards/${id}`, { method: "DELETE" });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ flashCards: get().flashCards.filter((f) => f.id !== id) });
      });
      set({ deletingFlashCard: false });
    });
  },

  async deleteFlashCardBundle(id) {
    return catchStoreError(async () => {
      set({ deletingFlashCardBundle: true });
      const res = await fetch(`/api/flashcard-bundles/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ fcBundles: get().fcBundles.filter((b) => b.id !== id) });
      });
      set({ deletingFlashCardBundle: false });
    });
  },

  async fetchVideos(topicId) {
    return catchStoreError(async () => {
      set({ loadingVideo: true });
      const res = await fetch(`/api/topic/${topicId}/video`);

      const result = await res.json();
      handleApiResponse(res.ok, result.message, () => {
        set({ videos: result.data });
      });

      set({ loadingVideo: false });
    });
  },

  async createVideos({ topicId, videos }) {
    return catchStoreError(async () => {
      set({ creatingVideos: true });
      const res = await fetch("/api/video", {
        method: "POST",
        body: JSON.stringify({ topicId, videos }),
      });

      const response = await res.json();

      handleApiResponse(
        res.ok,
        response.message ?? "Videos added successfully!",
        () => {
          set({ videos: [...get().videos, response.data] });
        }
      );

      set({ creatingVideos: false });
    });
  },

  async deleteVideo(videoId) {
    return catchStoreError(async () => {
      set({ deletingVideo: true });
      const res = await fetch("/api/video/" + videoId, { method: "DELETE" });
      const result = await res.json();

      handleApiResponse(res.ok, result.message, () => {
        set({ videos: [...get().videos.filter((v) => v.id != videoId)] });
      });

      set({ deletingVideo: false });
    });
  },
}));

export default useContentStore;
