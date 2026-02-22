import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { computeGeometry, wallAtPoint, defaultWindowPos } from "@/lib/room-geometry";

export type WallId = "back" | "left" | "right" | "ceiling" | "floor";

export interface AppWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  wall: WallId;
  /** Position in INITIAL_WINDOWS array — used to stagger default positions */
  stackIndex?: number;
  children?: React.ReactNode;
  onMoveRequest: (id: string, targetWall: WallId) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  /** Called with the wall currently under the cursor during drag, null on release */
  onHoverWall: (wall: WallId | null) => void;
}

const ACCENT       = "74,173,220";
const ACCENT_CLICK = "212,175,55";
const GRID_COLOR   = "rgba(255,255,255,0.06)";
const BORDER       = `rgba(${ACCENT},0.28)`;
const HEADER_BG    = "rgba(255,255,255,0.04)";

const MIN_W = 200;
const MIN_H = 130;

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

export default function AppWindow({
  id,
  title,
  icon,
  wall,
  stackIndex = 0,
  children,
  onMoveRequest,
  onDragStart,
  onDragEnd,
  onHoverWall,
}: AppWindowProps) {
  const isMobile = useIsMobile();

  // ── Initial position — computed once at mount based on wall ─────────────────
  const initPos = useRef<{ x: number; y: number } | null>(null);
  if (!initPos.current) {
    const { BW } = computeGeometry(window.innerWidth, window.innerHeight);
    initPos.current = defaultWindowPos(wall, BW, window.innerWidth, window.innerHeight, stackIndex);
  }

  // ── MotionValues for position — no React re-render on drag frames ───────────
  const x = useMotionValue(initPos.current.x);
  const y = useMotionValue(initPos.current.y);

  // ── Window size ──────────────────────────────────────────────────────────────
  const [size, setSize] = useState({ w: 260, h: 180 });

  // ── Interaction states ───────────────────────────────────────────────────────
  const [isDragging,  setIsDragging]  = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);
  const [isActive,    setIsActive]    = useState(false);
  const [isResizing,  setIsResizing]  = useState(false);

  const resizeEdgeRef  = useRef<ResizeEdge>(null);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const dragStartRef   = useRef({ px: 0, py: 0, mx: 0, my: 0 });

  // ── Glow ────────────────────────────────────────────────────────────────────
  const glowColor = isActive || isDragging ? ACCENT_CLICK : ACCENT;
  const glowOn    = isHovered || isDragging || isActive;
  const boxShadow = glowOn
    ? `0 0 18px rgba(${glowColor},0.35), 0 0 48px rgba(${glowColor},0.15), inset 0 0 12px rgba(${glowColor},0.04)`
    : "0 0 12px rgba(0,0,0,0.40)";
  const borderColor = glowOn
    ? `rgba(${glowColor},${isDragging || isActive ? "0.65" : "0.45"})`
    : BORDER;

  // ── Header drag ─────────────────────────────────────────────────────────────
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if (isMobile || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setIsActive(true);
    onDragStart();
    // Release pointer capture so pointermove fires on window
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    dragStartRef.current = { px: e.clientX, py: e.clientY, mx: x.get(), my: y.get() };

    const onMove = (ev: PointerEvent) => {
      const nx = dragStartRef.current.mx + ev.clientX - dragStartRef.current.px;
      const ny = dragStartRef.current.my + ev.clientY - dragStartRef.current.py;
      x.set(nx);
      y.set(ny);

      // Report hovered wall from geometry
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { BW } = computeGeometry(vw, vh);
      const vbx = (ev.clientX / vw) * 100;
      const vby = (ev.clientY / vh) * 100;
      onHoverWall(wallAtPoint(vbx, vby, BW));
    };

    const onUp = (ev: PointerEvent) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const { BW } = computeGeometry(vw, vh);
      const vbx = (ev.clientX / vw) * 100;
      const vby = (ev.clientY / vh) * 100;
      const targetWall = wallAtPoint(vbx, vby, BW);
      onMoveRequest(id, targetWall);
      onHoverWall(null);
      setIsDragging(false);
      onDragEnd();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
  };

  // ── Edge resize ─────────────────────────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, edge: ResizeEdge) => {
      if (isMobile || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setIsActive(true);
      resizeEdgeRef.current  = edge;
      resizeStartRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - resizeStartRef.current.x;
        const dy = ev.clientY - resizeStartRef.current.y;
        const eg = resizeEdgeRef.current!;
        setSize((prev) => {
          let { w, h } = prev;
          if (eg.includes("e")) w = Math.max(MIN_W, resizeStartRef.current.w + dx);
          if (eg.includes("w")) w = Math.max(MIN_W, resizeStartRef.current.w - dx);
          if (eg.includes("s")) h = Math.max(MIN_H, resizeStartRef.current.h + dy);
          if (eg.includes("n")) h = Math.max(MIN_H, resizeStartRef.current.h - dy);
          return { w, h };
        });
      };
      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup",   onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup",   onUp);
    },
    [isMobile, size.w, size.h],
  );

  const edgeHandles: { edge: ResizeEdge; style: React.CSSProperties; cursor: string }[] = [
    { edge: "n",  cursor: "ns-resize", style: { top: 0,    left: 4,   right: 4,  height: 5 } },
    { edge: "s",  cursor: "ns-resize", style: { bottom: 0, left: 4,   right: 4,  height: 5 } },
    { edge: "e",  cursor: "ew-resize", style: { right: 0,  top: 4,    bottom: 4, width: 5 } },
    { edge: "w",  cursor: "ew-resize", style: { left: 0,   top: 4,    bottom: 4, width: 5 } },
    { edge: "ne", cursor: "ne-resize", style: { top: 0,    right: 0,  width: 10, height: 10 } },
    { edge: "nw", cursor: "nw-resize", style: { top: 0,    left: 0,   width: 10, height: 10 } },
    { edge: "se", cursor: "se-resize", style: { bottom: 0, right: 0,  width: 10, height: 10 } },
    { edge: "sw", cursor: "sw-resize", style: { bottom: 0, left: 0,   width: 10, height: 10 } },
  ];

  return (
    <motion.div
      layoutId={id}
      className="absolute flex flex-col rounded-md overflow-visible select-none pointer-events-auto"
      style={{
        x,
        y,
        width:     isMobile ? "90vw" : size.w,
        height:    isMobile ? undefined : size.h,
        minWidth:  MIN_W,
        minHeight: MIN_H,
        background:    "rgba(18,18,20,0.92)",
        border:        `1px solid ${borderColor}`,
        backdropFilter: "blur(16px)",
        boxShadow,
        zIndex: isDragging || isResizing ? 9000 : isActive ? 500 : 100,
        transition: "border-color 0.15s, box-shadow 0.2s",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => { if (!isDragging && !isResizing) setIsActive(false); }}
    >
      {/* ── Resize handles ───────────────────────────────────────────────────── */}
      {!isMobile && edgeHandles.map(({ edge, style, cursor }) => (
        <div
          key={edge}
          onPointerDown={(e) => handleResizePointerDown(e, edge)}
          style={{ position: "absolute", cursor, zIndex: 20, ...style }}
        />
      ))}

      {/* ── Header / drag handle ─────────────────────────────────────────────── */}
      <div
        onPointerDown={handleHeaderPointerDown}
        className={`flex items-center gap-2 px-3 py-2 rounded-t-md shrink-0 ${
          isMobile ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          background:   isDragging ? `rgba(${ACCENT_CLICK},0.12)` : isActive ? `rgba(${ACCENT},0.08)` : HEADER_BG,
          borderBottom: `1px solid ${borderColor}`,
          transition:   "background 0.15s",
          userSelect:   "none",
        }}
      >
        {/* Traffic light dots */}
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60 hover:bg-yellow-400 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60 hover:bg-green-400 transition-colors" />
        </div>

        {icon && (
          <span style={{ color: `rgba(${isActive ? ACCENT_CLICK : ACCENT},0.80)`, transition: "color 0.15s" }}>
            {icon}
          </span>
        )}
        <span
          className="flex-1 text-xs font-mono tracking-widest uppercase"
          style={{ color: `rgba(${isActive ? ACCENT_CLICK : ACCENT},0.90)`, transition: "color 0.15s" }}
        >
          {title}
        </span>

        {!isMobile && (
          <GripHorizontal
            className="w-3.5 h-3.5"
            style={{
              opacity: isDragging ? 0.8 : 0.25,
              color: `rgb(${isDragging ? ACCENT_CLICK : ACCENT})`,
              transition: "color 0.15s, opacity 0.15s",
            }}
          />
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div
        className="flex-1 p-4 text-sm overflow-auto rounded-b-md"
        style={{
          backgroundImage: `
            linear-gradient(${GRID_COLOR} 1px, transparent 1px),
            linear-gradient(90deg, ${GRID_COLOR} 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          color: "rgba(255,255,255,0.45)",
          minHeight: 0,
        }}
      >
        {children}
      </div>

      {/* ── Resize corner hint ───────────────────────────────────────────────── */}
      {!isMobile && (
        <div
          className="absolute bottom-1 right-1 pointer-events-none"
          style={{ opacity: isHovered || isActive ? 0.4 : 0.12, transition: "opacity 0.2s" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M10,2 L2,10" stroke={`rgb(${isActive ? ACCENT_CLICK : ACCENT})`} strokeWidth="1" />
            <path d="M10,6 L6,10" stroke={`rgb(${isActive ? ACCENT_CLICK : ACCENT})`} strokeWidth="1" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
