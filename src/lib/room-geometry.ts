// ── Room geometry — pure utility, no React ────────────────────────────────────
// All coordinates are in SVG viewBox 0-0-100-100 space.
// The SVG uses preserveAspectRatio="none", so viewBox units map linearly to
// pixels: 1 unit = vw/100 px horizontally, vh/100 px vertically.

export const VP = { x: 50, y: 50 }; // vanishing point at screen center

// Desired tile edge length in pixels. Back wall boundaries float to
// accommodate an exact integer number of perfectly-square tiles.
const TARGET_TILE_PX = 52;

export interface RoomGeometry {
  BW: { x1: number; y1: number; x2: number; y2: number };
  VP: typeof VP;
  /** Number of tile columns — always even so a line crosses BW center X */
  cols: number;
  /** Number of tile rows — always even so a line crosses BW center Y */
  rows: number;
  /** Exact pixel size of each tile (same for W and H) */
  tilePx: number;
}

function snapToEven(n: number, min = 2): number {
  const snapped = Math.round(n);
  const even = snapped % 2 === 0 ? snapped : snapped + 1;
  return Math.max(min, even);
}

export function computeGeometry(vw: number, vh: number): RoomGeometry {
  // Seed: back wall occupies ~44% of viewport width, ~56% of height
  const SEED_W = 0.44;
  const SEED_H = 0.56;
  const bwApproxPxW = SEED_W * vw;
  const bwApproxPxH = SEED_H * vh;

  // Step 1: fix columns from width seed
  const cols = snapToEven(bwApproxPxW / TARGET_TILE_PX);

  // Step 2: derive exact tile size from cols
  // (tiles will be exactly this wide)
  const tilePx = bwApproxPxW / cols;

  // Step 3: snap rows using the same tile size
  // (BW height adjusts slightly → tiles are perfectly square)
  const rows = snapToEven(bwApproxPxH / tilePx);

  // Step 4: actual BW pixel dimensions
  const bwPxW = cols * tilePx; // = bwApproxPxW exactly
  const bwPxH = rows * tilePx; // may differ from bwApproxPxH

  // Step 5: convert back to viewBox 0-100 units
  const bwVbW = (bwPxW / vw) * 100;
  const bwVbH = (bwPxH / vh) * 100;

  const BW = {
    x1: 50 - bwVbW / 2,
    y1: 50 - bwVbH / 2,
    x2: 50 + bwVbW / 2,
    y2: 50 + bwVbH / 2,
  };

  return { BW, VP, cols, rows, tilePx };
}

// ── Line-generation helpers ────────────────────────────────────────────────────

type Pt = { x: number; y: number };

function lerp2(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export interface GridLine {
  d: string;       // SVG path data
  midX: number;    // midpoint x in viewBox units (for glow delay calc)
  midY: number;
}

// ── Back wall ─────────────────────────────────────────────────────────────────

export function buildBackWallLines(
  BW: RoomGeometry["BW"],
  cols: number,
  rows: number
): GridLine[] {
  const lines: GridLine[] = [];
  const bwW = BW.x2 - BW.x1;
  const bwH = BW.y2 - BW.y1;

  // Vertical lines (cols+1)
  for (let i = 0; i <= cols; i++) {
    const x = BW.x1 + bwW * (i / cols);
    lines.push({ d: `M${x},${BW.y1} L${x},${BW.y2}`, midX: x, midY: 50 });
  }
  // Horizontal lines (rows+1)
  for (let j = 0; j <= rows; j++) {
    const y = BW.y1 + bwH * (j / rows);
    lines.push({ d: `M${BW.x1},${y} L${BW.x2},${y}`, midX: 50, midY: y });
  }
  return lines;
}

// ── Floor ─────────────────────────────────────────────────────────────────────

export function buildFloorLines(BW: RoomGeometry["BW"], cols: number, rows: number): GridLine[] {
  const lines: GridLine[] = [];
  const bwW = BW.x2 - BW.x1;
  const S = { TL: { x: 0, y: 100 }, TR: { x: 100, y: 100 } };
  const BW_BL = { x: BW.x1, y: BW.y2 };
  const BW_BR = { x: BW.x2, y: BW.y2 };

  // Depth lines — cols+1, each at BW column x
  for (let i = 0; i <= cols; i++) {
    const bwX = BW.x1 + bwW * (i / cols);
    const sX = lerp2(S.TL, S.TR, i / cols).x;
    lines.push({ d: `M${sX},100 L${bwX},${BW.y2}`, midX: (sX + bwX) / 2, midY: (100 + BW.y2) / 2 });
  }
  // Cross lines — rows-1 interior
  for (let j = 1; j < rows; j++) {
    const t = j / rows;
    const L = lerp2(S.TL, BW_BL, t);
    const R = lerp2(S.TR, BW_BR, t);
    lines.push({ d: `M${L.x},${L.y} L${R.x},${R.y}`, midX: (L.x + R.x) / 2, midY: (L.y + R.y) / 2 });
  }
  return lines;
}

// ── Ceiling ───────────────────────────────────────────────────────────────────

export function buildCeilingLines(BW: RoomGeometry["BW"], cols: number, rows: number): GridLine[] {
  const lines: GridLine[] = [];
  const bwW = BW.x2 - BW.x1;
  const S = { TL: { x: 0, y: 0 }, TR: { x: 100, y: 0 } };
  const BW_TL = { x: BW.x1, y: BW.y1 };
  const BW_TR = { x: BW.x2, y: BW.y1 };

  for (let i = 0; i <= cols; i++) {
    const bwX = BW.x1 + bwW * (i / cols);
    const sX = lerp2(S.TL, S.TR, i / cols).x;
    lines.push({ d: `M${sX},0 L${bwX},${BW.y1}`, midX: (sX + bwX) / 2, midY: BW.y1 / 2 });
  }
  for (let j = 1; j < rows; j++) {
    const t = j / rows;
    const L = lerp2(S.TL, BW_TL, t);
    const R = lerp2(S.TR, BW_TR, t);
    lines.push({ d: `M${L.x},${L.y} L${R.x},${R.y}`, midX: (L.x + R.x) / 2, midY: (L.y + R.y) / 2 });
  }
  return lines;
}

// ── Left wall ─────────────────────────────────────────────────────────────────

export function buildLeftLines(BW: RoomGeometry["BW"], cols: number, rows: number): GridLine[] {
  const lines: GridLine[] = [];
  const bwH = BW.y2 - BW.y1;
  const S = { TL: { x: 0, y: 0 }, BL: { x: 0, y: 100 } };
  const BW_TL = { x: BW.x1, y: BW.y1 };
  const BW_BL = { x: BW.x1, y: BW.y2 };

  // Depth lines — rows+1, each at BW row y
  for (let j = 0; j <= rows; j++) {
    const bwY = BW.y1 + bwH * (j / rows);
    const sY = lerp2(S.TL, S.BL, j / rows).y;
    lines.push({ d: `M0,${sY} L${BW.x1},${bwY}`, midX: BW.x1 / 2, midY: (sY + bwY) / 2 });
  }
  // Cross lines — cols-1 interior
  for (let i = 1; i < cols; i++) {
    const t = i / cols;
    const T = lerp2(S.TL, BW_TL, t);
    const B = lerp2(S.BL, BW_BL, t);
    lines.push({ d: `M${T.x},${T.y} L${B.x},${B.y}`, midX: (T.x + B.x) / 2, midY: (T.y + B.y) / 2 });
  }
  return lines;
}

// ── Wall-at-point classifier ──────────────────────────────────────────────────

/** Standard even-odd point-in-polygon (coordinates in same space as poly) */
function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export type WallId = "back" | "left" | "right" | "ceiling" | "floor";

/**
 * Given a point (px, py) in viewBox 0-100 space, return which wall it belongs to.
 * The 5 trapezoid regions tile the screen perfectly.
 */
export function wallAtPoint(px: number, py: number, BW: RoomGeometry["BW"]): WallId {
  if (px >= BW.x1 && px <= BW.x2 && py >= BW.y1 && py <= BW.y2) return "back";
  if (pointInPolygon(px, py, [[0,0],[100,0],[BW.x2,BW.y1],[BW.x1,BW.y1]])) return "ceiling";
  if (pointInPolygon(px, py, [[BW.x1,BW.y2],[BW.x2,BW.y2],[100,100],[0,100]])) return "floor";
  if (pointInPolygon(px, py, [[0,0],[BW.x1,BW.y1],[BW.x1,BW.y2],[0,100]])) return "left";
  return "right";
}

/** Default screen-pixel position for a window attached to a given wall. */
export function defaultWindowPos(
  wall: WallId,
  BW: RoomGeometry["BW"],
  vw: number,
  vh: number,
  stackIndex = 0,
): { x: number; y: number } {
  const m = 24;
  const stagger = stackIndex * 28;
  const bwPxX1 = (BW.x1 / 100) * vw;
  const bwPxY1 = (BW.y1 / 100) * vh;
  const bwPxX2 = (BW.x2 / 100) * vw;
  const bwPxY2 = (BW.y2 / 100) * vh;
  switch (wall) {
    case "back":    return { x: bwPxX1 + m + stagger, y: bwPxY1 + m + stagger };
    case "ceiling": return { x: bwPxX1 + m + stagger, y: m + stagger };
    case "floor":   return { x: bwPxX1 + m + stagger, y: bwPxY2 + m + stagger };
    case "left":    return { x: m + stagger,           y: bwPxY1 + stagger };
    case "right":   return { x: bwPxX2 + m + stagger, y: bwPxY1 + stagger };
  }
}

// ── Right wall ────────────────────────────────────────────────────────────────

export function buildRightLines(BW: RoomGeometry["BW"], cols: number, rows: number): GridLine[] {
  const lines: GridLine[] = [];
  const bwH = BW.y2 - BW.y1;
  const S = { TR: { x: 100, y: 0 }, BR: { x: 100, y: 100 } };
  const BW_TR = { x: BW.x2, y: BW.y1 };
  const BW_BR = { x: BW.x2, y: BW.y2 };

  for (let j = 0; j <= rows; j++) {
    const bwY = BW.y1 + bwH * (j / rows);
    const sY = lerp2(S.TR, S.BR, j / rows).y;
    lines.push({ d: `M100,${sY} L${BW.x2},${bwY}`, midX: (100 + BW.x2) / 2, midY: (sY + bwY) / 2 });
  }
  for (let i = 1; i < cols; i++) {
    const t = i / cols;
    const T = lerp2(S.TR, BW_TR, t);
    const B = lerp2(S.BR, BW_BR, t);
    lines.push({ d: `M${T.x},${T.y} L${B.x},${B.y}`, midX: (T.x + B.x) / 2, midY: (T.y + B.y) / 2 });
  }
  return lines;
}
