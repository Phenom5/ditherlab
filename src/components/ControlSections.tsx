'use client';

import { useStore } from '@/store/useStore';
import type { StyleOption, MoodOption, DitheringStyle, RenderingRules } from '@/store/useStore';

// ─── Shared UI atoms ───

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">
      {children}
    </label>
  );
}

const selectClass = 'w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-300';
const textareaClass = 'w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 resize-none';

// ─── Option data ───

const STYLE_OPTIONS: { value: StyleOption; label: string }[] = [
  { value: 'minimal', label: 'Minimal Isometric' },
  { value: 'soft', label: 'Soft Isometric' },
  { value: 'blocky', label: 'Blocky' },
  { value: 'detailed', label: 'Detailed Technical' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'stacked', label: 'Stacked / Compressed' },
  { value: 'flat', label: 'Flat Shaded' },
];

const MOOD_OPTIONS: { value: MoodOption; label: string }[] = [
  { value: 'calm', label: 'Calm' },
  { value: 'futuristic', label: 'Futuristic' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'playful', label: 'Playful' },
  { value: 'premium', label: 'Premium' },
];

const DITHER_OPTIONS: { value: DitheringStyle; label: string }[] = [
  { value: 'ordered', label: 'Ordered (Bayer matrix)' },
  { value: 'fine-halftone', label: 'Fine halftone' },
  { value: 'coarse-halftone', label: 'Coarse halftone' },
  { value: 'noise', label: 'Noise-based' },
  { value: 'crosshatch', label: 'Crosshatch' },
  { value: 'stipple', label: 'Stipple' },
  { value: 'scanline', label: 'Scanline' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'spiral', label: 'Spiral' },
  { value: 'checkerboard', label: 'Checkerboard' },
  { value: 'ascii', label: 'ASCII' },
];

const RENDERING_RULES: { key: keyof RenderingRules; label: string }[] = [
  { key: 'noOutlines', label: 'No outlines' },
  { key: 'smoothEdges', label: 'Smooth edges' },
  { key: 'roundedCorners', label: 'Rounded corners' },
  { key: 'centeredComposition', label: 'Centered composition' },
  { key: 'elevatedBase', label: 'Elevated base' },
  { key: 'gridBackground', label: 'Grid background' },
  { key: 'softShadow', label: 'Soft shadow' },
];

// ─── Sections ───

export function GenerateSection({ onGenerated }: { onGenerated?: () => void }) {
  const store = useStore();
  const canGenerate = store.description.trim().length > 0;

  const handleGenerate = () => {
    store.generateIllustration();
    onGenerated?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>Illustration Description</SectionLabel>
        <textarea
          value={store.description}
          onChange={(e) => store.setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canGenerate) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="Describe the object (e.g. server rack, bank building, dome, rocket...)"
          rows={3}
          className={textareaClass}
        />
      </div>

      <div>
        <SectionLabel>Additional Details</SectionLabel>
        <textarea
          value={store.details}
          onChange={(e) => store.setDetails(e.target.value)}
          placeholder="Extra structure details, geometry hints..."
          rows={2}
          className={textareaClass}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
          canGenerate
            ? 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] shadow-sm'
            : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}
      >
        {store.hasGenerated ? 'Regenerate Illustration' : 'Create Illustration'}
      </button>

      {!store.hasGenerated && (
        <p className="text-[11px] text-neutral-400 text-center">
          Ctrl+Enter to generate
        </p>
      )}
    </div>
  );
}

export function StyleSection() {
  const store = useStore();
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Style</SectionLabel>
        <select value={store.style} onChange={(e) => store.setStyle(e.target.value as StyleOption)} className={selectClass}>
          {STYLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <SectionLabel>Mood</SectionLabel>
        <select value={store.mood} onChange={(e) => store.setMood(e.target.value as MoodOption)} className={selectClass}>
          {MOOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function RenderingSection() {
  const store = useStore();
  return (
    <div className="space-y-2.5">
      {RENDERING_RULES.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 cursor-pointer py-1 group">
          <input
            type="checkbox"
            checked={store.renderingRules[key]}
            onChange={(e) => store.setRenderingRule(key, e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-neutral-700 focus:ring-neutral-300 accent-neutral-700"
          />
          <span className="text-sm text-neutral-600 group-hover:text-neutral-900">{label}</span>
        </label>
      ))}
    </div>
  );
}

export function DitheringSection() {
  const store = useStore();
  return (
    <div>
      <SectionLabel>Dithering Style</SectionLabel>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {DITHER_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => store.setDitheringStyle(o.value)}
            className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
              store.ditheringStyle === o.value
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ColorSection() {
  const store = useStore();
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Brand Color</SectionLabel>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={store.color}
            onChange={(e) => store.setColor(e.target.value)}
            className="h-12 w-16 rounded-lg border border-neutral-200 cursor-pointer bg-transparent"
          />
          <span className="text-sm text-neutral-500 font-mono">{store.color}</span>
        </div>
      </div>
      <div>
        <SectionLabel>Transparency</SectionLabel>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={store.transparency}
            onChange={(e) => store.setTransparency(parseFloat(e.target.value))}
            className="flex-1 h-1.5 accent-neutral-700"
          />
          <span className="text-xs text-neutral-500 font-mono w-10 text-right">
            {Math.round(store.transparency * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function LightSection() {
  const store = useStore();
  return (
    <div className="space-y-4">
      <SectionLabel>Light Direction</SectionLabel>
      {(['x', 'y', 'z'] as const).map((axis) => (
        <div key={axis} className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-mono w-4 uppercase font-semibold">{axis}</span>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={store.lightDirection[axis]}
            onChange={(e) => store.setLightDirection(axis, parseFloat(e.target.value))}
            className="flex-1 h-1.5 accent-neutral-700"
          />
          <span className="text-xs text-neutral-500 font-mono w-8 text-right">
            {store.lightDirection[axis].toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
