'use client';

export default function ActionBar() {
  const handleExportPNG = () => {
    const fn = (window as unknown as Record<string, () => void>).__ditherlab_export_png;
    if (fn) fn();
  };

  const handleExportSVG = () => {
    const fn = (window as unknown as Record<string, () => void>).__ditherlab_export_svg;
    if (fn) fn();
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
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
