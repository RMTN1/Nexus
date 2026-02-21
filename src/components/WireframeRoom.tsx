import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Wand2, Activity, ArrowLeft } from "lucide-react";
import AppWindow, { type WallId } from "./AppWindow";
import { useIsMobile } from "@/hooks/use-mobile";

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

// ── Color tokens ───────────────────────────────────────────────────────────────

const BG        = "#1C1C1E";
const BG_CORNER = "#161618";
const ACCENT    = "74,173,220";   // #4AADDC as rgb components

// Subtle white grid (matches reference image)
function wireframeGrid(intensity: "dim" | "normal" | "bright" | "accent" = "normal", size = 40) {
  const c =
    intensity === "accent" ? `rgba(${ACCENT},0.30)` :
    intensity === "bright" ? "rgba(255,255,255,0.08)" :
    intensity === "normal" ? "rgba(255,255,255,0.05)" :
                             "rgba(255,255,255,0.03)";
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
  const gridIntensity = isDragTarget ? "accent" : isPrimary ? "bright" : "normal";
  const borderColor = isDragTarget
    ? `rgba(${ACCENT},0.65)`
    : isPrimary
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.06)";

  return (
    <div
      data-wall={wallId}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: BG,
        border: `1px solid ${borderColor}`,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: isDragTarget
          ? `inset 0 0 40px rgba(${ACCENT},0.08), 0 0 20px rgba(${ACCENT},0.12)`
          : isPrimary
          ? "inset 0 0 60px rgba(255,255,255,0.015)"
          : "none",
        ...wireframeGrid(gridIntensity),
        ...style,
      }}
    >
      {/* Corner glow dots — primary wall only */}
      {isPrimary && (
        <>
          <span className="absolute top-0 left-0 w-2 h-2 rounded-full opacity-50" style={{ background: `rgb(${ACCENT})` }} />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full opacity-50" style={{ background: `rgb(${ACCENT})` }} />
          <span className="absolute bottom-0 left-0 w-2 h-2 rounded-full opacity-50" style={{ background: `rgb(${ACCENT})` }} />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full opacity-50" style={{ background: `rgb(${ACCENT})` }} />
        </>
      )}

      {/* Wall label */}
      <span
        className="absolute top-2 left-3 text-[9px] font-mono tracking-[0.2em] uppercase pointer-events-none select-none"
        style={{ color: "rgba(255,255,255,0.18)" }}
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
              style={{ color: `rgba(${ACCENT},0.55)` }}
            >
              drop here
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative w-full h-full flex flex-wrap gap-3 p-4 md:p-6 pt-8 content-start items-start overflow-y-auto">
        {children}
      </div>
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

export default function WireframeRoom({ onBack }: WireframeRoomProps) {
  const isMobile = useIsMobile();
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [dragging, setDragging] = useState(false);
  const [hoveredWall, setHoveredWall] = useState<WallId | null>(null);

  const moveWindow = (id: string, targetWall: WallId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, wall: targetWall } : w))
    );
  };

  // On mobile all windows collapse to the back wall
  const effectiveWall = (w: WindowState): WallId => (isMobile ? "back" : w.wall);

  const windowsOnWall = (wallId: WallId) =>
    windows.filter((w) => effectiveWall(w) === wallId);

  const wallHandlers = (wallId: WallId) =>
    dragging && !isMobile
      ? {
          onPointerEnter: () => setHoveredWall(wallId),
          onPointerLeave: () => setHoveredWall(null),
        }
      : {};

  const sharedWindowProps = {
    onMoveRequest: moveWindow,
    onDragStart: () => !isMobile && setDragging(true),
    onDragEnd: () => {
      setDragging(false);
      setHoveredWall(null);
    },
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: BG }}
    >
      {/* ── Minimal header ──────────────────────────────────────────────────── */}
      <motion.header
        className="flex items-center justify-between px-4 md:px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back to landing */}
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

        {/* Logo + title */}
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/favicon.svg?v=2" alt="Nexus" className="w-5 h-5 md:w-6 md:h-6" />
          <span
            className="text-sm font-mono tracking-[0.25em] uppercase"
            style={{ color: `rgba(${ACCENT},0.85)` }}
          >
            Nexus
          </span>
        </div>

        {/* Spacer */}
        <div className="w-10 md:w-16" />
      </motion.header>

      {/* ── Room grid ───────────────────────────────────────────────────────── */}
      <motion.div
        className="flex-1"
        style={{
          display: "grid",
          gridTemplateAreas: isMobile
            ? `"back"`
            : `
                ".       ceiling  ."
                "left    back     right"
                ".       floor    ."
              `,
          gridTemplateColumns: isMobile ? "1fr" : "180px 1fr 180px",
          gridTemplateRows:    isMobile ? "1fr"  : "110px 1fr 110px",
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {/* ── Ceiling (desktop only) ──────────────────────────────────────── */}
        {!isMobile && (
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
        )}

        {/* ── Left wall (desktop only) ─────────────────────────────────────── */}
        {!isMobile && (
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
        )}

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

        {/* ── Right wall (desktop only) ────────────────────────────────────── */}
        {!isMobile && (
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
        )}

        {/* ── Floor (desktop only) ─────────────────────────────────────────── */}
        {!isMobile && (
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
        )}

        {/* ── Corner fills (desktop only) ──────────────────────────────────── */}
        {!isMobile && (["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
          (pos) => (
            <div
              key={pos}
              style={{
                background: BG_CORNER,
                border: "1px solid rgba(255,255,255,0.04)",
                gridArea: pos === "top-left"
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
