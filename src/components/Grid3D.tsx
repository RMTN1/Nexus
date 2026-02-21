import { motion } from "framer-motion";

interface Grid3DProps {
  /** 0–1 multiplier for overall opacity. Default 1. */
  opacity?: number;
  /** CSS position value for the root element. Default "fixed". */
  position?: "fixed" | "absolute";
}

/**
 * 3D floor grid — white lines on muted cyan background.
 * Grid extends close to viewer with optimized perspective.
 */
export default function Grid3D({
  opacity = 1,
  position = "fixed",
}: Grid3DProps) {
  const lineColor = "rgba(255, 255, 255, 0.75)";
  const lineColorBright = "rgba(255, 255, 255, 0.95)";

  return (
    <div
      className="pointer-events-none"
      style={{ position, top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity }}
    >
      {/* ── Floor Grid (bottom 60% of screen, extends toward viewer) ────────── */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 0,
          right: 0,
          bottom: 0,
          perspective: "600px",
          perspectiveOrigin: "50% -10%",
        }}
      >
        {/* Base floor grid — white lines, smaller cells for less distortion */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateX(78deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `
              linear-gradient(${lineColor} 1px, transparent 1px),
              linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
            `,
            backgroundSize: "38px 38px",
          }}
        />

        {/* Floor glow pulse — subtle breathing effect */}
        <motion.div
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateX(78deg)",
            transformOrigin: "50% 0%",
            backgroundImage: `
              linear-gradient(${lineColorBright} 1px, transparent 1px),
              linear-gradient(90deg, ${lineColorBright} 1px, transparent 1px)
            `,
            backgroundSize: "38px 38px",
            filter: "blur(0.5px)",
            maskImage: "radial-gradient(ellipse 65% 45% at 50% 15%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 45% at 50% 15%, black, transparent)",
          }}
        />
      </div>

      {/* ── Horizon line ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 0,
          right: 0,
          height: "1.5px",
          background: "rgba(255, 255, 255, 0.6)",
          boxShadow: "0 0 15px 2px rgba(255, 255, 255, 0.25)",
        }}
      />

      {/* ── Center ambient glow ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "80%",
          background: "radial-gradient(ellipse 100% 80% at 50% 30%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
