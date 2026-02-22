import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export type WallId = "back" | "left" | "right" | "ceiling" | "floor";

export interface AppWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  wall: WallId;
  children?: React.ReactNode;
  onMoveRequest: (id: string, targetWall: WallId) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const ACCENT       = "74,173,220";    // #4AADDC  — hover glow
const ACCENT_CLICK = "212,175,55";    // #D4AF37  — active/click glow (gold)
const GRID_COLOR   = "rgba(255,255,255,0.06)";
const BORDER       = `rgba(${ACCENT},0.28)`;
const HEADER_BG    = "rgba(255,255,255,0.04)";

// Minimum window size in px
const MIN_W = 200;
const MIN_H = 130;

type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

export default function AppWindow({
  id,
  title,
  icon,
  children,
  onMoveRequest,
  onDragStart,
  onDragEnd,
}: AppWindowProps) {
  const isMobile = useIsMobile();

  // ── Window size (user-resizable) ─────────────────────────────────────────
  const [size, setSize] = useState({ w: 260, h: 180 });

  // ── Interaction states ───────────────────────────────────────────────────
  const [isDragging,  setIsDragging]  = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);
  const [isActive,    setIsActive]    = useState(false);   // clicked / focused
  const [isResizing,  setIsResizing]  = useState(false);

  const resizeEdgeRef   = useRef<ResizeEdge>(null);
  const resizeStartRef  = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // ── Derived glow ─────────────────────────────────────────────────────────
  const glowColor = isActive || isDragging ? ACCENT_CLICK : ACCENT;
  const glowOn    = isHovered || isDragging || isActive;

  const boxShadow = glowOn
    ? `0 0 18px rgba(${glowColor},0.35), 0 0 48px rgba(${glowColor},0.15), inset 0 0 12px rgba(${glowColor},0.04)`
    : "0 0 12px rgba(0,0,0,0.40)";

  const borderColor = glowOn
    ? `rgba(${glowColor},${isDragging || isActive ? "0.65" : "0.45"})`
    : BORDER;

  // ── Header drag (move window to another wall) ────────────────────────────
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if (isMobile || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setIsActive(true);
    onDragStart();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const finish = (up: PointerEvent) => {
      // Find which wall is under the pointer on release
      const el = document.elementFromPoint(up.clientX, up.clientY) as HTMLElement | null;
      const wallEl = el?.closest("[data-wall]") as HTMLElement | null;
      if (wallEl) {
        const targetWall = wallEl.dataset.wall as WallId;
        onMoveRequest(id, targetWall);
      }
      setIsDragging(false);
      onDragEnd();
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointerup", finish);
  };

  // ── Edge resize ──────────────────────────────────────────────────────────
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
        const edge = resizeEdgeRef.current!;

        setSize((prev) => {
          let { w, h } = prev;
          if (edge.includes("e")) w = Math.max(MIN_W, resizeStartRef.current.w + dx);
          if (edge.includes("w")) w = Math.max(MIN_W, resizeStartRef.current.w - dx);
          if (edge.includes("s")) h = Math.max(MIN_H, resizeStartRef.current.h + dy);
          if (edge.includes("n")) h = Math.max(MIN_H, resizeStartRef.current.h - dy);
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
    [isMobile, size.w, size.h]
  );

  // ── Resize handle renderer ───────────────────────────────────────────────
  const edgeHandles: { edge: ResizeEdge; style: React.CSSProperties; cursor: string }[] = [
    { edge: "n",  cursor: "ns-resize",   style: { top: 0,    left: 4,  right: 4, height: 5 } },
    { edge: "s",  cursor: "ns-resize",   style: { bottom: 0, left: 4,  right: 4, height: 5 } },
    { edge: "e",  cursor: "ew-resize",   style: { right: 0,  top: 4,   bottom: 4, width: 5 } },
    { edge: "w",  cursor: "ew-resize",   style: { left: 0,   top: 4,   bottom: 4, width: 5 } },
    { edge: "ne", cursor: "ne-resize",   style: { top: 0,    right: 0,  width: 10, height: 10 } },
    { edge: "nw", cursor: "nw-resize",   style: { top: 0,    left: 0,   width: 10, height: 10 } },
    { edge: "se", cursor: "se-resize",   style: { bottom: 0, right: 0,  width: 10, height: 10 } },
    { edge: "sw", cursor: "sw-resize",   style: { bottom: 0, left: 0,   width: 10, height: 10 } },
  ];

  return (
    <motion.div
      layout
      layoutId={id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="relative flex flex-col rounded-md overflow-visible select-none"
      style={{
        background: "rgba(28,28,30,0.88)",
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(12px)",
        boxShadow,
        width:  isMobile ? "100%" : size.w,
        height: isMobile ? undefined : size.h,
        minWidth:  isMobile ? 0   : MIN_W,
        minHeight: isMobile ? 90  : MIN_H,
        zIndex: isDragging || isResizing ? 200 : isActive ? 10 : 1,
        transition: "border-color 0.15s, box-shadow 0.2s",
        cursor: isResizing ? undefined : "default",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => {
        // Deactivate only if not dragging/resizing
        if (!isDragging && !isResizing) setIsActive(false);
      }}
      onBlur={() => setIsActive(false)}
    >
      {/* ── Resize handles (desktop only) ─────────────────────────────────────── */}
      {!isMobile && edgeHandles.map(({ edge, style, cursor }) => (
        <div
          key={edge}
          onPointerDown={(e) => handleResizePointerDown(e, edge)}
          style={{
            position: "absolute",
            cursor,
            zIndex: 20,
            ...style,
          }}
        />
      ))}

      {/* ── Header / drag handle ─────────────────────────────────────────────── */}
      <div
        onPointerDown={handleHeaderPointerDown}
        className={`flex items-center gap-2 px-3 py-2 rounded-t-md ${
          isMobile ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          background: isDragging ? `rgba(${ACCENT_CLICK},0.12)` : isActive ? `rgba(${ACCENT},0.08)` : HEADER_BG,
          borderBottom: `1px solid ${borderColor}`,
          transition: "background 0.15s",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {/* Traffic light dots */}
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60 hover:bg-yellow-400 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60 hover:bg-green-400 transition-colors" />
        </div>

        {/* Icon + title */}
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

        {/* Drag hint */}
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

      {/* ── Content area ───────────────────────────────────────────────────────── */}
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

      {/* ── Resize corner visual hint (se corner) ──────────────────────────────── */}
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
