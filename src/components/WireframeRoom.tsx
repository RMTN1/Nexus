import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Wand2, Activity, ArrowLeft } from "lucide-react";
import AppWindow, { type WallId } from "./AppWindow";

interface WireframeRoomProps {
  onBack?: () => void;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  wall: WallId;
}

// ── Wireframe grid helper ──────────────────────────────────────────────────────

function wireframeGrid(opacity = 0.22, size = 40) {
  const c = `rgba(96,165,250,${opacity})`;
  return {
    backgroundImage: `
      linear-gradient(${c} 1px, transparent 1px),
      linear-gradient(90deg, ${c} 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
  } as React.CSSProperties;
}

// ── Wall surface ───────────────────────────────────────────────────────────────

interface WallProps {
  wallId: WallId;
  label: string;
  labelPos?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  style?: React.CSSProperties;
  className?: string;
  isDragTarget: boolean;
  isPrimary?: boolean;
  children?: React.ReactNode;
}

function WallSurface({
  wallId,
  label,
  style,
  className = "",
  isDragTarget,
  isPrimary = false,
  children,
}: WallProps) {
  const gridOpacity = isDragTarget ? 0.45 : isPrimary ? 0.28 : 0.18;
  const borderColor = isDragTarget
    ? "rgba(96,165,250,0.7)"
    : isPrimary
    ? "rgba(96,165,250,0.35)"
    : "rgba(96,165,250,0.15)";

  return (
    <div
      data-wall={wallId}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "#050810",
        border: `1px solid ${borderColor}`,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: isDragTarget
          ? `inset 0 0 40px rgba(96,165,250,0.12), 0 0 20px rgba(96,165,250,0.15)`
          : isPrimary
          ? "inset 0 0 60px rgba(96,165,250,0.04)"
          : "none",
        ...wireframeGrid(gridOpacity),
        ...style,
      }}
    >
      {/* Corner glow dots */}
      {isPrimary && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 rounded-full bg-[#60a5fa] opacity-40" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#60a5fa] opacity-40" />
          <span className="absolute bottom-0 left-0 w-2 h-2 rounded-full bg-[#60a5fa] opacity-40" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#60a5fa] opacity-40" />
        </>
      )}

      {/* Wall label */}
      <span
        className="absolute top-2 left-3 text-[9px] font-mono tracking-[0.2em] uppercase pointer-events-none select-none"
        style={{ color: "rgba(96,165,250,0.35)" }}
      >
        {label}
      </span>

      {/* Drop target overlay */}
      <AnimatePresence>
        {isDragTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <span
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "rgba(96,165,250,0.5)" }}
            >
              drop here
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative w-full h-full flex flex-wrap gap-3 p-6 pt-8 content-start items-start">
        {children}
      </div>
    </div>
  );
}

// ── Placeholder window content ─────────────────────────────────────────────────

function PlaceholderContent({ description }: { description: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-1">
      <p className="text-xs font-mono" style={{ color: "rgba(96,165,250,0.5)" }}>
        {description}
      </p>
      <div className="flex-1 flex items-center justify-center">
        <span
          className="text-[10px] font-mono tracking-widest uppercase border px-3 py-1 rounded"
          style={{ color: "rgba(96,165,250,0.3)", borderColor: "rgba(96,165,250,0.2)" }}
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

export default function WireframeRoom({ onBack }: WireframeRoomProps) {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [dragging, setDragging] = useState(false);
  const [hoveredWall, setHoveredWall] = useState<WallId | null>(null);

  const moveWindow = (id: string, targetWall: WallId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, wall: targetWall } : w))
    );
  };

  const windowsOnWall = (wallId: WallId) =>
    windows.filter((w) => w.wall === wallId);

  // Wall pointer-enter/leave to highlight drop targets
  const wallHandlers = (wallId: WallId) =>
    dragging
      ? {
          onPointerEnter: () => setHoveredWall(wallId),
          onPointerLeave: () => setHoveredWall(null),
        }
      : {};

  const sharedWindowProps = {
    onMoveRequest: moveWindow,
    onDragStart: () => setDragging(true),
    onDragEnd: () => {
      setDragging(false);
      setHoveredWall(null);
    },
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: "#050810" }}
    >
      {/* ── Minimal header ──────────────────────────────────────────────────── */}
      <motion.header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(96,165,250,0.12)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back to landing */}
        <button
          onClick={onBack ?? (() => { window.location.href = "/"; })}
          className="flex items-center gap-2 group"
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(96,165,250,0.5)" }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-mono tracking-wider uppercase hidden sm:inline">
            Back
          </span>
        </button>

        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Nexus Node" className="w-6 h-6" />
          <span
            className="text-sm font-mono tracking-[0.25em] uppercase"
            style={{ color: "rgba(96,165,250,0.8)" }}
          >
            Nexus Node
          </span>
        </div>

        {/* Spacer */}
        <div className="w-16" />
      </motion.header>

      {/* ── Room grid ───────────────────────────────────────────────────────── */}
      <motion.div
        className="flex-1 grid"
        style={{
          gridTemplateAreas: `
            ".       ceiling  ."
            "left    back     right"
            ".       floor    ."
          `,
          gridTemplateColumns: "180px 1fr 180px",
          gridTemplateRows: "110px 1fr 110px",
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {/* ── Ceiling ─────────────────────────────────────────────────────── */}
        <WallSurface
          wallId="ceiling"
          label="▲ Ceiling"
          isDragTarget={hoveredWall === "ceiling"}
          style={{
            gridArea: "ceiling",
            transform: "perspective(600px) rotateX(-5deg)",
            transformOrigin: "bottom center",
          }}
          {...wallHandlers("ceiling")}
        >
          {windowsOnWall("ceiling").map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </WallSurface>

        {/* ── Left wall ───────────────────────────────────────────────────── */}
        <WallSurface
          wallId="left"
          label="◀ Left"
          isDragTarget={hoveredWall === "left"}
          style={{
            gridArea: "left",
            transform: "perspective(600px) rotateY(6deg)",
            transformOrigin: "right center",
          }}
          {...wallHandlers("left")}
        >
          {windowsOnWall("left").map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </WallSurface>

        {/* ── Back wall (primary) ─────────────────────────────────────────── */}
        <WallSurface
          wallId="back"
          label="◉ Back Wall"
          isDragTarget={hoveredWall === "back"}
          isPrimary
          style={{ gridArea: "back" }}
          {...wallHandlers("back")}
        >
          {windowsOnWall("back").map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </WallSurface>

        {/* ── Right wall ──────────────────────────────────────────────────── */}
        <WallSurface
          wallId="right"
          label="Right ▶"
          isDragTarget={hoveredWall === "right"}
          style={{
            gridArea: "right",
            transform: "perspective(600px) rotateY(-6deg)",
            transformOrigin: "left center",
          }}
          {...wallHandlers("right")}
        >
          {windowsOnWall("right").map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </WallSurface>

        {/* ── Floor ───────────────────────────────────────────────────────── */}
        <WallSurface
          wallId="floor"
          label="▼ Floor"
          isDragTarget={hoveredWall === "floor"}
          style={{
            gridArea: "floor",
            transform: "perspective(600px) rotateX(5deg)",
            transformOrigin: "top center",
          }}
          {...wallHandlers("floor")}
        >
          {windowsOnWall("floor").map((w) => (
            <AppWindow key={w.id} {...w} {...sharedWindowProps}>
              <PlaceholderContent description={w.description} />
            </AppWindow>
          ))}
        </WallSurface>

        {/* ── Corner fills (top-left, top-right, bottom-left, bottom-right) ── */}
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
          (pos) => (
            <div
              key={pos}
              style={{
                background: "#030608",
                border: "1px solid rgba(96,165,250,0.08)",
                gridArea: pos.replace("-", "") === "topleft"
                  ? "1 / 1 / 2 / 2"
                  : pos === "top-right"
                  ? "1 / 3 / 2 / 4"
                  : pos === "bottom-left"
                  ? "3 / 1 / 4 / 2"
                  : "3 / 3 / 4 / 4",
              }}
            />
          )
        )}
      </motion.div>
    </div>
  );
}
