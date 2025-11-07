import Image from "next/image";
import AnimationBox1 from "@/components/AnimationBox1";
import AnimationBox2 from "@/components/AnimationBox2";
import AnimationBoxfill from "@/components/AnimationBoxfill";

export default function Home() {
  return (
    <main
      className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black"
      style={{ padding: 24 }}
    >
      <div className="w-full h-40"></div>
      <div className="flex flex-col items-center w-full">
        <AnimationBox1 />
      </div>
      <div className="w-full h-80"></div>

      <div className="flex flex-col items-center w-full">
        <AnimationBox2 />
      </div>
      <div className="w-full h-180"></div>
    </main>
  );
}
