import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";

// Types based on the API responses
export interface Subject {
  id: string;
  name: string;
  year: number;
  country: string;
  _count: {
    chapters: number;
    topics: number;
    mindMaps: number;
    questions: number;
  };
}

export interface Chapter {
  id: string;
  name: string;
  _count: {
    topics: number;
    mindMaps: number;
    questions: number;
  };
}

export interface Topic {
  id: string;
  name: string;
  _count: {
    mindMaps: number;
    question: number;
  };
}

interface CategoryState {
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];

  // Loading states
  subjectsLoading: boolean;
  chaptersLoading: boolean;
  topicsLoading: boolean;

  // Actions
  fetchSubjects: (pageNumber?: number, search?: string) => Promise<void>;
  fetchChapters: (pageNumber?: number, search?: string) => Promise<void>;
  fetchTopics: (pageNumber?: number, search?: string) => Promise<void>;
}

const initialState = {
  // Data
  subjects: [],
  chapters: [],
  topics: [],

  // Loading states
  subjectsLoading: false,
  chaptersLoading: false,
  topicsLoading: false,
};

const useCategoryStore = create<CategoryState>((set) => ({
  ...initialState,

  async fetchSubjects(pageNumber = 1, search = "") {
    return catchStoreError(async () => {
      set({ subjectsLoading: true });
      const res = await fetch(
        `/api/subject?pageNumber=${pageNumber}&search=${search}`
      );

      const response = await res.json();

      handleApiResponse(res.ok, () => {
        set({ subjects: response.data });
      });
      set({ subjectsLoading: false });
    });
  },
  async fetchChapters(pageNumber = 1, search = "") {
    return catchStoreError(async () => {
      set({ chaptersLoading: true });
      const res = await fetch(
        `/api/chapter?pageNumber=${pageNumber}&search=${search}`
      );

      const response = await res.json();

      handleApiResponse(res.ok, () => {
        set({ chapters: response.data });
      });
      set({ chaptersLoading: false });
    });
  },
  async fetchTopics(pageNumber = 1, search = "") {
    return catchStoreError(async () => {
      set({ topicsLoading: true });
      const res = await fetch(
        `/api/topic?pageNumber=${pageNumber}&search=${search}`
      );

      const response = await res.json();

      handleApiResponse(res.ok, () => {
        set({ topics: response.data });
      });
      set({ topicsLoading: false });
    });
  },
}));

export default useCategoryStore;
