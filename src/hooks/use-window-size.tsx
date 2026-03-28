import { useState, useEffect } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({
    vw: window.innerWidth,
    vh: window.innerHeight,
  });

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setSize({ vw: window.innerWidth, vh: window.innerHeight });
    });
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return size;
}
