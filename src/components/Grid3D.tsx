import { motion } from "framer-motion";

// ── Geometry constants (SVG viewBox 0 0 100 100 space) ────────────────────────
// Vanishing point = exact screen center → horizon at 50%
export const VP = { x: 50, y: 50 };

// Back wall rectangle (exported so WireframeRoom can share the same geometry)
export const BW = { x1: 28, y1: 22, x2: 72, y2: 78 };

// Screen corners
const S = { x1: 0, y1: 0, x2: 100, y2: 100 };

// Grid line count per surface
const N = 9;

// Brand accent
const LINE    = "rgba(96,165,250,0.15)";   // #60a5fa faint
const LINE_BW = "rgba(96,165,250,0.28)";   // back wall brighter
const EDGE    = "rgba(96,165,250,0.45)";   // corner edges

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Linear interpolation between two 2-D points */
function lerp2(ax: number, ay: number, bx: number, by: number, t: number) {
  return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
}

/** Generate floor depth-lines: from bottom screen edge to back-wall bottom edge */
function floorDepthLines() {
  const lines: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const bx = S.x1 + (S.x2 - S.x1) * t;
    const wx = BW.x1 + (BW.x2 - BW.x1) * t;
    lines.push(`M${bx},${S.y2} L${wx},${BW.y2}`);
  }
  return lines;
}

/** Generate floor horizontal lines */
function floorHorizLines() {
  const lines: string[] = [];
  for (let i = 1; i < N; i++) {
    const t = i / N;
    const L = lerp2(S.x1, S.y2, BW.x1, BW.y2, t);
    const R = lerp2(S.x2, S.y2, BW.x2, BW.y2, t);
    lines.push(`M${L.x},${L.y} L${R.x},${R.y}`);
  }
  return lines;
}

/** Generate ceiling depth-lines */
function ceilDepthLines() {
  const lines: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const bx = S.x1 + (S.x2 - S.x1) * t;
    const wx = BW.x1 + (BW.x2 - BW.x1) * t;
    lines.push(`M${bx},${S.y1} L${wx},${BW.y1}`);
  }
  return lines;
}

/** Generate ceiling horizontal lines */
function ceilHorizLines() {
  const lines: string[] = [];
  for (let i = 1; i < N; i++) {
    const t = i / N;
    const L = lerp2(S.x1, S.y1, BW.x1, BW.y1, t);
    const R = lerp2(S.x2, S.y1, BW.x2, BW.y1, t);
    lines.push(`M${L.x},${L.y} L${R.x},${R.y}`);
  }
  return lines;
}

/** Generate left-wall depth-lines */
function leftDepthLines() {
  const lines: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const sy = S.y1 + (S.y2 - S.y1) * t;
    const wy = BW.y1 + (BW.y2 - BW.y1) * t;
    lines.push(`M${S.x1},${sy} L${BW.x1},${wy}`);
  }
  return lines;
}

/** Generate left-wall horizontal lines */
function leftHorizLines() {
  const lines: string[] = [];
  for (let i = 1; i < N; i++) {
    const t = i / N;
    const T = lerp2(S.x1, S.y1, BW.x1, BW.y1, t);
    const B = lerp2(S.x1, S.y2, BW.x1, BW.y2, t);
    lines.push(`M${T.x},${T.y} L${B.x},${B.y}`);
  }
  return lines;
}

/** Generate right-wall depth-lines */
function rightDepthLines() {
  const lines: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const sy = S.y1 + (S.y2 - S.y1) * t;
    const wy = BW.y1 + (BW.y2 - BW.y1) * t;
    lines.push(`M${S.x2},${sy} L${BW.x2},${wy}`);
  }
  return lines;
}

/** Generate right-wall horizontal lines */
function rightHorizLines() {
  const lines: string[] = [];
  for (let i = 1; i < N; i++) {
    const t = i / N;
    const T = lerp2(S.x2, S.y1, BW.x2, BW.y1, t);
    const B = lerp2(S.x2, S.y2, BW.x2, BW.y2, t);
    lines.push(`M${T.x},${T.y} L${B.x},${B.y}`);
  }
  return lines;
}

/** Back wall grid */
const BW_COLS = 7;
const BW_ROWS = 7;

function backWallGrid() {
  const lines: string[] = [];
  for (let i = 0; i <= BW_COLS; i++) {
    const x = BW.x1 + (BW.x2 - BW.x1) * (i / BW_COLS);
    lines.push(`M${x},${BW.y1} L${x},${BW.y2}`);
  }
  for (let j = 0; j <= BW_ROWS; j++) {
    const y = BW.y1 + (BW.y2 - BW.y1) * (j / BW_ROWS);
    lines.push(`M${BW.x1},${y} L${BW.x2},${y}`);
  }
  return lines;
}

// Pre-compute all paths
const FLOOR_LINES   = [...floorDepthLines(), ...floorHorizLines()];
const CEIL_LINES    = [...ceilDepthLines(),  ...ceilHorizLines()];
const LEFT_LINES    = [...leftDepthLines(),  ...leftHorizLines()];
const RIGHT_LINES   = [...rightDepthLines(), ...rightHorizLines()];
const BW_GRID_LINES = backWallGrid();

// ── Room SVG background ───────────────────────────────────────────────────────

interface Grid3DProps {
  opacity?: number;
  position?: "fixed" | "absolute";
  backWallReveal?: number;
}

export default function Grid3D({
  opacity = 1,
  position = "fixed",
  backWallReveal = 1,
}: Grid3DProps) {
  const bwCx = (BW.x1 + BW.x2) / 2;
  const bwCy = (BW.y1 + BW.y2) / 2;
  const maxR = Math.sqrt((BW.x2 - bwCx) ** 2 + (BW.y2 - bwCy) ** 2) * 1.05;
  const revealR = backWallReveal * maxR;

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
        <defs>
          <clipPath id="bw-reveal-clip">
            <circle cx={bwCx} cy={bwCy} r={revealR} />
          </clipPath>
        </defs>

        {/* Floor */}
        {FLOOR_LINES.map((d, i) => (
          <path key={`fl-${i}`} d={d} stroke={LINE} strokeWidth="0.18" fill="none" />
        ))}

        {/* Ceiling */}
        {CEIL_LINES.map((d, i) => (
          <path key={`cl-${i}`} d={d} stroke={LINE} strokeWidth="0.18" fill="none" />
        ))}

        {/* Left wall */}
        {LEFT_LINES.map((d, i) => (
          <path key={`lw-${i}`} d={d} stroke={LINE} strokeWidth="0.18" fill="none" />
        ))}

        {/* Right wall */}
        {RIGHT_LINES.map((d, i) => (
          <path key={`rw-${i}`} d={d} stroke={LINE} strokeWidth="0.18" fill="none" />
        ))}

        {/* Room corner edge lines */}
        <path d={`M0,0 L${BW.x1},${BW.y1}`}    stroke={EDGE} strokeWidth="0.30" fill="none" />
        <path d={`M100,0 L${BW.x2},${BW.y1}`}   stroke={EDGE} strokeWidth="0.30" fill="none" />
        <path d={`M100,100 L${BW.x2},${BW.y2}`} stroke={EDGE} strokeWidth="0.30" fill="none" />
        <path d={`M0,100 L${BW.x1},${BW.y2}`}   stroke={EDGE} strokeWidth="0.30" fill="none" />

        {/* Back wall outline */}
        <rect
          x={BW.x1} y={BW.y1}
          width={BW.x2 - BW.x1} height={BW.y2 - BW.y1}
          stroke={EDGE} strokeWidth="0.35" fill="none"
        />

        {/* Back wall grid (always revealed) */}
        <g clipPath="url(#bw-reveal-clip)">
          {BW_GRID_LINES.map((d, i) => (
            <path key={`bwg-${i}`} d={d} stroke={LINE_BW} strokeWidth="0.20" fill="none" />
          ))}
        </g>

        {/* Back wall ambient fill */}
        <rect
          x={BW.x1} y={BW.y1}
          width={BW.x2 - BW.x1} height={BW.y2 - BW.y1}
          fill="rgba(96,165,250,0.025)"
        />

        {/* Vanishing point dot */}
        <circle cx={VP.x} cy={VP.y} r="0.6" fill="rgba(96,165,250,0.55)" />
      </svg>

      {/* Breathing glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "30%", height: "30%",
          background: "radial-gradient(ellipse, rgba(96,165,250,0.08) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
