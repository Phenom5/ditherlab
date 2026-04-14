'use client';

import { useStore } from '@/store/useStore';
import type { StyleOption, MoodOption, DitheringStyle, RenderingRules } from '@/store/useStore';

const STYLE_OPTIONS: { value: StyleOption; label: string }[] = [
  { value: 'minimal', label: 'Minimal Isometric' },
  { value: 'soft', label: 'Soft Isometric' },
  { value: 'blocky', label: 'Blocky' },
  { value: 'detailed', label: 'Detailed Technical' },
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">
      {children}
    </label>
  );
}

export default function ControlPanel() {
  const store = useStore();

  return (
    <div className="w-80 min-w-80 h-full bg-white border-r border-neutral-200 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200">
        <h1 className="text-sm font-semibold tracking-tight text-neutral-900">DitherLab</h1>
        <p className="text-[11px] text-neutral-400 mt-0.5">Isometric Illustration Generator</p>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Description */}
        <div>
          <SectionLabel>Illustration Description</SectionLabel>
          <textarea
            value={store.description}
            onChange={(e) => store.setDescription(e.target.value)}
            placeholder="Describe the object (e.g. server rack, bank building, dome...)"
            rows={3}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 resize-none"
          />
        </div>

        {/* Style */}
        <div>
          <SectionLabel>Style</SectionLabel>
          <select
            value={store.style}
            onChange={(e) => store.setStyle(e.target.value as StyleOption)}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-300"
          >
            {STYLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Additional Details */}
        <div>
          <SectionLabel>Additional Details</SectionLabel>
          <textarea
            value={store.details}
            onChange={(e) => store.setDetails(e.target.value)}
            placeholder="Extra structure details, geometry hints..."
            rows={2}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 resize-none"
          />
        </div>

        {/* Rendering Rules */}
        <div>
          <SectionLabel>Rendering Rules</SectionLabel>
          <div className="space-y-2">
            {RENDERING_RULES.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={store.renderingRules[key]}
                  onChange={(e) => store.setRenderingRule(key, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-300 text-neutral-700 focus:ring-neutral-300 accent-neutral-700"
                />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <SectionLabel>Mood</SectionLabel>
          <select
            value={store.mood}
            onChange={(e) => store.setMood(e.target.value as MoodOption)}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-300"
          >
            {MOOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Dithering Style */}
        <div>
          <SectionLabel>Dithering Style</SectionLabel>
          <select
            value={store.ditheringStyle}
            onChange={(e) => store.setDitheringStyle(e.target.value as DitheringStyle)}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-300"
          >
            {DITHER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Brand Color */}
        <div>
          <SectionLabel>Brand Color</SectionLabel>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={store.color}
              onChange={(e) => store.setColor(e.target.value)}
              className="h-9 w-12 rounded border border-neutral-200 cursor-pointer bg-transparent"
            />
            <span className="text-sm text-neutral-500 font-mono">{store.color}</span>
          </div>
        </div>

        {/* Light Direction */}
        <div>
          <SectionLabel>Light Direction</SectionLabel>
          <div className="space-y-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div key={axis} className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 font-mono w-3 uppercase">{axis}</span>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={store.lightDirection[axis]}
                  onChange={(e) => store.setLightDirection(axis, parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-neutral-700"
                />
                <span className="text-xs text-neutral-400 font-mono w-8 text-right">
                  {store.lightDirection[axis].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
