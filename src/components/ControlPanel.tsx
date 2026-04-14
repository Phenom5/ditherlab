'use client';

import { useStore } from '@/store/useStore';
import type { StyleOption, MoodOption, DitheringStyle, RenderingRules } from '@/store/useStore';

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1.5">
      {children}
    </label>
  );
}

function Divider() {
  return <div className="border-t border-neutral-100 my-1" />;
}

export default function ControlPanel() {
  const store = useStore();

  const canGenerate = store.description.trim().length > 0;
  const descriptionChanged =
    store.description !== store.activeDescription ||
    store.details !== store.activeDetails;

  return (
    <div className="w-80 min-w-80 h-full bg-white border-r border-neutral-200 overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200">
        <h1 className="text-sm font-semibold tracking-tight text-neutral-900">DitherLab</h1>
        <p className="text-[11px] text-neutral-400 mt-0.5">Isometric Illustration Generator</p>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* ─── GENERATION SECTION ─── */}

        {/* Description */}
        <div>
          <SectionLabel>Illustration Description</SectionLabel>
          <textarea
            value={store.description}
            onChange={(e) => store.setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canGenerate) {
                e.preventDefault();
                store.generateIllustration();
              }
            }}
            placeholder="Describe the object (e.g. server rack, bank building, dome, rocket...)"
            rows={3}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 resize-none"
          />
        </div>

        {/* Additional Details */}
        <div>
          <SectionLabel>Additional Details</SectionLabel>
          <textarea
            value={store.details}
            onChange={(e) => store.setDetails(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canGenerate) {
                e.preventDefault();
                store.generateIllustration();
              }
            }}
            placeholder="Extra structure details, geometry hints..."
            rows={2}
            className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 focus:border-neutral-300 resize-none"
          />
        </div>

        {/* Create Illustration Button */}
        <button
          onClick={() => store.generateIllustration()}
          disabled={!canGenerate}
          className={`w-full py-2.5 rounded-md text-sm font-medium transition-all ${
            canGenerate
              ? descriptionChanged
                ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm'
                : 'bg-neutral-800 text-white hover:bg-neutral-700 shadow-sm'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {!store.hasGenerated
            ? 'Create Illustration'
            : descriptionChanged
              ? 'Regenerate Illustration'
              : 'Regenerate Illustration'}
        </button>

        {descriptionChanged && store.hasGenerated && (
          <p className="text-[11px] text-amber-600 -mt-3">
            Description changed — click to update the illustration
          </p>
        )}

        {!store.hasGenerated && (
          <p className="text-[11px] text-neutral-400 -mt-3">
            Ctrl+Enter to generate
          </p>
        )}

        {/* ─── LIVE EDIT SECTION (visible after first generation) ─── */}

        {store.hasGenerated && (
          <>
            <Divider />

            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Live Edit
            </p>

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

            {/* Transparency */}
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
                  className="flex-1 h-1 accent-neutral-700"
                />
                <span className="text-xs text-neutral-400 font-mono w-10 text-right">
                  {Math.round(store.transparency * 100)}%
                </span>
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
          </>
        )}
      </div>
    </div>
  );
}
