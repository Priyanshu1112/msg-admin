import { Admin } from "@prisma/client";
import { create } from "zustand";
import { catchStoreError } from "./_utils/catchStoreError";
import { handleApiResponse } from "./_utils/handleApiResponse";
import { fetchPOST, fetchPUT, fetchDELETE } from "./_utils/fetchHelp";

interface AdminState {
  admins: Admin[];
  loadingAdmin: boolean;
  creatingAdmin: boolean;
  updatingAdmin: boolean;
  deletingAdmin: boolean;

  fetchAdmins: () => Promise<void>;
  createAdmin: (formData: FormData) => Promise<void>;
  updateAdmin: (id: string, formData: FormData) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
}

const useAdminStore = create<AdminState>((set, get) => ({
  admins: [],
  loadingAdmin: false,
  creatingAdmin: false,
  updatingAdmin: false,
  deletingAdmin: false,

  fetchAdmins: async () => {
    return catchStoreError(async () => {
      set({ loadingAdmin: true });
      const response = await fetch("/api/admin");
      const data = await response.json();
      handleApiResponse(true, data.message, () => {
        set({ admins: data });
      });
      set({ loadingAdmin: false });
    });
  },

  createAdmin: async (formData) => {
    return catchStoreError(async () => {
      set({ creatingAdmin: true });
      const response = await fetchPOST("/api/admin", formData);
      handleApiResponse(true, response.message, () => {
        set({ admins: [...get().admins, response.data] });
      });
      set({ creatingAdmin: false });
    });
  },

  updateAdmin: async (id, formData) => {
    return catchStoreError(async () => {
      set({ updatingAdmin: true });
      const response = await fetchPUT(`/api/admin/${id}`, formData);
      handleApiResponse(true, response.message, () => {
        set({
          admins: get().admins.map((admin) =>
            admin.id === id ? response.data : admin
          ),
        });
      });
      set({ updatingAdmin: false });
    });
  },

  deleteAdmin: async (id) => {
    return catchStoreError(async () => {
      set({ deletingAdmin: true });
      const response = await fetchDELETE(`/api/admin/${id}`);
      handleApiResponse(true, response.message, () => {
        set({ admins: get().admins.filter((admin) => admin.id !== id) });
      });
      set({ deletingAdmin: false });
    });
  },
}));

export default useAdminStore;
