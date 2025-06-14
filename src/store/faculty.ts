import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";
import { Faculty } from "@prisma/client";

interface FacultyState {
  faculties: Faculty[];
  loadingFaculty: boolean;
  creatingFaculty: boolean;
  updatingFaculty: boolean;
  deletingFaculty: boolean;

  fetchFaculties: () => Promise<void>;
  createFaculty: (formData: FormData) => Promise<void>;
  updateFaculty: (id: string, formData: FormData) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
}

const useFacultyStore = create<FacultyState>((set, get) => ({
  faculties: [],
  loadingFaculty: false,
  creatingFaculty: false,
  updatingFaculty: false,
  deletingFaculty: false,

  async fetchFaculties() {
    return catchStoreError(async () => {
      set({ loadingFaculty: true });
      const res = await fetch("/api/faculty");
      const response = await res.json();

      handleApiResponse(res.ok, response.message, () => {
        set({ faculties: response.data });
      });
      set({ loadingFaculty: false });
    });
  },

  async createFaculty(formData) {
    return catchStoreError(async () => {
      set({ creatingFaculty: true });
      const res = await fetch("/api/faculty", {
        method: "POST",
        body: formData,
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({ faculties: [...get().faculties, response.data] });
      });
      set({ creatingFaculty: false });
    });
  },

  async updateFaculty(id, formData) {
    return catchStoreError(async () => {
      set({ updatingFaculty: true });
      const res = await fetch(`/api/faculty/${id}`, {
        method: "PUT",
        body: formData,
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          faculties: get().faculties.map((faculty) =>
            faculty.id === id ? response.data : faculty
          ),
        });
      });
      set({ updatingFaculty: false });
    });
  },

  async deleteFaculty(id) {
    return catchStoreError(async () => {
      set({ deletingFaculty: true });
      const res = await fetch(`/api/faculty/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();
      handleApiResponse(res.ok, response.message, () => {
        set({
          faculties: get().faculties.filter((faculty) => faculty.id !== id),
        });
      });
      set({ deletingFaculty: false });
    });
  },
}));

export default useFacultyStore;
