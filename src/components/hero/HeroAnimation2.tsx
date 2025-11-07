"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  children?: React.ReactNode;
  id?: string;
};

export default function HeroAnimation2({ children, id = "box-1" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const prevScrollRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(false);
  const [started, setStarted] = useState(false);
  // lock state: when true the hero will be fixed and page scrolling is prevented
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef<boolean>(false);
  // finished flag: once true the animation should not replay
  const finishedRef = useRef<boolean>(false);
  // track whether the user scrolled completely past the hero (hero left viewport)
  const scrolledPastRef = useRef<boolean>(false);
  // ref to the hero container so we can compute its rect and apply inline fixed styles
  const heroRef = useRef<HTMLElement | null>(null);
  // store previously applied inline styles to restore on unlock
  const savedStyleRef = useRef<Partial<CSSStyleDeclaration> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

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

    // Use local hero-frames stored in public/fonts/hero-frames
    // Files are named hero-s.0001.png ... hero-s.0030.png
    const frameCount = 30;
    const getFrameSrc = (i: number) => {
      // map 0 -> 0001, 29 -> 0030
      const idx = String(i + 1).padStart(4, "0");
      // assets live in public/images/hero-frames
      return `/images/hero-frames/hero-s.${idx}.png`;
    };

    const frames: HTMLImageElement[] = [];
    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        // same-origin images from /public don't require crossOrigin, but keep it harmless
        img.crossOrigin = "anonymous";
        img.src = getFrameSrc(i);
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
      if (finishedRef.current) return; // don't play forward after finished
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
          // fully restore initial state so original behavior works
          resetToInitialState();
        }
      };

      rafRef.current = requestAnimationFrame(stepBack);
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
          // if we've reached the final frame, mark finished and release lock
          if (!finishedRef.current && index >= frameCount - 1) {
            requestAnimationFrame(() => finishAnimation());
          }
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
            if (!finishedRef.current && index >= frameCount - 1) {
              requestAnimationFrame(() => finishAnimation());
            }
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

      // detect when the user has scrolled completely past the hero
      const rectForScroll = canvasRef.current?.getBoundingClientRect();
      if (rectForScroll && rectForScroll.bottom < 0)
        scrolledPastRef.current = true;

      // when user reaches top and previously scrolled past the hero, play reverse to reset
      if (current === 0 && scrolledPastRef.current) {
        animateReverse();
        scrolledPastRef.current = false;
        return;
      }

      // if animation finished, do not drive frames from scroll
      if (finishedRef.current) return;

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

    // --- Scroll locking & direct wheel/touch handling ---
    // When the user starts scrolling down on the hero we prevent page scroll and drive
    // the animation via wheel/touch. Only once the animation reaches the final frame
    // we release the lock and allow the page to continue scrolling.

    const setLockedState = (v: boolean) => {
      const el = heroRef.current;
      lockedRef.current = v;
      setLocked(v);
      if (v) {
        if (el) {
          // save any inline styles we will override
          savedStyleRef.current = {
            position: el.style.position,
            top: el.style.top,
            left: el.style.left,
            width: el.style.width,
            height: el.style.height,
            zIndex: el.style.zIndex,
            transform: el.style.transform,
          };
          // compute rect in viewport coordinates BEFORE locking body overflow
          const rect = el.getBoundingClientRect();
          // apply fixed layout preserving size/position to avoid distortion
          el.style.position = "fixed";
          el.style.top = `${rect.top}px`;
          el.style.left = `${rect.left}px`;
          el.style.width = `${rect.width}px`;
          el.style.height = `${rect.height}px`;
          el.style.zIndex = "9999";
          el.style.transform = "none";
        }
        // prevent page scroll after we've measured and fixed the element
        document.body.style.overflow = "hidden";
      } else {
        // restore inline styles
        if (el && savedStyleRef.current) {
          const s = savedStyleRef.current;
          el.style.position = s.position ?? "";
          el.style.top = s.top ?? "";
          el.style.left = s.left ?? "";
          el.style.width = s.width ?? "";
          el.style.height = s.height ?? "";
          el.style.zIndex = s.zIndex ?? "";
          el.style.transform = s.transform ?? "";
        }
        // restore body scroll
        document.body.style.overflow = "";
      }
    };

    // helpers to add/remove direct input listeners (wheel/touch)
    const addInputListeners = () => {
      try {
        window.addEventListener("wheel", onWheelDirect, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: false });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
      } catch (err) {}
    };

    const removeInputListeners = () => {
      try {
        window.removeEventListener("wheel", onWheelDirect as any);
        window.removeEventListener("touchstart", onTouchStart as any);
        window.removeEventListener("touchmove", onTouchMove as any);
      } catch (err) {}
    };

    const onWheelDirect = (e: WheelEvent) => {
      if (finishedRef.current) return; // don't intercept after finished
      // only intercept when wheel event is vertical and the hero is visible
      const deltaY = e.deltaY;
      const rect = canvasRef.current?.getBoundingClientRect();
      const inViewport =
        rect && rect.top < window.innerHeight && rect.bottom > 0;
      if (!inViewport) return; // let page scroll normally when hero not visible

      // If user scrolls down and animation not finished, lock and consume
      if (deltaY > 0) {
        if (!lockedRef.current) {
          // start lock on first downward scroll
          setLockedState(true);
        }
        if (lockedRef.current) {
          e.preventDefault();
          // advance targetFrame proportionally to wheel delta
          const step = (deltaY / 300) * (frameCount / 10); // tuned sensitivity
          targetFrame = Math.min(frameCount - 1, targetFrame + step);
          animateFrame();
          // if arrived at final frame, release lock and allow page to scroll
          if (targetFrame >= frameCount - 1 - 0.01) {
            // finalize immediately
            requestAnimationFrame(() => finishAnimation());
          }
        }
      } else if (deltaY < 0 && lockedRef.current) {
        // when locked and user scrolls up, reverse animation instead of scrolling page
        e.preventDefault();
        const step = (-deltaY / 300) * (frameCount / 10);
        targetFrame = Math.max(0, targetFrame - step);
        animateFrame();
        // if user reversed all the way to 0, unlock (keep page at top)
        if (targetFrame <= 0.01) {
          requestAnimationFrame(() => setLockedState(false));
        }
      }
    };

    // touch support (mobile)
    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches?.[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (finishedRef.current) return;
      if (touchStartY == null) return;
      const y = e.touches?.[0]?.clientY ?? 0;
      const delta = touchStartY - y;
      const rect = canvasRef.current?.getBoundingClientRect();
      const inViewport =
        rect && rect.top < window.innerHeight && rect.bottom > 0;
      if (!inViewport) return;
      if (Math.abs(delta) < 5) return;
      // emulate wheel behavior
      if (delta > 0) {
        if (!lockedRef.current) setLockedState(true);
        if (lockedRef.current) {
          e.preventDefault();
          const step = (delta / 300) * (frameCount / 10);
          targetFrame = Math.min(frameCount - 1, targetFrame + step);
          animateFrame();
          if (targetFrame >= frameCount - 1 - 0.01) {
            requestAnimationFrame(() => finishAnimation());
          }
        }
      } else {
        if (lockedRef.current) {
          e.preventDefault();
          const step = (-delta / 300) * (frameCount / 10);
          targetFrame = Math.max(0, targetFrame - step);
          animateFrame();
          if (targetFrame <= 0.01)
            requestAnimationFrame(() => setLockedState(false));
        }
      }
      touchStartY = y;
    };

    // Reset to initial state so handlers and flags are restored properly
    const resetToInitialState = () => {
      try {
        finishedRef.current = false;
        scrolledPastRef.current = false;
        cancelRaf();
        targetFrame = 0;
        currentFrameIndex = 0;
        // draw frame 0 immediately
        try {
          drawImageIndex(0);
        } catch (err) {}
        setStarted(false);
        setLockedState(false);
        // re-enable direct input listeners
        try {
          addInputListeners();
        } catch (err) {}
      } catch (err) {}
    };

    // centralized finalizer: mark finished, cancel RAF, restore scroll and remove listeners
    const finishAnimation = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      // stop any running RAF
      cancelRaf();
      // ensure we are on final frame
      try {
        targetFrame = frameCount - 1;
        currentFrameIndex = frameCount - 1;
        drawImageIndex(frameCount - 1);
      } catch (err) {}
      // restore lock and body scroll
      try {
        setLockedState(false);
      } catch (err) {}
      // remove only direct input listeners (keep scroll listener so we can detect return-to-top)
      removeInputListeners();
      // nudge to allow native scroll past hero
      try {
        window.scrollBy(0, 1);
      } catch (err) {}
    };

    preloadImages();
    // draw frame 0 on mount if available
    if (frames[0]) {
      if (frames[0].complete) drawImageIndex(0);
      else frames[0].onload = () => drawImageIndex(0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    addInputListeners();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("scroll", onScroll);
      removeInputListeners();
      cancelRaf();
      // restore body scroll in case of unmount
      document.body.style.overflow = "";
    };
  }, [started]);

  return (
    <section
      id={id}
      ref={heroRef as any}
      className={
        "w-[45vw] h-[80vh] overflow-hidden p-6 relative flex items-center justify-center"
      }
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
