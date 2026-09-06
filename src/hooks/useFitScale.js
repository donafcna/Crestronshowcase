import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Measures the box a ref is rendered into and returns the largest uniform
// scale that fits a fixed design size (designW x designH) inside it —
// capped at `max` (1 by default, so the design never renders larger than
// its real/native size). Pure transform:scale, so the design box itself
// never reflows: it always lays out at designW x designH and is only ever
// visually scaled down (or up to `max`) to fit whatever space is available.
export const useFitScale = (designW, designH, { max = 1 } = {}) => {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(max);

  const recompute = useCallback(() => {
    const el = stageRef.current;
    if (!el || !designW || !designH) return;
    const { width, height } = el.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    setScale(Math.min(width / designW, height / designH, max));
  }, [designW, designH, max]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(recompute);
    observer.observe(el);
    // Belt-and-suspenders: a plain window resize also recomputes directly,
    // in case ResizeObserver delivery is throttled (e.g. a backgrounded tab).
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  return { stageRef, scale };
};
