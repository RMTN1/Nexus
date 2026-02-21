import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { GripHorizontal } from "lucide-react";

export type WallId = "back" | "left" | "right" | "ceiling" | "floor";

export interface AppWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  wall: WallId;
  children?: React.ReactNode;
  /** Called when the user drags the header and drops on a new wall */
  onMoveRequest: (id: string, targetWall: WallId) => void;
  /** Called when a drag starts, so the room can highlight drop zones */
  onDragStart: () => void;
  /** Called when a drag ends (dropped or cancelled) */
  onDragEnd: () => void;
}

const ACCENT      = "74,173,220";   // #4AADDC
const GRID_COLOR  = "rgba(255,255,255,0.06)";
const BORDER      = `rgba(${ACCENT},0.28)`;
const HEADER_BG   = "rgba(255,255,255,0.04)";

export default function AppWindow({
  id,
  title,
  icon,
  children,
  onMoveRequest,
  onDragStart,
  onDragEnd,
}: AppWindowProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setDragging(true);
    onDragStart();

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const finish = () => {
      setDragging(false);
      onDragEnd();
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointerup", finish);
  };

  const handleHeaderPointerUp = (e: React.PointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const wallEl = el?.closest("[data-wall]") as HTMLElement | null;
    if (wallEl) {
      const targetWall = wallEl.dataset.wall as WallId;
      onMoveRequest(id, targetWall);
    }
  };

  return (
    <motion.div
      layout
      layoutId={id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex flex-col rounded-md overflow-hidden select-none"
      style={{
        background: "rgba(28,28,30,0.85)",
        border: `1px solid ${dragging ? `rgba(${ACCENT},0.55)` : BORDER}`,
        backdropFilter: "blur(12px)",
        boxShadow: dragging
          ? `0 0 28px rgba(${ACCENT},0.25), 0 0 56px rgba(${ACCENT},0.10)`
          : `0 0 12px rgba(0,0,0,0.40)`,
        minWidth: 240,
        minHeight: 160,
        zIndex: dragging ? 100 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {/* ── Header / drag handle ────────────────────────────────────────────── */}
      <div
        ref={headerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handleHeaderPointerUp}
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{
          background: dragging ? `rgba(${ACCENT},0.12)` : HEADER_BG,
          borderBottom: `1px solid ${BORDER}`,
          transition: "background 0.15s",
        }}
      >
        {/* Window controls */}
        <div className="flex items-center gap-1.5 mr-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60 hover:bg-yellow-400 transition-colors" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60 hover:bg-green-400 transition-colors" />
        </div>

        {/* Icon + title */}
        {icon && <span style={{ color: `rgba(${ACCENT},0.75)` }}>{icon}</span>}
        <span
          className="flex-1 text-xs font-mono tracking-widest uppercase"
          style={{ color: `rgba(${ACCENT},0.90)` }}
        >
          {title}
        </span>

        {/* Drag hint */}
        <GripHorizontal className="w-3.5 h-3.5 opacity-25" style={{ color: `rgb(${ACCENT})` }} />
      </div>

      {/* ── Content area ────────────────────────────────────────────────────── */}
      <div
        className="flex-1 p-4 text-sm overflow-auto"
        style={{
          backgroundImage: `
            linear-gradient(${GRID_COLOR} 1px, transparent 1px),
            linear-gradient(90deg, ${GRID_COLOR} 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
