import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BranchState {
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number) => void;
}

/**
 * Zustand store for managing the selected branch across the application.
 * Persists the selected branch ID in local storage.
 */
export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selectedBranchId: null,
      setSelectedBranchId: (id) => set({ selectedBranchId: id }),
    }),
    {
      name: 'branch-storage',
    }
  )
);
