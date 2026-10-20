import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 8;

interface EditorState {
  currentTime: number;

  duration: number;
  isPlaying: boolean;
  isMuted: boolean;
  playbackRate: number;

  zoom: number;
  selectedSceneId: string | null;
}

interface EditorActions {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  selectScene: (sceneId: string | null) => void;
  reset: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const initialState: EditorState = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isMuted: false,
  playbackRate: 1,
  zoom: 1,
  selectedSceneId: null,
};

export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    (set) => ({
      ...initialState,
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      seek: (time) =>
        set((s) => ({ currentTime: clamp(time, 0, s.duration || Infinity) })),
      setDuration: (duration) => set({ duration: Math.max(0, duration) }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      setZoom: (zoom) => set({ zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) }),
      zoomIn: () => set((s) => ({ zoom: clamp(s.zoom * 1.25, MIN_ZOOM, MAX_ZOOM) })),
      zoomOut: () => set((s) => ({ zoom: clamp(s.zoom / 1.25, MIN_ZOOM, MAX_ZOOM) })),
      selectScene: (selectedSceneId) => set({ selectedSceneId }),
      reset: () => set(initialState),
    }),
    { name: "editor-store" },
  ),
);
