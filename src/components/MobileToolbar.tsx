'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import BottomSheet from './BottomSheet';
import {
  GenerateSection,
  StyleSection,
  RenderingSection,
  DitheringSection,
  ColorSection,
  LightSection,
} from './ControlSections';

/**
 * MobileToolbar — Canva-style bottom toolbar for mobile.
 *
 * Shows icon buttons along the bottom of the screen.
 * Each button opens a BottomSheet with the relevant controls.
 * The "Create" button is always prominent (primary CTA).
 */

type DrawerType = 'generate' | 'style' | 'rendering' | 'dithering' | 'color' | 'light' | null;

const TOOL_ITEMS: { id: DrawerType; label: string; icon: React.ReactNode; requiresGeneration?: boolean }[] = [
  {
    id: 'generate',
    label: 'Create',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 4v12M4 10h12" />
      </svg>
    ),
  },
  {
    id: 'style',
    label: 'Style',
    requiresGeneration: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M3 8h14M8 3v14" />
      </svg>
    ),
  },
  {
    id: 'rendering',
    label: 'Rules',
    requiresGeneration: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10l2.5 2.5L14 7" />
        <rect x="3" y="3" width="14" height="14" rx="2" />
      </svg>
    ),
  },
  {
    id: 'dithering',
    label: 'Dither',
    requiresGeneration: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="6" cy="6" r="1" fill="currentColor" />
        <circle cx="10" cy="6" r="1" fill="currentColor" />
        <circle cx="14" cy="6" r="1" fill="currentColor" />
        <circle cx="8" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="6" cy="14" r="1" fill="currentColor" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
        <circle cx="14" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'color',
    label: 'Color',
    requiresGeneration: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <circle cx="10" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'light',
    label: 'Light',
    requiresGeneration: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.41 1.41M13.54 13.54l1.41 1.41M5.05 14.95l1.41-1.41M13.54 6.46l1.41-1.41" />
      </svg>
    ),
  },
];

const DRAWER_TITLES: Record<string, string> = {
  generate: 'Create Illustration',
  style: 'Style & Mood',
  rendering: 'Rendering Rules',
  dithering: 'Dithering Style',
  color: 'Color & Transparency',
  light: 'Light Direction',
};

export default function MobileToolbar() {
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const hasGenerated = useStore((s) => s.hasGenerated);

  const handleExportPNG = () => {
    const fn = (window as unknown as Record<string, () => void>).__ditherlab_export_png;
    if (fn) fn();
  };

  const handleExportSVG = () => {
    const fn = (window as unknown as Record<string, () => void>).__ditherlab_export_svg;
    if (fn) fn();
  };

  return (
    <>
      {/* Top bar — logo + export (mobile only) */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden flex items-center justify-between px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-neutral-200">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-neutral-900">DitherLab</h1>
        </div>
        {hasGenerated && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportPNG}
              className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white rounded-md"
            >
              PNG
            </button>
            <button
              onClick={handleExportSVG}
              className="px-2.5 py-1 text-xs font-medium bg-white text-neutral-700 border border-neutral-200 rounded-md"
            >
              SVG
            </button>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-neutral-200 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {TOOL_ITEMS.map((item) => {
            const disabled = item.requiresGeneration && !hasGenerated;
            return (
              <button
                key={item.id}
                onClick={() => !disabled && setActiveDrawer(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${
                  disabled
                    ? 'text-neutral-300 cursor-not-allowed'
                    : activeDrawer === item.id
                      ? 'text-neutral-900 bg-neutral-100'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
                disabled={disabled}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drawer sheets */}
      <BottomSheet
        isOpen={activeDrawer === 'generate'}
        onClose={() => setActiveDrawer(null)}
        title={DRAWER_TITLES.generate}
      >
        <GenerateSection onGenerated={() => setActiveDrawer(null)} />
      </BottomSheet>

      <BottomSheet
        isOpen={activeDrawer === 'style'}
        onClose={() => setActiveDrawer(null)}
        title={DRAWER_TITLES.style}
      >
        <StyleSection />
      </BottomSheet>

      <BottomSheet
        isOpen={activeDrawer === 'rendering'}
        onClose={() => setActiveDrawer(null)}
        title={DRAWER_TITLES.rendering}
      >
        <RenderingSection />
      </BottomSheet>

      <BottomSheet
        isOpen={activeDrawer === 'dithering'}
        onClose={() => setActiveDrawer(null)}
        title={DRAWER_TITLES.dithering}
      >
        <DitheringSection />
      </BottomSheet>

      <BottomSheet
        isOpen={activeDrawer === 'color'}
        onClose={() => setActiveDrawer(null)}
        title={DRAWER_TITLES.color}
      >
        <ColorSection />
      </BottomSheet>

      <BottomSheet
        isOpen={activeDrawer === 'light'}
        onClose={() => setActiveDrawer(null)}
        title={DRAWER_TITLES.light}
      >
        <LightSection />
      </BottomSheet>
    </>
  );
}
