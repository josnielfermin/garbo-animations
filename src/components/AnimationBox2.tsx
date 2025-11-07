"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  children?: React.ReactNode;
  id?: string;
};

export default function AnimationBox2({ children, id = "box-2" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const prevScrollRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Use frames from public/claw_phone_section_sequence, starting at 00001
    const START_INDEX = 1; // corresponds to file ..._00001.png
    const END_INDEX = 45; // inclusive (00001..00045)
    const frameCount = END_INDEX - START_INDEX + 1;
    const currentFrame = (i: number) =>
      `/claw-phone/claw_phone_section_${(i + START_INDEX)
        .toString()
        .padStart(5, "0")}.png`;

    console.log("currentFrame", currentFrame);
    console.log("frameCount", frameCount);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    contextRef.current = ctx;

    const dpr = window.devicePixelRatio || 1;

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
    // Start hidden until the element reaches the 20% visibility threshold
    if (canvas && canvas.style) canvas.style.opacity = "0";
    window.addEventListener("resize", setCanvasSize);

    const frames: HTMLImageElement[] = [];
    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = currentFrame(i);
        frames[i] = img;
      }
    };

    let targetFrame = 0; // float
    let currentFrameIndex = 0;
    const INTERP = 0.02; // keep for potential interpolation tuning (matches AnimationBox1)

    // RAF id ref so we can cancel forward animation when starting reverse
    const rafRef = { current: null as number | null };
    const reversePlayingRef = { current: false };

    function cancelRaf() {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    const drawImageIndex = (index: number) => {
      const c = canvasRef.current;
      const context = contextRef.current;
      if (!c || !context) return;
      const idx = Math.max(0, Math.min(frames.length - 1, index));
      const img = frames[idx];
      if (!img) return;
      if (img.complete) {
        try {
          context.clearRect(0, 0, c.width, c.height);
          context.drawImage(img, 0, 0, c.width / dpr, c.height / dpr);
          // post-process to turn near-black into transparent (best-effort)
        } catch (e) {
          // ignore
        }
      } else {
        img.onload = () => {
          const c2 = canvasRef.current;
          const context2 = contextRef.current;
          if (!c2 || !context2) return;
          try {
            context2.clearRect(0, 0, c2.width, c2.height);
            context2.drawImage(img, 0, 0, c2.width / dpr, c2.height / dpr);
          } catch (e) {
            // ignore
          }
        };
      }
    };

    // forward playback using fixed per-frame step for smoothness (mirrors reverse behavior)
    function animateFrame() {
      if (reversePlayingRef.current) return;
      const forwardSpeed = Math.max(0.15, (frameCount / 120) * 0.45);

      const stepForward = () => {
        if (reversePlayingRef.current) {
          rafRef.current = null;
          return;
        }

        if (currentFrameIndex < targetFrame - 0.001) {
          currentFrameIndex = Math.min(
            targetFrame,
            currentFrameIndex + forwardSpeed
          );
          drawImageIndex(Math.round(currentFrameIndex));
          rafRef.current = requestAnimationFrame(stepForward);
        } else {
          currentFrameIndex = targetFrame;
          drawImageIndex(Math.round(currentFrameIndex));
          rafRef.current = null;
        }
      };

      if (!rafRef.current) rafRef.current = requestAnimationFrame(stepForward);
    }

    function animateReverse() {
      if (reversePlayingRef.current) return;
      reversePlayingRef.current = true;
      cancelRaf();

      const reverseSpeed = Math.max(0.2, (frameCount / 120) * 0.5);

      const stepBack = () => {
        currentFrameIndex = Math.max(0, currentFrameIndex - reverseSpeed);
        drawImageIndex(Math.round(currentFrameIndex));
        if (currentFrameIndex > 0.01) {
          rafRef.current = requestAnimationFrame(stepBack);
        } else {
          currentFrameIndex = 0;
          drawImageIndex(0);
          reversePlayingRef.current = false;
          rafRef.current = null;
          setStarted(false);
          // hide canvas after reverse finishes (back to top)
          if (canvasRef.current) canvasRef.current.style.opacity = "0";
        }
      };

      rafRef.current = requestAnimationFrame(stepBack);
    }

    function easeOutQuad(t: number) {
      return t * (2 - t);
    }

    const calcProgress = () => {
      const c = canvasRef.current;
      if (!c) return 0;
      const rect = c.getBoundingClientRect();
      const h = rect.height || 1;
      const top = rect.top;
      const vh = window.innerHeight;
      const startTop = vh - 0.2 * h; // 20% visible
      // end when the element is fully inside the viewport (top = vh - h)
      const endTop = vh - h; // element fully visible
      const total = startTop - endTop;
      const progressed = (startTop - top) / total;
      return Math.max(0, Math.min(1, progressed));
    };

    prevScrollRef.current = window.scrollY;

    const onScroll = () => {
      const prev = prevScrollRef.current;
      const current = window.scrollY;
      const delta = current - prev;
      prevScrollRef.current = current;

      if (current === 0) {
        animateReverse();
        return;
      }

      if (delta <= 0) return;

      const progress = calcProgress();
      // hide canvas while progress is before the start threshold
      if (progress <= 0) {
        if (canvasRef.current) canvasRef.current.style.opacity = "0";
        return;
      }

      // ensure visible once progress has started
      if (canvasRef.current) canvasRef.current.style.opacity = "1";

      const SLOW_FACTOR = 0.55;
      const eased = easeOutQuad(progress) * SLOW_FACTOR;
      const rawTarget = (frameCount - 1) * eased;

      const MAX_DELTA = 0.6;
      const deltaTarget = rawTarget - targetFrame;
      const clampedDelta = Math.max(
        -MAX_DELTA,
        Math.min(MAX_DELTA, deltaTarget)
      );
      targetFrame = targetFrame + clampedDelta;

      if (reversePlayingRef.current) reversePlayingRef.current = false;

      if (!started) setStarted(true);
      animateFrame();
    };

    preloadImages();
    if (frames[0]) {
      if (frames[0].complete) drawImageIndex(0);
      else frames[0].onload = () => drawImageIndex(0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("scroll", onScroll);
      cancelRaf();
    };
  }, [started]);

  return (
    <section
      id={id}
      className="w-[1000px] h-screen rounded-xl shadow-lg bg-white overflow-hidden p-6 relative flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        id="claw-phone-canvas"
        className="w-full h-full max-w-full max-h-full"
        role="img"
        aria-label="Claw phone animation sequence"
      />
      {/* <Image
        src="/claw_phone_section_sequence/claw_phone_section_00000.png"
        alt=""
        className="absolute top-6 left-25"
        width={620}
        height={261}
        quality={100}
      /> */}
      {children}
    </section>
  );
}
