import { create } from "zustand";

interface ScrollStore {
  /** Scroll progress 0-1 over total page height */
  scrollProgress: number;
  /** Normalized mouse position -1 to 1 on each axis */
  mouseX: number;
  mouseY: number;
  setScrollProgress: (progress: number) => void;
  setMouse: (x: number, y: number) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setMouse: (x, y) => set({ mouseX: x, mouseY: y }),
}));

/**
 * Call this once at the root layout level to bind
 * window scroll and mousemove events to the store.
 * Returns a cleanup function.
 */
export function bindScrollAndMouse(): () => void {
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    useScrollStore.getState().setScrollProgress(progress);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    useScrollStore.getState().setMouse(x, y);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  // Set initial values
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("mousemove", handleMouseMove);
  };
}
