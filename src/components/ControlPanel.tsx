'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  GenerateSection,
  StyleSection,
  RenderingSection,
  DitheringSection,
  ColorSection,
  LightSection,
} from './ControlSections';

/**
 * ControlPanel — Desktop/tablet sidebar with collapsible toggle.
 *
 * Hidden on mobile (MobileToolbar takes over).
 * On desktop, can be collapsed to a thin icon strip.
 */

function Divider() {
  return <div className="border-t border-neutral-100 my-1" />;
}

export default function ControlPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const hasGenerated = useStore((s) => s.hasGenerated);
  const descriptionChanged = useStore((s) =>
    s.description !== s.activeDescription || s.details !== s.activeDetails
  );

  // Collapsed sidebar — thin strip with expand button
  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center w-12 min-w-12 h-full bg-white border-r border-neutral-200 py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-900"
          aria-label="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-80 min-w-80 h-full bg-white border-r border-neutral-200">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-neutral-900">DitherLab</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">Isometric Illustration Generator</p>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700"
          aria-label="Collapse sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Generation */}
        <GenerateSection />

        {descriptionChanged && hasGenerated && (
          <p className="text-[11px] text-amber-600 -mt-3">
            Description changed — click to update
          </p>
        )}

        {/* Live edit section */}
        {hasGenerated && (
          <>
            <Divider />
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Live Edit
            </p>
            <StyleSection />
            <RenderingSection />
            <DitheringSection />
            <ColorSection />
            <LightSection />
          </>
        )}
      </div>
    </div>
  );
}
