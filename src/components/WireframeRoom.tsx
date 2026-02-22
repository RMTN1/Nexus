import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Wand2, Activity, ArrowLeft } from "lucide-react";
import AppWindow, { type WallId } from "./AppWindow";
import Grid3D from "./Grid3D";
import { computeGeometry } from "@/lib/room-geometry";
import { useWindowSize } from "@/hooks/use-window-size";
import { useIsMobile } from "@/hooks/use-mobile";

interface WireframeRoomProps {
  onBack?: () => void;
}

interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  wall: WallId;
}

// ── Color tokens ───────────────────────────────────────────────────────────────
const BG     = "#1C1C1E";
const ACCENT = "74,173,220";

// ── Build clip-path strings from dynamic BW ────────────────────────────────────
function buildClipPaths(BW: { x1: number; y1: number; x2: number; y2: number }) {
  return {
    back:    `polygon(${BW.x1}% ${BW.y1}%, ${BW.x2}% ${BW.y1}%, ${BW.x2}% ${BW.y2}%, ${BW.x1}% ${BW.y2}%)`,
    ceiling: `polygon(0% 0%, 100% 0%, ${BW.x2}% ${BW.y1}%, ${BW.x1}% ${BW.y1}%)`,
    floor:   `polygon(${BW.x1}% ${BW.y2}%, ${BW.x2}% ${BW.y2}%, 100% 100%, 0% 100%)`,
    left:    `polygon(0% 0%, ${BW.x1}% ${BW.y1}%, ${BW.x1}% ${BW.y2}%, 0% 100%)`,
    right:   `polygon(${BW.x2}% ${BW.y1}%, 100% 0%, 100% 100%, ${BW.x2}% ${BW.y2}%)`,
  } as Record<WallId, string>;
}

// ── Wall overlay ───────────────────────────────────────────────────────────────
interface WallOverlayProps {
  wallId: WallId;
  label: string;
  clipPath: string;
  isDragTarget: boolean;
  isPrimary?: boolean;
  BW: { x1: number; y1: number; x2: number; y2: number };
  children?: React.ReactNode;
  dragHandlers: Record<string, unknown>;
}

function WallOverlay({
  wallId,
  label,
  clipPath,
  isDragTarget,
  isPrimary = false,
  BW,
  children,
  dragHandlers,
}: WallOverlayProps) {
  const bgColor = isDragTarget
    ? `rgba(${ACCENT},0.08)`
    : isPrimary
    ? "rgba(28,28,30,0.45)"
    : "rgba(28,28,30,0.30)";

  return (
    <div
      data-wall={wallId}
      className="absolute inset-0 pointer-events-auto"
      style={{
        clipPath,
        background: bgColor,
        outline: isDragTarget ? `2px solid rgba(${ACCENT},0.55)` : undefined,
        transition: "background 0.2s",
      }}
      {...(dragHandlers as React.HTMLAttributes<HTMLDivElement>)}
    >
      {/* Drop hint */}
      <AnimatePresence>
        {isDragTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              paddingTop:    wallId === "floor"   ? "8%"  : undefined,
              paddingBottom: wallId === "ceiling" ? "8%"  : undefined,
            }}
          >
            <span
              className="text-xs font-mono tracking-widest uppercase px-3 py-1 rounded"
              style={{
                color: `rgba(${ACCENT},0.75)`,
                border: `1px solid rgba(${ACCENT},0.25)`,
                background: "rgba(0,0,0,0.35)",
              }}
            >
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Window container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pointer-events-auto w-full h-full flex flex-wrap gap-3 p-4 content-start items-start">
          {children}
        </div>
      </div>

      {/* Wall label */}
      <span
        className="absolute text-[8px] font-mono tracking-[0.25em] uppercase pointer-events-none select-none"
        style={{
          color: `rgba(${ACCENT},0.22)`,
          top:   wallId === "floor" ? "30%" : wallId === "ceiling" ? "12%" : "8px",
          left:  wallId === "right" ? undefined : "12px",
          right: wallId === "right" ? "12px"    : undefined,
        }}
      >
        {wallId}
      </span>

      {/* Corner accent dots — back wall only */}
      {isPrimary && !isDragTarget && (
        <>
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-60"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y1}%`, left: `${BW.x1}%` }} />
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-60"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y1}%`, left: `${BW.x2}%` }} />
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-60"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y2}%`, left: `${BW.x1}%` }} />
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-60"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y2}%`, left: `${BW.x2}%` }} />
        </>
      )}
    </div>
  );
}

// ── Placeholder content ────────────────────────────────────────────────────────
function PlaceholderContent({ description }: { description: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-1">
      <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
        {description}
      </p>
      <div className="flex-1 flex items-center justify-center">
        <span
          className="text-[10px] font-mono tracking-widest uppercase border px-3 py-1 rounded"
          style={{ color: `rgba(${ACCENT},0.45)`, borderColor: `rgba(${ACCENT},0.20)` }}
        >
          — coming soon —
        </span>
      </div>
    </div>
  );
}

// ── WireframeRoom ─────────────────────────────────────────────────────────────
const INITIAL_WINDOWS: WindowState[] = [
  {
    id: "nexus",
    title: "Nexus",
    icon: <LayoutGrid className="w-3.5 h-3.5" />,
    description: "Universal UI aggregator — your central operating interface.",
    wall: "back",
  },
  {
    id: "ace",
    title: "App Creation Engine",
    icon: <Wand2 className="w-3.5 h-3.5" />,
    description: "Build and deploy apps without a full dev team.",
    wall: "back",
  },
  {
    id: "workout",
    title: "Workout AI",
    icon: <Activity className="w-3.5 h-3.5" />,
    description: "NASM CPT-certified AI personal trainer at your fingertips.",
    wall: "left",
  },
];

const WALL_DEFS: { id: WallId; label: string; primary?: boolean }[] = [
  { id: "back",    label: "drop on back wall", primary: true },
  { id: "ceiling", label: "drop on ceiling" },
  { id: "floor",   label: "drop on floor" },
  { id: "left",    label: "drop on left wall" },
  { id: "right",   label: "drop on right wall" },
];

export default function WireframeRoom({ onBack }: WireframeRoomProps) {
  const isMobile = useIsMobile();
  const { vw, vh } = useWindowSize();

  // ── Dynamic geometry (square tiles, matching Grid3D) ──────────────────────
  const { BW } = useMemo(() => computeGeometry(vw, vh), [vw, vh]);
  const CP = useMemo(() => buildClipPaths(BW), [BW]);

  const [windows,     setWindows]     = useState<WindowState[]>(INITIAL_WINDOWS);
  const [dragging,    setDragging]    = useState(false);
  const [hoveredWall, setHoveredWall] = useState<WallId | null>(null);

  const moveWindow = (id: string, targetWall: WallId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, wall: targetWall } : w))
    );
  };

  const effectiveWall  = (w: WindowState): WallId => (isMobile ? "back" : w.wall);
  const windowsOnWall  = (wallId: WallId) => windows.filter((w) => effectiveWall(w) === wallId);

  const wallDragHandlers = (wallId: WallId) =>
    dragging && !isMobile
      ? {
          onPointerEnter: () => setHoveredWall(wallId),
          onPointerLeave: () => setHoveredWall(null),
        }
      : {};

  const sharedWindowProps = {
    onMoveRequest: moveWindow,
    onDragStart:   () => !isMobile && setDragging(true),
    onDragEnd:     () => { setDragging(false); setHoveredWall(null); },
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: BG }}
    >
      {/* ── Perspective room SVG background ──────────────────────────────────── */}
      <Grid3D position="absolute" opacity={0.75} />

      {/* ── Trapezoid wall overlays ───────────────────────────────────────────── */}
      {!isMobile && WALL_DEFS.map(({ id, label, primary }) => (
        <WallOverlay
          key={id}
          wallId={id}
          label={label}
          clipPath={CP[id]}
          isDragTarget={hoveredWall === id}
          isPrimary={primary}
          BW={BW}
          dragHandlers={wallDragHandlers(id)}
        >
          {windowsOnWall(id).map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </WallOverlay>
      ))}

      {/* ── Mobile: all windows in back wall area ────────────────────────────── */}
      {isMobile && (
        <div
          className="absolute flex flex-col gap-3 p-4 overflow-y-auto"
          style={{
            top:    `${BW.y1}%`,
            left:   `${BW.x1}%`,
            width:  `${BW.x2 - BW.x1}%`,
            height: `${BW.y2 - BW.y1}%`,
          }}
        >
          {windows.map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.header
        className="absolute top-0 inset-x-0 flex items-center px-4 md:px-5 py-3 z-50"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={onBack ?? (() => { window.location.href = "/"; })}
          className="flex items-center gap-2 group"
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)" }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-mono tracking-wider uppercase hidden sm:inline">
            Back
          </span>
        </button>
      </motion.header>
    </div>
  );
}
