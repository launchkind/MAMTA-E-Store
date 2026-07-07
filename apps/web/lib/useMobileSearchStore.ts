import { create } from "zustand";

interface MobileSearchStore {
  showSearch: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useMobileSearchStore = create<MobileSearchStore>((set) => ({
  showSearch: false,
  toggle: () => set((s) => ({ showSearch: !s.showSearch })),
  open: () => set({ showSearch: true }),
  close: () => set({ showSearch: false }),
}));
