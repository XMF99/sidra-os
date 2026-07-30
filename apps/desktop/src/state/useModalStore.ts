import { create } from 'zustand';
import { ReactNode } from 'react';

export interface ModalOptions {
  id: string;
  title: string;
  content: ReactNode;
  width?: number | string;
}

interface ModalState {
  activeModal: ModalOptions | null;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,
  confirmDialog: null,

  openModal: (options) => set({ activeModal: options }),
  closeModal: () => set({ activeModal: null }),

  openConfirm: (title, message, onConfirm) =>
    set({
      confirmDialog: { isOpen: true, title, message, onConfirm },
    }),
  closeConfirm: () => set({ confirmDialog: null }),
}));
