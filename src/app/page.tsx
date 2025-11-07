import Image from 'next/image';
import AnimationBox1 from '@/components/AnimationBox1';
import AnimationBox2 from '@/components/AnimationBox2';
import AnimationBoxfill from '@/components/AnimationBoxfill';

export default function Home() {
  return (
    <main
      className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black"
      style={{ padding: 24 }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <AnimationBoxfill />
        <AnimationBoxfill />
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <AnimationBox1 />
        <AnimationBox2 />
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <AnimationBoxfill />
        <AnimationBoxfill />
      </div>
    </main>
  );
}
