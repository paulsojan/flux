import { create } from "zustand";

type ComposeEmail = {
  to?: string;
  subject: string;
  body: string;
};

type ComposeStore = {
  email: ComposeEmail | null;
  setEmail: (draft: ComposeEmail) => void;
  clearEmail: () => void;
};

export const useComposeStore = create<ComposeStore>((set) => ({
  email: null,
  setEmail: (email) => set({ email }),
  clearEmail: () => set({ email: null }),
}));
