/* eslint-disable @typescript-eslint/no-unused-vars */
import { Option, Question as dbQ } from "@prisma/client";
import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";
import useCategoryStore from "./category";

// Add MindMapNode interface (adjust based on your actual structure)
export interface MindMapNode {
  id: string;
  name: string;
  color: string;
  table: boolean;
  children: MindMapNode[];
}

export interface Question extends dbQ {
  options: Option[];
}

interface ContentState {
  mindMaps: MindMapNode[];
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
  deletingMindMaps: boolean;
  deletingQuestions: boolean;

  //   Actions
  createMindMaps: ({
    topicId,
    mindMaps,
  }: {
    topicId: string;
    mindMaps: MindMapNode[];
  }) => Promise<void>;
  createQuestions: ({
    topicId,
    questions,
  }: {
    topicId: string;
    questions: Question[];
  }) => Promise<void>;
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
  deletingMindMaps: false,
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
            set({
              mindMaps: [...get().mindMaps, ...mindMaps],
            });

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
}));

export default useContentStore;
