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
const BG     = "#0d0d0f";
const ACCENT = "74,173,220";

// ── Clip-path geometry from dynamic BW ────────────────────────────────────────
function buildClipPaths(BW: { x1: number; y1: number; x2: number; y2: number }) {
  return {
    back:    `polygon(${BW.x1}% ${BW.y1}%, ${BW.x2}% ${BW.y1}%, ${BW.x2}% ${BW.y2}%, ${BW.x1}% ${BW.y2}%)`,
    ceiling: `polygon(0% 0%, 100% 0%, ${BW.x2}% ${BW.y1}%, ${BW.x1}% ${BW.y1}%)`,
    floor:   `polygon(${BW.x1}% ${BW.y2}%, ${BW.x2}% ${BW.y2}%, 100% 100%, 0% 100%)`,
    left:    `polygon(0% 0%, ${BW.x1}% ${BW.y1}%, ${BW.x1}% ${BW.y2}%, 0% 100%)`,
    right:   `polygon(${BW.x2}% ${BW.y1}%, 100% 0%, 100% 100%, ${BW.x2}% ${BW.y2}%)`,
  } as Record<WallId, string>;
}

// ── Wall label config ─────────────────────────────────────────────────────────
interface WallLabelCfg {
  id: WallId;
  glyph: string;
  name: string;
  // Position of label as percentage of screen (visual centroid of trapezoid)
  cx: (BW: { x1: number; y1: number; x2: number; y2: number }) => number;
  cy: (BW: { x1: number; y1: number; x2: number; y2: number }) => number;
  rotate?: number;
}

const WALL_LABEL_CFGS: WallLabelCfg[] = [
  {
    id: "ceiling", glyph: "▲", name: "Ceiling",
    cx: (BW) => 50,
    cy: (BW) => BW.y1 / 2,
  },
  {
    id: "left", glyph: "◀", name: "Left",
    cx: (BW) => BW.x1 / 2,
    cy: () => 50,
    rotate: -90,
  },
  {
    id: "back", glyph: "◉", name: "Back Wall",
    cx: () => 50,
    cy: (BW) => (BW.y1 + BW.y2) / 2,
  },
  {
    id: "right", glyph: "▶", name: "Right",
    cx: (BW) => (BW.x2 + 100) / 2,
    cy: () => 50,
    rotate: 90,
  },
  {
    id: "floor", glyph: "▼", name: "Floor",
    cx: () => 50,
    cy: (BW) => (BW.y2 + 100) / 2,
  },
];

// ── Wall cockpit overlay (pure visual — no windows inside) ────────────────────
interface WallOverlayProps {
  wallId: WallId;
  clipPath: string;
  isDragTarget: boolean;
  isPrimary?: boolean;
  label: WallLabelCfg;
  BW: { x1: number; y1: number; x2: number; y2: number };
  dragHandlers: Record<string, unknown>;
}

function WallOverlay({
  wallId,
  clipPath,
  isDragTarget,
  isPrimary = false,
  label,
  BW,
  dragHandlers,
}: WallOverlayProps) {
  const bgColor = isDragTarget
    ? `rgba(${ACCENT},0.10)`
    : isPrimary
    ? "rgba(14,14,18,0.50)"
    : "rgba(10,10,14,0.35)";

  const lx = label.cx(BW);
  const ly = label.cy(BW);

  return (
    <div
      data-wall={wallId}
      className="absolute inset-0 pointer-events-auto"
      style={{
        clipPath,
        background: bgColor,
        transition: "background 0.2s",
        outline: isDragTarget ? `2px solid rgba(${ACCENT},0.55)` : undefined,
      }}
      {...(dragHandlers as React.HTMLAttributes<HTMLDivElement>)}
    >
      {/* ── Permanent wall label ──────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none select-none flex flex-col items-center gap-0.5"
        style={{
          left:      `${lx}%`,
          top:       `${ly}%`,
          transform: `translate(-50%, -50%) rotate(${label.rotate ?? 0}deg)`,
        }}
      >
        <span
          className="text-[10px] font-mono tracking-[0.35em] uppercase"
          style={{ color: isDragTarget ? `rgba(${ACCENT},0.80)` : `rgba(${ACCENT},0.28)` }}
        >
          {label.glyph} {label.name}
        </span>
        {/* Subtle tick marks flanking the label */}
        <span
          className="block w-6 border-t"
          style={{ borderColor: isDragTarget ? `rgba(${ACCENT},0.50)` : `rgba(${ACCENT},0.14)` }}
        />
      </div>

      {/* ── Drop-target CTA ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDragTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              paddingTop:    wallId === "floor"   ? "12%" : undefined,
              paddingBottom: wallId === "ceiling" ? "12%" : undefined,
            }}
          >
            <span
              className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded mt-5"
              style={{
                color:      `rgba(${ACCENT},0.80)`,
                border:     `1px solid rgba(${ACCENT},0.30)`,
                background: "rgba(0,0,0,0.40)",
              }}
            >
              release to attach
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back wall corner accent dots ──────────────────────────────────────── */}
      {isPrimary && !isDragTarget && (
        <>
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-50"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y1}%`, left: `${BW.x1}%` }} />
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-50"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y1}%`, left: `${BW.x2}%` }} />
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-50"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y2}%`, left: `${BW.x1}%` }} />
          <span className="absolute rounded-full w-1.5 h-1.5 opacity-50"
            style={{ background: `rgb(${ACCENT})`, top: `${BW.y2}%`, left: `${BW.x2}%` }} />
        </>
      )}
    </div>
  );
}

// ── Placeholder window content ─────────────────────────────────────────────────
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

const WALL_DEFS: { id: WallId; primary?: boolean }[] = [
  { id: "ceiling" },
  { id: "left" },
  { id: "back",  primary: true },
  { id: "right" },
  { id: "floor" },
];

export default function WireframeRoom({ onBack }: WireframeRoomProps) {
  const isMobile = useIsMobile();
  const { vw, vh } = useWindowSize();

  const { BW } = useMemo(() => computeGeometry(vw, vh), [vw, vh]);
  const CP     = useMemo(() => buildClipPaths(BW), [BW]);

  const [windows,     setWindows]     = useState<WindowState[]>(INITIAL_WINDOWS);
  const [dragging,    setDragging]    = useState(false);
  const [hoveredWall, setHoveredWall] = useState<WallId | null>(null);

  const moveWindow = (id: string, targetWall: WallId) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, wall: targetWall } : w)));
  };

  const sharedWindowProps = {
    onMoveRequest: moveWindow,
    onDragStart:   () => setDragging(true),
    onDragEnd:     () => { setDragging(false); setHoveredWall(null); },
    onHoverWall:   (wall: WallId | null) => setHoveredWall(wall),
  };

  const wallDragHandlers = (wallId: WallId) =>
    dragging && !isMobile
      ? {
          onPointerEnter: () => setHoveredWall(wallId),
          onPointerLeave: () => setHoveredWall(null),
        }
      : {};

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: BG }}
    >
      {/* ── Layer 0: Bright perspective room SVG ─────────────────────────────── */}
      <Grid3D position="absolute" variant="bright" />

      {/* ── Layer 1: Cockpit wall overlays (no windows inside, purely visual) ── */}
      {!isMobile && WALL_DEFS.map(({ id, primary }) => {
        const labelCfg = WALL_LABEL_CFGS.find((l) => l.id === id)!;
        return (
          <WallOverlay
            key={id}
            wallId={id}
            clipPath={CP[id]}
            isDragTarget={hoveredWall === id}
            isPrimary={primary}
            label={labelCfg}
            BW={BW}
            dragHandlers={wallDragHandlers(id)}
          />
        );
      })}

      {/* ── Layer 2: Floating windows — above cockpit, below header ──────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
      >
        {windows.map((w, i) => (
          <AppWindow
            key={w.id}
            {...w}
            stackIndex={i}
            {...sharedWindowProps}
          >
            <PlaceholderContent description={w.description} />
          </AppWindow>
        ))}

        {/* Mobile: simple stacked layout in back wall area */}
        {isMobile && (
          <div
            className="absolute flex flex-col gap-3 p-4 overflow-y-auto pointer-events-auto"
            style={{
              top:    `${BW.y1}%`,
              left:   `${BW.x1}%`,
              width:  `${BW.x2 - BW.x1}%`,
              height: `${BW.y2 - BW.y1}%`,
            }}
          >
            {windows.map((w, i) => (
              <AppWindow key={w.id} {...w} stackIndex={i} {...sharedWindowProps}>
                <PlaceholderContent description={w.description} />
              </AppWindow>
            ))}
          </div>
        )}
      </div>

      {/* ── Layer 3: Header ───────────────────────────────────────────────────── */}
      <motion.header
        className="absolute top-0 inset-x-0 flex items-center px-4 md:px-5 py-3"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex: 200,
        }}
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
          <span className="text-xs font-mono tracking-wider uppercase hidden sm:inline">Back</span>
        </button>
      </motion.header>
    </div>
  );
}
