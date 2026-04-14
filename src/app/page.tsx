'use client';

import dynamic from 'next/dynamic';
import ControlPanel from '@/components/ControlPanel';
import ActionBar from '@/components/ActionBar';

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
      <ControlPanel />
      <div className="relative flex-1 min-w-0">
        <ActionBar />
        <SceneCanvas />
      </div>
    </div>
  );
}
