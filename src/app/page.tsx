'use client';

import dynamic from 'next/dynamic';
import ControlPanel from '@/components/ControlPanel';
import ActionBar from '@/components/ActionBar';
import MobileToolbar from '@/components/MobileToolbar';

const SceneCanvas = dynamic(() => import('@/scene/SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#f5f5f0]">
      <p className="text-sm text-neutral-400">Loading renderer...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50">
      {/* Desktop sidebar — hidden on mobile */}
      <ControlPanel />

      {/* Canvas area — full screen on mobile, flex-1 on desktop */}
      <div className="relative flex-1 min-w-0 pt-11 pb-16 lg:pt-0 lg:pb-0">
        <ActionBar />
        <SceneCanvas />
      </div>

      {/* Mobile toolbar + drawers — hidden on desktop */}
      <MobileToolbar />
    </div>
  );
}
