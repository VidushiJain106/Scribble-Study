
import { create } from 'zustand';
import { FocusMode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FocusState {
  focusModes: FocusMode[];
  activeFocusMode: string | null;
  createFocusMode: () => string;
  updateFocusMode: (id: string, data: Partial<FocusMode>) => void;
  deleteFocusMode: (id: string) => void;
  activateFocusMode: (id: string) => void;
  deactivateFocusMode: () => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  focusModes: [
    {
      id: '1',
      name: 'Deep Work',
      icon: 'brain',
      muteNotifications: true,
      muteCalls: true,
      blockEntertainmentApps: true,
      blockAllApps: false,
      duration: 60,
      isActive: false,
      color: '#8b5cf6',
    },
    {
      id: '2',
      name: 'Study Time',
      icon: 'book',
      muteNotifications: true,
      muteCalls: false,
      blockEntertainmentApps: true,
      blockAllApps: false,
      duration: 45,
      isActive: false,
      color: '#3b82f6',
    },
    {
      id: '3',
      name: 'Do Not Disturb',
      icon: 'moon',
      muteNotifications: true,
      muteCalls: true,
      blockEntertainmentApps: false,
      blockAllApps: false,
      duration: 30,
      isActive: false,
      color: '#ef4444',
    }
  ],
  activeFocusMode: null,

  createFocusMode: () => {
    const id = uuidv4();
    set((state) => ({
      focusModes: [
        ...state.focusModes,
        {
          id,
          name: 'New Focus Mode',
          muteNotifications: false,
          muteCalls: false,
          blockEntertainmentApps: false,
          blockAllApps: false,
          duration: 30,
          isActive: false,
          color: '#8b5cf6',
        },
      ],
    }));
    return id;
  },

  updateFocusMode: (id, data) => {
    set((state) => ({
      focusModes: state.focusModes.map((mode) =>
        mode.id === id ? { ...mode, ...data } : mode
      ),
    }));
  },

  deleteFocusMode: (id) => {
    set((state) => ({
      focusModes: state.focusModes.filter((mode) => mode.id !== id),
      activeFocusMode: state.activeFocusMode === id ? null : state.activeFocusMode,
    }));
  },

  activateFocusMode: (id) => {
    set((state) => ({
      focusModes: state.focusModes.map((mode) =>
        mode.id === id ? { ...mode, isActive: true } : { ...mode, isActive: false }
      ),
      activeFocusMode: id,
    }));
  },

  deactivateFocusMode: () => {
    set((state) => ({
      focusModes: state.focusModes.map((mode) => ({ ...mode, isActive: false })),
      activeFocusMode: null,
    }));
  },
}));
