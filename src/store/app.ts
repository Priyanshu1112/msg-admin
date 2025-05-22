import { User } from "next-auth";
import { create } from "zustand";

interface AppState {
  error: string | null;
  user: Partial<User> | null;
  setError: (error: string | null) => void;
  setUser: (user: Partial<User> | null) => void;
}

const initialState = {
  error: null,
  user: null,
};

const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setError(error) {
    set({ error });
    setTimeout(() => {
      set({ error: null });
    }, 1000);
  },
  setUser(user) {
    set({ user });
  },
}));

export default useAppStore;
