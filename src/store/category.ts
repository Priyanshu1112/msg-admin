import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";

interface IdName {
  id: string;
  name: string;
}

// Types based on the API responses
export interface Subject {
  id: string;
  name: string;
  year: number[];
  country: string;
  stream: IdName;
  course: IdName;
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
  subject: IdName;
  _count: {
    topics: number;
    mindMaps: number;
    questions: number;
  };
}

export interface Topic {
  id: string;
  name: string;
  chapter: IdName;
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

  // Updating
  updatingSubject: boolean;
  updatingChapter: boolean;
  updatingTopic: boolean;

  // Deleting states
  deletingSubject: boolean;
  deletingChapter: boolean;
  deletingTopic: boolean;
  deletingStream: boolean;
  deletingCourse: boolean;

  //activeIds
  activeSubjectId: string;
  activeChapterId: string;
  activeTopicId: string;

  // Actions
  fetchSubjects: (pageNumber?: number, search?: string) => Promise<void>;
  fetchChapters: (pageNumber?: number, search?: string) => Promise<void>;
  fetchTopics: (pageNumber?: number, search?: string) => Promise<void>;
  fetchStreams: () => Promise<void>;
  createSubject: (subjectBody: object) => Promise<void>;
  updateSubject: (subjectBody: object & { id: string }) => Promise<void>;
  updateChapter: (body: {
    id: string;
    subjectId?: string;
    name?: string;
  }) => Promise<void>;
  updateTopic: (body: {
    id: string;
    chapterId?: string;
    name?: string;
  }) => Promise<void>;
  createChapters: ({
    subjectId,
    names,
  }: {
    subjectId: string;
    names: string[];
  }) => Promise<void>;
  createTopics: ({
    chapterId,
    names,
  }: {
    chapterId: string;
    names: string[];
  }) => Promise<void>;
  createStream: (name: string) => Promise<void>;
  createCourse: (name: string, streamId: string) => Promise<void>;
  deleteStream: (id: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  setActiveSubjectId: (id: string) => void;
  setActiveChapterId: (id: string) => void;
  setActiveTopicId: (id: string) => void;
}

const initialState = {
  subjects: [],
  chapters: [],
  topics: [],
  streams: [],

  //activeIds
  activeSubjectId: "",
  activeChapterId: "",
  activeTopicId: "",

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

  // Updating
  updatingSubject: false,
  updatingChapter: false,
  updatingTopic: false,

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

  async createSubject(subjectBody) {
    return catchStoreError(async () => {
      set({ creatingSubject: true });
      const res = await fetch("/api/subject", {
        method: "POST",
        body: JSON.stringify(subjectBody),
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({ subjects: [...(get().subjects ?? []), response.data] });
      });

      set({ creatingSubject: false });
    });
  },

  async createChapters({ subjectId, names }) {
    return catchStoreError(async () => {
      set({ creatingChapter: true });
      const res = await fetch("/api/chapter", {
        method: "POST",
        body: JSON.stringify({ subjectId, names }),
      });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set((state) => {
          return {
            ...state,
            subjects: state.subjects.map((sub) =>
              sub.id == subjectId ? response.data.subject : sub
            ),
            chapters: [...state.chapters, response.data.chapters],
          };
        });
      });
      set({ creatingChapter: false });
    });
  },

  async createTopics({ chapterId, names }) {
    return catchStoreError(async () => {
      set({ creatingTopic: true });
      const res = await fetch("/api/topic", {
        method: "POST",
        body: JSON.stringify({ chapterId, names }),
      });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set((state) => {
          return {
            ...state,
            chapters: state.chapters.map((sub) =>
              sub.id == chapterId ? response.data.chapter : sub
            ),
            topics: [...state.topics, response.data.topics],
          };
        });
      });
      set({ creatingTopic: false });
    });
  },

  async updateSubject(subjectBody) {
    return catchStoreError(async () => {
      set({ updatingSubject: true });
      const res = await fetch("/api/subject/" + subjectBody.id, {
        method: "PUT",
        body: JSON.stringify(subjectBody),
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          subjects: get().subjects.map((sub) =>
            sub.id == subjectBody.id ? response.data : sub
          ),
        });
      });

      set({ updatingSubject: false });
    });
  },

  async updateChapter(body) {
    return catchStoreError(async () => {
      set({ updatingChapter: true });
      const res = await fetch("/api/chapter/" + body.id, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          chapters: get().chapters.map((ch) =>
            ch.id == body.id ? response.data : ch
          ),
        });
      });

      set({ updatingChapter: false });
    });
  },
  async updateTopic(body) {
    return catchStoreError(async () => {
      set({ updatingTopic: true });
      const res = await fetch("/api/topic/" + body.id, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          topics: get().topics.map((top) =>
            top.id == body.id ? response.data : top
          ),
        });
      });

      set({ updatingTopic: false });
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

  async deleteSubject(id: string) {
    return catchStoreError(async () => {
      set({ deletingSubject: true });

      const res = await fetch(`/api/subject/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({
          subjects: get().subjects.filter((subject) => subject.id !== id),
        });
      });

      set({ deletingSubject: false });
    });
  },

  async deleteChapter(id: string) {
    return catchStoreError(async () => {
      set({ deletingChapter: true });

      const res = await fetch(`/api/chapter/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({
          chapters: get().chapters.filter((chapter) => chapter.id !== id),
        });
      });

      set({ deletingChapter: false });
    });
  },

  async deleteTopic(id: string) {
    return catchStoreError(async () => {
      set({ deletingTopic: true });

      const res = await fetch(`/api/topic/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({
          topics: get().topics.filter((topic) => topic.id !== id),
        });
      });

      set({ deletingTopic: false });
    });
  },

  setActiveSubjectId(id) {
    set({ activeSubjectId: id });
  },

  setActiveChapterId(id) {
    set({ activeChapterId: id });
  },

  setActiveTopicId(id) {
    set({ activeTopicId: id });
  },
}));

export default useCategoryStore;
