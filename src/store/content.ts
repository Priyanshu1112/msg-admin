/* eslint-disable @typescript-eslint/no-unused-vars */
import { Option, Question as dbQ } from "@prisma/client";
import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";
import useCategoryStore from "./category";
import { ParsedQuestion } from "@/app/(dahboard)/category/_components/forms/AddQuestion";

// Add MindMapNode interface (adjust based on your actual structure)
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

interface ContentState {
  mindMaps: MindMap[];
  questions: Question[];

  //   Loading states
  loadingMindMaps: boolean;
  loadingQuestions: boolean;

  //   Creating states
  creatingMindMaps: boolean;
  creatingQuestions: boolean;

  //   Updating states
  updatingMindMaps: boolean;
  updatingQuestions: boolean;

  //   Deleting states
  deletingMindMap: boolean;
  deletingQuestions: boolean;

  //   Actions
  createMindMaps: ({
    topicId,
    mindMaps,
  }: {
    topicId: string;
    mindMaps: MindMap[];
  }) => Promise<void>;
  createQuestions: ({
    topicId,
    questions,
  }: {
    topicId: string;
    questions: Question[];
  }) => Promise<void>;
  fetchMindMaps: (topicId: string) => Promise<void>;
  fetchQuestions: (topicId: string) => Promise<void>;
  updateMindMap: ({
    mindMapId,
    mindMap,
  }: {
    mindMapId: string;
    mindMap: MindMap;
  }) => Promise<void>;
  deleteMindMap: (id: string) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

const initialState = {
  mindMaps: [],
  questions: [],

  //   Loading states
  loadingMindMaps: false,
  loadingQuestions: false,
  //   Creating states
  creatingMindMaps: false,
  creatingQuestions: false,
  //   Updating states
  updatingMindMaps: false,
  updatingQuestions: false,
  //   Deleting states
  deletingMindMap: false,
  deletingQuestions: false,
};

const useContentStore = create<ContentState>((set, get) => ({
  ...initialState,

  async createMindMaps({ topicId, mindMaps }) {
    return catchStoreError(async () => {
      set({ creatingMindMaps: true });

      try {
        // Single API call for all mind maps
        const response = await fetch("/api/mind-map", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topicId,
            mindMaps: mindMaps, // Send array of mind maps
          }),
        });

        const result = await response.json();

        handleApiResponse(response.ok, result.message, () => {
          if (response.ok) {
            // Update local store with new mind maps
            set({ mindMaps: [...get().mindMaps, result.data] });

            // Update topic count in category store
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
      } catch (error) {
        handleApiResponse(false, "Failed to create mind maps", () => {});
      } finally {
        set({ creatingMindMaps: false });
      }
    });
  },

  async createQuestions({ topicId, questions }) {
    return catchStoreError(async () => {
      set({ creatingQuestions: true });

      try {
        // ✅ SINGLE API CALL - Matches your bulk API design
        const response = await fetch("/api/question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topicId,
            file: questions, // Your API expects 'file' field with questions array
          }),
        });

        const result = await response.json();

        handleApiResponse(
          response.ok,
          result.message ||
            `Successfully created ${questions.length} question(s)`,
          () => {
            if (response.ok) {
              // Update local store with new questions
              set({
                questions: [...get().questions, ...questions],
              });

              // Update topic count in category store
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
          }
        );
      } catch (error) {
        handleApiResponse(false, "Failed to create questions", () => {});
      } finally {
        set({ creatingQuestions: false });
      }
    });
  },

  async fetchMindMaps(topicId) {
    return catchStoreError(async () => {
      set({ loadingMindMaps: true });
      const res = await fetch(`/api/topic/${topicId}/mind-map`);

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({ mindMaps: response.data });
      });

      set({ loadingMindMaps: false });
    });
  },

  async fetchQuestions(topicId) {
    return catchStoreError(async () => {
      set({ loadingQuestions: true });
      const res = await fetch(`/api/topic/${topicId}/question`);

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({ questions: response.data });
      });

      set({ loadingQuestions: false });
    });
  },

  async updateMindMap({ mindMapId, mindMap }) {
    return catchStoreError(async () => {
      set({ updatingMindMaps: true });
      const res = await fetch("/api/mind-map/" + mindMapId, {
        method: "PUT",
        body: JSON.stringify(mindMap),
      });

      const response = await res.json();
      handleApiResponse(response.ok, response.message, () => {
        set({
          mindMaps: [
            ...get().mindMaps.map((m) =>
              m.id == mindMapId ? response.data : m
            ),
          ],
        });
      });

      set({ updatingMindMaps: false });
    });
  },

  async deleteMindMap(id) {
    return catchStoreError(async () => {
      set({ deletingMindMap: true });
      const res = await fetch("/api/mind-map/" + id, { method: "DELETE" });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ mindMaps: [...get().mindMaps.filter((m) => m.id != id)] });
      });

      set({ deletingMindMap: false });
    });
  },

  async deleteQuestion(id) {
    return catchStoreError(async () => {
      set({ deletingQuestions: true });
      const res = await fetch("/api/question/" + id, { method: "DELETE" });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ questions: [...get().questions.filter((q) => q.id != id)] });
      });

      set({ deletingQuestions: false });
    });
  },
}));

export default useContentStore;
