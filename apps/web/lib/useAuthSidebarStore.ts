import { create } from "zustand";

export type AuthView = "login" | "register" | "forgot-password";

interface AuthSidebarState {
  isOpen: boolean;
  view: AuthView;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
  setView: (view: AuthView) => void;
}

export const useAuthSidebarStore = create<AuthSidebarState>((set) => ({
  isOpen: false,
  view: "login",
  openLogin: () => set({ isOpen: true, view: "login" }),
  openRegister: () => set({ isOpen: true, view: "register" }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));
