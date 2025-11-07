'use client';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  children?: React.ReactNode;
  id?: string;
};

export default function AnimationBox2({ children, id = 'box-2' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const intersectionRef = useRef<number>(0);
  const prevScrollRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Sequence served from public folder
    const frameCount = 31; // assumes files 00000..00030
    const currentFrame = (i: number) =>
      `/claw_phone_section_sequence/claw_phone_section_${i
        .toString()
        .padStart(5, '0')}.png`;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    contextRef.current = ctx;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    function setCanvasSize() {
      const c = canvasRef.current;
      const context = contextRef.current;
      if (!c || !context) return;
      const rect = c.getBoundingClientRect();
      c.width = Math.max(1, rect.width * dpr);
      c.height = Math.max(1, rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // preload frames into array to avoid flicker/jumps
    const frames: HTMLImageElement[] = [];
    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const imgPre = new Image();
        const src = currentFrame(i);
        if (src) imgPre.src = src;
        frames[i] = imgPre;
      }
    };

    const img = new Image();
    imgRef.current = img;
    const firstSrc = currentFrame(0);
    img.src = firstSrc;
    img.onload = () => {
      const c = canvasRef.current;
      const context = contextRef.current;
      if (!c || !context) return;
      try {
        context.clearRect(0, 0, c.width, c.height);
        context.drawImage(img, 0, 0, c.width / dpr, c.height / dpr);
      } catch (e) {
        // ignore
      }
    };

    const drawFrame = (index: number) => {
      const c = canvasRef.current;
      const context = contextRef.current;
      if (!c || !context) return;
      const imgEl = frames[index];
      if (imgEl && imgEl.complete) {
        try {
          context.clearRect(0, 0, c.width, c.height);
          context.drawImage(imgEl, 0, 0, c.width / dpr, c.height / dpr);
        } catch (e) {
          // ignore
        }
      } else if (imgEl) {
        imgEl.onload = () => {
          try {
            const c2 = canvasRef.current;
            const context2 = contextRef.current;
            if (!c2 || !context2) return;
            context2.clearRect(0, 0, c2.width, c2.height);
            context2.drawImage(imgEl, 0, 0, c2.width / dpr, c2.height / dpr);
          } catch (e) {
            // ignore
          }
        };
      }
    };

    function easeOutQuad(t: number) {
      return t * (2 - t);
    }

    let targetFrame = 0;
    let currentFrameIndex = 0;

    const INTERP = 0.06;
    function animateFrame() {
      if (!animatingRef.current) return;
      currentFrameIndex += (targetFrame - currentFrameIndex) * INTERP;
      const displayFrame = Math.round(currentFrameIndex);
      drawFrame(displayFrame);
      if (Math.abs(targetFrame - currentFrameIndex) > 0.01) {
        requestAnimationFrame(animateFrame);
      } else {
        currentFrameIndex = targetFrame;
        drawFrame(Math.round(currentFrameIndex));
        animatingRef.current = false;
      }
    }

    // start only on first scroll-down and ignore scroll-up
    prevScrollRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          intersectionRef.current = entry.intersectionRatio;
        });
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    );
    observer.observe(canvas);

    const onScroll = () => {
      const prev = prevScrollRef.current;
      const current = window.scrollY;
      const delta = current - prev;
      prevScrollRef.current = current;
      if (delta <= 0) return; // ignore scroll-up

      const ratio = intersectionRef.current ?? 0;
      if (ratio < 0.3) return;

      const eased = easeOutQuad(ratio);
      targetFrame = Math.round((frameCount - 1) * eased);

      if (!started) setStarted(true);

      if (!animatingRef.current) {
        animatingRef.current = true;
        animateFrame();
      }
    };

    preloadImages();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [started]);

  return (
    <section
      id={id}
      className="w-[45vw] h-[80vh] rounded-xl shadow-lg bg-gradient-to-b from-white to-sky-50 overflow-hidden p-6 relative flex items-center justify-center"
    >
      <h2 className="absolute top-4 left-4 m-0 text-lg font-bold">Caja 2</h2>
      <canvas
        ref={canvasRef}
        id="claw-phone-canvas"
        className="w-full h-full max-w-full max-h-full"
        role="img"
        aria-label="Claw phone animation sequence"
      />
      <div
        className={`absolute bottom-4 text-sm text-gray-500 transition-all duration-500 ${
          started ? 'opacity-0 translate-y-2' : 'opacity-100'
        }`}
      >
        Keep scrolling
      </div>
      {children}
    </section>
  );
}
