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

export type StyleOption = 'minimal' | 'soft' | 'blocky' | 'detailed' | 'wireframe' | 'rounded' | 'stacked' | 'flat';
export type MoodOption = 'calm' | 'futuristic' | 'institutional' | 'playful' | 'premium';
export type DitheringStyle =
  | 'ordered' | 'fine-halftone' | 'coarse-halftone' | 'noise'
  | 'crosshatch' | 'stipple' | 'scanline' | 'diamond' | 'spiral' | 'checkerboard' | 'ascii';

export interface LightDirection {
  x: number;
  y: number;
  z: number;
}

export interface AppConfig {
  // Draft fields — what the user is typing (not yet committed)
  description: string;
  details: string;
  // Committed fields — what the scene actually renders
  activeDescription: string;
  activeDetails: string;
  // Whether an illustration has been generated at least once
  hasGenerated: boolean;

  style: StyleOption;
  renderingRules: RenderingRules;
  mood: MoodOption;
  ditheringStyle: DitheringStyle;
  color: string;
  lightDirection: LightDirection;
  transparency: number;
}

interface AppState extends AppConfig {
  setDescription: (v: string) => void;
  setDetails: (v: string) => void;
  generateIllustration: () => void;
  setStyle: (v: StyleOption) => void;
  setRenderingRule: (key: keyof RenderingRules, value: boolean) => void;
  setMood: (v: MoodOption) => void;
  setDitheringStyle: (v: DitheringStyle) => void;
  setColor: (v: string) => void;
  setLightDirection: (axis: keyof LightDirection, value: number) => void;
  setTransparency: (v: number) => void;
}

export const useStore = create<AppState>((set) => ({
  description: '',
  details: '',
  activeDescription: '',
  activeDetails: '',
  hasGenerated: false,

  style: 'minimal',
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
  transparency: 1.0,

  setDescription: (v) => set({ description: v }),
  setDetails: (v) => set({ details: v }),
  generateIllustration: () =>
    set((s) => ({
      activeDescription: s.description,
      activeDetails: s.details,
      hasGenerated: true,
    })),
  setStyle: (v) => set({ style: v }),
  setRenderingRule: (key, value) =>
    set((s) => ({ renderingRules: { ...s.renderingRules, [key]: value } })),
  setMood: (v) => set({ mood: v }),
  setDitheringStyle: (v) => set({ ditheringStyle: v }),
  setColor: (v) => set({ color: v }),
  setLightDirection: (axis, value) =>
    set((s) => ({ lightDirection: { ...s.lightDirection, [axis]: value } })),
  setTransparency: (v) => set({ transparency: v }),
}));
