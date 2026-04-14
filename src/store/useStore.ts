import { create } from 'zustand';

export interface RenderingRules {
  noOutlines: boolean;
  smoothEdges: boolean;
  roundedCorners: boolean;
  centeredComposition: boolean;
  elevatedBase: boolean;
  gridBackground: boolean;
  softShadow: boolean;
}

export type StyleOption = 'minimal' | 'soft' | 'blocky' | 'detailed';
export type MoodOption = 'calm' | 'futuristic' | 'institutional' | 'playful' | 'premium';
export type DitheringStyle = 'ordered' | 'fine-halftone' | 'coarse-halftone' | 'noise';

export interface LightDirection {
  x: number;
  y: number;
  z: number;
}

export interface AppConfig {
  description: string;
  style: StyleOption;
  details: string;
  renderingRules: RenderingRules;
  mood: MoodOption;
  ditheringStyle: DitheringStyle;
  color: string;
  lightDirection: LightDirection;
}

interface AppState extends AppConfig {
  setDescription: (v: string) => void;
  setStyle: (v: StyleOption) => void;
  setDetails: (v: string) => void;
  setRenderingRule: (key: keyof RenderingRules, value: boolean) => void;
  setMood: (v: MoodOption) => void;
  setDitheringStyle: (v: DitheringStyle) => void;
  setColor: (v: string) => void;
  setLightDirection: (axis: keyof LightDirection, value: number) => void;
}

export const useStore = create<AppState>((set) => ({
  description: '',
  style: 'minimal',
  details: '',
  renderingRules: {
    noOutlines: false,
    smoothEdges: true,
    roundedCorners: false,
    centeredComposition: true,
    elevatedBase: true,
    gridBackground: true,
    softShadow: true,
  },
  mood: 'calm',
  ditheringStyle: 'ordered',
  color: '#cfe3ff',
  lightDirection: { x: 1.0, y: 1.5, z: 0.8 },

  setDescription: (v) => set({ description: v }),
  setStyle: (v) => set({ style: v }),
  setDetails: (v) => set({ details: v }),
  setRenderingRule: (key, value) =>
    set((s) => ({ renderingRules: { ...s.renderingRules, [key]: value } })),
  setMood: (v) => set({ mood: v }),
  setDitheringStyle: (v) => set({ ditheringStyle: v }),
  setColor: (v) => set({ color: v }),
  setLightDirection: (axis, value) =>
    set((s) => ({ lightDirection: { ...s.lightDirection, [axis]: value } })),
}));
