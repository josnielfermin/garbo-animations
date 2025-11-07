"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  children?: React.ReactNode;
  id?: string;
};

export default function HeroAnimation({ children, id = "box-1" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const prevScrollRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const images: Record<string, string> = {
      "00029":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/5d3ddafd-e969-444e-ab5b-772ce2ec09e7/hero-s_00029.png",
      "00000":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/e4883be1-d4aa-42a9-b710-dd2a3c53d3ee/hero-s_00000.png",
      "00001":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/0b9f2201-1bc2-4a58-8c99-73078de2fefc/hero-s_00001.png",
      "00002":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/0a2a29aa-a73f-4c9d-810b-bdf1776db0f1/hero-s_00002.png",
      "00003":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/1f97d951-3b79-4237-9f6c-c1ac86492463/hero-s_00003.png",
      "00004":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/3d2a8c5b-7771-4de2-9461-c34ab0d4e649/hero-s_00004.png",
      "00005":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/a502e671-4544-46c6-bba0-534ad3b618a2/hero-s_00005.png",
      "00006":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/337ca065-cb3f-4949-8936-23cc1c2970a7/hero-s_00006.png",
      "00007":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/53f4778b-85ee-4107-907f-b85b4515e0d0/hero-s_00007.png",
      "00008":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/41577e33-2f54-44bc-9841-6d57faef8bfc/hero-s_00008.png",
      "00009":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/37e22b8f-d7ae-44af-9ce9-7ab44e988465/hero-s_00009.png",
      "00010":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/db6f9eae-cf73-43f2-93dd-02d57d955b73/hero-s_00010.png",
      "00011":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/76533e94-9f0e-4222-aad5-e5dcf3aff594/hero-s_00011.png",
      "00012":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/cb01d152-22d0-4ea8-81e3-28d0a4d87da1/hero-s_00012.png",
      "00013":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/d8594bb8-ef52-430f-91cb-842b7692e08a/hero-s_00013.png",
      "00014":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/8f5c66e2-144f-4425-91fd-1f82d031b972/hero-s_00014.png",
      "00015":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/5942e887-45aa-4b77-8265-23d62f58b571/hero-s_00015.png",
      "00016":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/034993b5-873c-45a5-af92-a36cff4ad9d4/hero-s_00016.png",
      "00017":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/9f3a5752-12ee-42dc-9715-2210e8f57a73/hero-s_00017.png",
      "00018":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/a258bb43-cf04-4705-86b1-d1946196bb28/hero-s_00018.png",
      "00019":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/02e0ce79-0324-4c53-9afa-6c4ed6a18379/hero-s_00019.png",
      "00020":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/05f07542-6de6-4cda-8bbe-a44f136ed455/hero-s_00020.png",
      "00021":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/36aab125-21fd-45c7-a2bc-7ae2367dee80/hero-s_00021.png",
      "00022":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/a4d1d146-a2c0-4712-9f9a-6c0ca1e436a8/hero-s_00022.png",
      "00023":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/07340771-fcaa-4b9f-99f3-8fff8c929550/hero-s_00023.png",
      "00024":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/3e8045e0-0006-4ea0-bd76-ca39532a802e/hero-s_00024.png",
      "00025":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/0ed7da6a-b6ac-41e8-ac29-91e547982232/hero-s_00025.png",
      "00026":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/b6a0aaf7-8783-445c-b02f-2a815c2ee4c7/hero-s_00026.png",
      "00027":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/a27149c7-dd74-4c70-9837-2a8ac09295e5/hero-s_00027.png",
      "00028":
        "https://t9015398243.p.clickup-attachments.com/t9015398243/6047147a-a275-4f3b-a044-17e7758c5a41/hero-s_00028.png",
    };

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
    window.addEventListener("resize", setCanvasSize);

    const frameCount = 30;
    const currentFrame = (i: number) => images[i.toString().padStart(5, "0")];

    const frames: HTMLImageElement[] = [];
    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = currentFrame(i);
        frames[i] = img;
      }
    };

    let targetFrame = 0; // float
    let currentFrameIndex = 0;
    const INTERP = 0.02; // slower interpolation for smoother motion

    // RAF id ref so we can cancel forward animation when starting reverse
    const rafRef = { current: null as number | null };
    const reversePlayingRef = { current: false };

    function cancelRaf() {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function animateFrame() {
      // forward playback using fixed per-frame step for smoothness (mirrors reverse behavior)
      if (reversePlayingRef.current) return; // don't run forward while reversing

      // heuristic forward speed (frames per RAF tick). Smaller = slower.
      const forwardSpeed = Math.max(0.15, (frameCount / 120) * 0.45);

      const stepForward = () => {
        if (reversePlayingRef.current) {
          rafRef.current = null;
          return;
        }

        // advance towards targetFrame by a fixed amount for consistent smoothness
        if (currentFrameIndex < targetFrame - 0.001) {
          currentFrameIndex = Math.min(
            targetFrame,
            currentFrameIndex + forwardSpeed
          );
          drawImageIndex(Math.round(currentFrameIndex));
          rafRef.current = requestAnimationFrame(stepForward);
        } else {
          // arrived
          currentFrameIndex = targetFrame;
          drawImageIndex(Math.round(currentFrameIndex));
          rafRef.current = null;
        }
      };

      if (!rafRef.current) rafRef.current = requestAnimationFrame(stepForward);
    }

    function animateReverse() {
      // smoothly play back to frame 0 from currentFrameIndex using fixed step
      // prevent reentrancy
      if (reversePlayingRef.current) return;
      reversePlayingRef.current = true;
      cancelRaf();

      // speed per frame (smaller = slower). Scale with frameCount so duration approx consistent.
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
        }
      };

      rafRef.current = requestAnimationFrame(stepBack);
    }

    const replaceBlackWithTransparency = (threshold = 40) => {
      const c = canvasRef.current;
      const ctx = contextRef.current;
      if (!c || !ctx) return;
      try {
        const w = c.width;
        const h = c.height;
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          // make sufficiently dark pixels fully transparent
          if (a > 0 && r <= threshold && g <= threshold && b <= threshold) {
            data[i + 3] = 0; // set alpha to 0
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // getImageData may throw for cross-origin images without proper CORS headers.
        // Fail silently: image will render normally.
      }
    };

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
          // post-process to turn near-black into transparent
          replaceBlackWithTransparency(40);
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
            replaceBlackWithTransparency(40);
          } catch (e) {
            // ignore
          }
        };
      }
    };

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
      const endTop = -0.8 * h; // 80% scrolled past
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

      // when user reaches top of page, play animation in reverse to frame 0
      if (current === 0) {
        // start reverse playback
        animateReverse();
        return;
      }

      // ignore upward movement for forward progression
      if (delta <= 0) return;

      const progress = calcProgress();
      if (progress <= 0) return;

      // slow sensitivity so small scrolls don't jump animation
      const SLOW_FACTOR = 0.55;
      const eased = easeOutQuad(progress) * SLOW_FACTOR;
      const rawTarget = (frameCount - 1) * eased;

      // clamp per-step change to avoid big jumps
      const MAX_DELTA = 0.6;
      const deltaTarget = rawTarget - targetFrame;
      const clampedDelta = Math.max(
        -MAX_DELTA,
        Math.min(MAX_DELTA, deltaTarget)
      );
      targetFrame = targetFrame + clampedDelta;

      // ensure reverse stops if user scrolls down again
      if (reversePlayingRef.current) reversePlayingRef.current = false;

      if (!started) setStarted(true);
      // kick off animation loop towards target
      animateFrame();
    };

    preloadImages();
    // draw frame 0 on mount if available
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
      className="w-[45vw] h-[80vh] overflow-hidden p-6 relative flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        id="hero-lightpass"
        className="w-full h-full max-w-full max-h-full"
        role="img"
        aria-label="Hero animation sequence"
      />
      {children}
    </section>
  );
}
