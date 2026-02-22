import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWindowSize } from "@/hooks/use-window-size";
import {
  computeGeometry,
  buildBackWallLines,
  buildFloorLines,
  buildCeilingLines,
  buildLeftLines,
  buildRightLines,
  type GridLine,
} from "@/lib/room-geometry";

// ── Color tokens — per variant ─────────────────────────────────────────────────
//   dim    = landing page idle (muted, atmospheric)
//   normal = default mid
//   bright = dashboard "activated" room (vivid, always-on)

const VARIANTS = {
  dim:    { line: 0.06, lineBw: 0.13, edge: 0.22, glow: 0.06 },
  normal: { line: 0.15, lineBw: 0.30, edge: 0.50, glow: 0.08 },
  bright: { line: 0.32, lineBw: 0.62, edge: 0.85, glow: 0.14 },
} as const;

type Variant = keyof typeof VARIANTS;

function rgba(a: number) { return `rgba(96,165,250,${a})`; }

const GLOW_BW = "rgba(96,165,250,1.00)";
const GLOW_W  = "rgba(96,165,250,0.70)";

// ── Grid3D props ──────────────────────────────────────────────────────────────

interface Grid3DProps {
  opacity?: number;
  position?: "fixed" | "absolute";
  /** Controls baseline line brightness */
  variant?: Variant;
  /** When true, triggers the grid activation glow-wave from the VP */
  activated?: boolean;
}

// ── Glow delay helpers ────────────────────────────────────────────────────────

/** Pixel-space distance from a viewBox point to the VP (50,50), given viewport */
function distFromVP(midX: number, midY: number, vw: number, vh: number): number {
  const px = (midX / 100) * vw - vw / 2;
  const py = (midY / 100) * vh - vh / 2;
  return Math.sqrt(px * px + py * py);
}

// ── Animated line components ──────────────────────────────────────────────────

interface BWLineProps {
  line: GridLine;
  delay: number;
  activated: boolean;
  activationKey: number;
  baseColor: string;
}

function BWLine({ line, delay, activated, activationKey, baseColor }: BWLineProps) {
  return (
    <motion.path
      key={activationKey}
      d={line.d}
      fill="none"
      strokeWidth={0.20}
      animate={
        activated
          ? { stroke: [baseColor, GLOW_BW, baseColor], strokeWidth: [0.20, 0.55, 0.20] }
          : { stroke: baseColor, strokeWidth: 0.20 }
      }
      transition={activated ? { duration: 1.0, delay, ease: "easeOut" } : { duration: 0 }}
      style={{ stroke: baseColor }}
    />
  );
}

interface PerspLineProps {
  line: GridLine;
  delay: number;
  activated: boolean;
  activationKey: number;
  baseColor: string;
}

function PerspLine({ line, delay, activated, activationKey, baseColor }: PerspLineProps) {
  return (
    <motion.path
      key={activationKey}
      d={line.d}
      fill="none"
      strokeWidth={0.18}
      animate={
        activated
          ? { stroke: [baseColor, GLOW_W, baseColor], strokeWidth: [0.18, 0.45, 0.18] }
          : { stroke: baseColor, strokeWidth: 0.18 }
      }
      transition={activated ? { duration: 0.8, delay, ease: "easeOut" } : { duration: 0 }}
      style={{ stroke: baseColor }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Grid3D({
  opacity = 1,
  position = "fixed",
  variant = "normal",
  activated = false,
}: Grid3DProps) {
  const v = VARIANTS[variant];
  const LINE    = rgba(v.line);
  const LINE_BW = rgba(v.lineBw);
  const EDGE    = rgba(v.edge);
  const { vw, vh } = useWindowSize();
  const { BW, VP, cols, rows } = useMemo(
    () => computeGeometry(vw, vh),
    [vw, vh]
  );

  // activationKey increments on each new activation so framer re-runs animation
  const [activationKey, setActivationKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (activated && !isAnimating) {
      setActivationKey((k) => k + 1);
      setIsAnimating(true);
      // Reset after animation completes (longest delay ~0.5s + duration 1.0s)
      const t = setTimeout(() => setIsAnimating(false), 1600);
      return () => clearTimeout(t);
    }
  }, [activated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build all line arrays ──────────────────────────────────────────────────
  const bwLines    = useMemo(() => buildBackWallLines(BW, cols, rows), [BW, cols, rows]);
  const floorLines = useMemo(() => buildFloorLines(BW, cols, rows),    [BW, cols, rows]);
  const ceilLines  = useMemo(() => buildCeilingLines(BW, cols, rows),  [BW, cols, rows]);
  const leftLines  = useMemo(() => buildLeftLines(BW, cols, rows),     [BW, cols, rows]);
  const rightLines = useMemo(() => buildRightLines(BW, cols, rows),    [BW, cols, rows]);

  // ── Compute glow delays for BW lines ──────────────────────────────────────
  const bwDistances = useMemo(
    () => bwLines.map((l) => distFromVP(l.midX, l.midY, vw, vh)),
    [bwLines, vw, vh]
  );
  const bwMaxDist = Math.max(...bwDistances, 1);

  // ── Compute glow delays for perspective lines (BW endpoint distance) ───────
  // Each perspective line's BW endpoint is closest to VP; animate from there outward.
  // Use midpoint distance as a proxy: closer midpoint = BW endpoint closer = lower delay.
  const perspDelayOf = (line: GridLine) =>
    (distFromVP(line.midX, line.midY, vw, vh) / bwMaxDist) * 0.4;

  return (
    <div
      className="pointer-events-none"
      style={{ position, top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      >
        {/* ── Floor ─────────────────────────────────────────────────────────── */}
        {floorLines.map((l, i) => (
          <PerspLine key={`fl-${i}`} line={l} delay={perspDelayOf(l)}
            activated={isAnimating} activationKey={activationKey} baseColor={LINE} />
        ))}

        {/* ── Ceiling ───────────────────────────────────────────────────────── */}
        {ceilLines.map((l, i) => (
          <PerspLine key={`cl-${i}`} line={l} delay={perspDelayOf(l)}
            activated={isAnimating} activationKey={activationKey} baseColor={LINE} />
        ))}

        {/* ── Left wall ─────────────────────────────────────────────────────── */}
        {leftLines.map((l, i) => (
          <PerspLine key={`lw-${i}`} line={l} delay={perspDelayOf(l)}
            activated={isAnimating} activationKey={activationKey} baseColor={LINE} />
        ))}

        {/* ── Right wall ────────────────────────────────────────────────────── */}
        {rightLines.map((l, i) => (
          <PerspLine key={`rw-${i}`} line={l} delay={perspDelayOf(l)}
            activated={isAnimating} activationKey={activationKey} baseColor={LINE} />
        ))}

        {/* ── Room corner edges (brighter) ──────────────────────────────────── */}
        <path d={`M0,0 L${BW.x1},${BW.y1}`}      stroke={EDGE} strokeWidth="0.30" fill="none" />
        <path d={`M100,0 L${BW.x2},${BW.y1}`}    stroke={EDGE} strokeWidth="0.30" fill="none" />
        <path d={`M100,100 L${BW.x2},${BW.y2}`}  stroke={EDGE} strokeWidth="0.30" fill="none" />
        <path d={`M0,100 L${BW.x1},${BW.y2}`}    stroke={EDGE} strokeWidth="0.30" fill="none" />

        {/* ── Back wall outline ─────────────────────────────────────────────── */}
        <rect
          x={BW.x1} y={BW.y1}
          width={BW.x2 - BW.x1} height={BW.y2 - BW.y1}
          stroke={EDGE} strokeWidth="0.35" fill="none"
        />

        {/* ── Back wall grid ────────────────────────────────────────────────── */}
        {bwLines.map((l, i) => (
          <BWLine key={`bw-${i}`} line={l} delay={(bwDistances[i] / bwMaxDist) * 0.5}
            activated={isAnimating} activationKey={activationKey} baseColor={LINE_BW} />
        ))}

        {/* ── Back wall ambient fill ────────────────────────────────────────── */}
        <rect
          x={BW.x1} y={BW.y1}
          width={BW.x2 - BW.x1} height={BW.y2 - BW.y1}
          fill="rgba(96,165,250,0.022)"
        />

        {/* ── Radial pulse on activation ────────────────────────────────────── */}
        {isAnimating && (
          <motion.circle
            key={`pulse-${activationKey}`}
            cx={VP.x} cy={VP.y}
            initial={{ r: 0, opacity: 0.9 }}
            animate={{ r: 55, opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            stroke="rgba(96,165,250,0.85)"
            strokeWidth="0.5"
            fill="none"
          />
        )}

        {/* ── Second pulse ring (slight delay) ─────────────────────────────── */}
        {isAnimating && (
          <motion.circle
            key={`pulse2-${activationKey}`}
            cx={VP.x} cy={VP.y}
            initial={{ r: 0, opacity: 0.5 }}
            animate={{ r: 55, opacity: 0 }}
            transition={{ duration: 0.85, delay: 0.18, ease: "easeOut" }}
            stroke="rgba(96,165,250,0.50)"
            strokeWidth="0.25"
            fill="none"
          />
        )}

        {/* ── Vanishing point dot ───────────────────────────────────────────── */}
        <circle cx={VP.x} cy={VP.y} r="0.6" fill="rgba(96,165,250,0.60)" />
      </svg>

      {/* ── Breathing glow at VP ──────────────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "30%", height: "30%",
          background: `radial-gradient(ellipse, rgba(96,165,250,${v.glow}) 0%, transparent 70%)`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
