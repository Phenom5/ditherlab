'use client';

import { useStore } from '@/store/useStore';

/**
 * ActionBar — Desktop-only export buttons (top-right of canvas).
 * On mobile, export buttons are in the MobileToolbar top bar.
 */
export default function ActionBar() {
  const hasGenerated = useStore((s) => s.hasGenerated);

  const handleExportPNG = () => {
    const fn = (window as unknown as Record<string, () => void>).__ditherlab_export_png;
    if (fn) fn();
  };

  const handleExportSVG = () => {
    const fn = (window as unknown as Record<string, () => void>).__ditherlab_export_svg;
    if (fn) fn();
  };

  if (!hasGenerated) return null;

  return (
    <div className="absolute top-4 right-4 hidden lg:flex items-center gap-2 z-10">
      <button
        onClick={handleExportPNG}
        className="px-3.5 py-1.5 text-sm font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors shadow-sm"
      >
        Download PNG
      </button>
      <button
        onClick={handleExportSVG}
        className="px-3.5 py-1.5 text-sm font-medium bg-white text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors shadow-sm"
      >
        Download SVG
      </button>
    </div>
  );
}
