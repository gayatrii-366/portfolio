import LeftPanel from '@/components/home/left-panel';
import RightPanel from '@/components/home/right-panel';

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row min-h-[100dvh] w-full font-sans">
      <LeftPanel />
      <RightPanel />
    </main>
  );
}
