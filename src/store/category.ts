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

export interface Stream {
  id: string;
  name: string;
  course: {
    id: string;
    name: string;
  }[];
}

interface CategoryState {
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  streams: Stream[];

  // Loading states
  loadingSubjects: boolean;
  loadingChapters: boolean;
  loadingTopics: boolean;
  loadingStreams: boolean;

  // Creating states
  creatingSubject: boolean;
  creatingChapter: boolean;
  creatingTopic: boolean;
  creatingStream: boolean;
  creatingCourse: boolean;

  // Deleting states
  deletingSubject: boolean;
  deletingChapter: boolean;
  deletingTopic: boolean;
  deletingStream: boolean;
  deletingCourse: boolean;

  // Actions
  fetchSubjects: (pageNumber?: number, search?: string) => Promise<void>;
  fetchChapters: (pageNumber?: number, search?: string) => Promise<void>;
  fetchTopics: (pageNumber?: number, search?: string) => Promise<void>;
  fetchStreams: () => Promise<void>;
  createStream: (name: string) => Promise<void>;
  createCourse: (name: string, streamId: string) => Promise<void>;
  deleteStream: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

const initialState = {
  subjects: [],
  chapters: [],
  topics: [],
  streams: [],

  // Loading
  loadingSubjects: false,
  loadingChapters: false,
  loadingTopics: false,
  loadingStreams: false,

  // Creating
  creatingSubject: false,
  creatingChapter: false,
  creatingTopic: false,
  creatingStream: false,
  creatingCourse: false,

  // Deleting
  deletingSubject: false,
  deletingChapter: false,
  deletingTopic: false,
  deletingStream: false,
  deletingCourse: false,
};

const useCategoryStore = create<CategoryState>((set, get) => ({
  ...initialState,

  async fetchSubjects(pageNumber = 1, search = "") {
    return catchStoreError(async () => {
      set({ loadingSubjects: true });
      const res = await fetch(
        `/api/subject?pageNumber=${pageNumber}&search=${search}`
      );
      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ subjects: response.data });
      });
      set({ loadingSubjects: false });
    });
  },

  async fetchChapters(pageNumber = 1, search = "") {
    return catchStoreError(async () => {
      set({ loadingChapters: true });
      const res = await fetch(
        `/api/chapter?pageNumber=${pageNumber}&search=${search}`
      );
      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ chapters: response.data });
      });
      set({ loadingChapters: false });
    });
  },

  async fetchTopics(pageNumber = 1, search = "") {
    return catchStoreError(async () => {
      set({ loadingTopics: true });
      const res = await fetch(
        `/api/topic?pageNumber=${pageNumber}&search=${search}`
      );
      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ topics: response.data });
      });
      set({ loadingTopics: false });
    });
  },

  async fetchStreams() {
    return catchStoreError(async () => {
      set({ loadingStreams: true });
      const res = await fetch("/api/stream");
      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ streams: response.data });
      });
      set({ loadingStreams: false });
    });
  },

  async createStream(name: string) {
    return catchStoreError(async () => {
      set({ creatingStream: true });
      const res = await fetch("/api/stream", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({ streams: [...(get().streams ?? []), response.data] });
      });
      set({ creatingStream: false });
    });
  },

  async createCourse(name, streamId) {
    return catchStoreError(async () => {
      set({ creatingCourse: true });
      const res = await fetch("/api/course", {
        method: "POST",
        body: JSON.stringify({ name, streamId }),
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          streams: get().streams.map((st) =>
            st.id === streamId
              ? { ...st, course: [...(st?.course ?? []), response.data] }
              : st
          ),
        });
      });
      set({ creatingCourse: false });
    });
  },

  async deleteStream(id: string) {
    return catchStoreError(async () => {
      set({ deletingStream: true });
      const res = await fetch(`/api/stream/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({ streams: get().streams.filter((st) => st.id !== id) });
      });
      set({ deletingStream: false });
    });
  },

  async deleteCourse(id: string) {
    return catchStoreError(async () => {
      set({ deletingCourse: true });
      const res = await fetch(`/api/course/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          streams: get().streams.map((st) => ({
            ...st,
            course: st.course.filter((c) => c.id !== id),
          })),
        });
      });
      set({ deletingCourse: false });
    });
  },
}));

export default useCategoryStore;
