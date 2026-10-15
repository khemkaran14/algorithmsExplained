import { createStore } from 'zustand/vanilla';
export type PlayerState = {
  index: number;
  length: number;
  playing: boolean;
  speed: number;
  step: (delta: number) => void;
  seek: (index: number) => void;
  toggle: () => void;
  pause: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  reset: (length: number) => void;
};
export function createPlayerStore(length: number) {
  return createStore<PlayerState>()((set) => ({
    index: 0,
    length,
    playing: false,
    speed: 1,
    step: (delta) =>
      set((s) => ({
        index: Math.max(0, Math.min(s.length - 1, s.index + delta)),
        playing: false,
      })),
    seek: (index) =>
      set((s) => ({
        index: Math.max(0, Math.min(s.length - 1, index)),
        playing: false,
      })),
    toggle: () =>
      set((s) => ({ playing: s.index < s.length - 1 ? !s.playing : false })),
    pause: () => set({ playing: false }),
    restart: () => set({ index: 0, playing: false }),
    setSpeed: (speed) => set({ speed: Math.max(0.25, Math.min(4, speed)) }),
    reset: (length) => set({ index: 0, length, playing: false }),
  }));
}
