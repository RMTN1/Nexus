import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Grid3D from "@/components/Grid3D";
import WireframeRoom from "@/components/WireframeRoom";

// ── Brand color ───────────────────────────────────────────────────────────────
const NODE_COLOR = "#60a5fa"; // Primary Blue (Silicon) — matches favicon + CLAUDE.md

// ── Spawn nodes for transition animation ─────────────────────────────────────
// 12 nodes: [angleDeg, distanceFraction (fraction of half-viewport)]
const SPAWN_NODES: Array<{ angle: number; dist: number; r: number }> = [
  { angle:   0, dist: 0.50, r: 5 },
  { angle:  30, dist: 0.60, r: 4 },
  { angle:  60, dist: 0.44, r: 5 },
  { angle:  90, dist: 0.56, r: 6 },
  { angle: 120, dist: 0.64, r: 4 },
  { angle: 150, dist: 0.48, r: 5 },
  { angle: 180, dist: 0.52, r: 4 },
  { angle: 210, dist: 0.58, r: 5 },
  { angle: 240, dist: 0.42, r: 4 },
  { angle: 270, dist: 0.54, r: 6 },
  { angle: 300, dist: 0.62, r: 4 },
  { angle: 330, dist: 0.46, r: 5 },
];

// ── Transition state machine ──────────────────────────────────────────────────
type TransitionState = "landing" | "orb-expanding" | "portal" | "dashboard" | "returning";

export default function Landing() {
  const [orbHovered, setOrbHovered] = useState(false);
  const [stage, setStage] = useState(0);
  const [transitionState, setTransitionState] = useState<TransitionState>("landing");

  // Cinematic entry
  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 100),   // grid materialises
      setTimeout(() => setStage(2), 800),   // node appears
      setTimeout(() => setStage(3), 1400),  // branding appears
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const handleOrbClick = () => {
    if (transitionState !== "landing") return;
    setTransitionState("orb-expanding");
    setTimeout(() => setTransitionState("portal"), 650);
    setTimeout(() => {
      setTransitionState("dashboard");
      window.history.replaceState(null, "", "/home");
    }, 950);
  };

  const handleBack = () => {
    if (transitionState !== "dashboard") return;
    setTransitionState("returning");
    window.history.replaceState(null, "", "/");
    setTimeout(() => setTransitionState("landing"), 950);
  };

  const isLandingVisible  = transitionState === "landing" || transitionState === "orb-expanding";
  const isDashboardVisible = transitionState === "portal" || transitionState === "dashboard" || transitionState === "returning";
  const isNodeSpawning    = transitionState === "orb-expanding";

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: "#1C1C1E" }}
    >

      {/* ── Landing content (grid + node + branding) ──────────────────────────── */}
      <AnimatePresence>
        {isLandingVisible && (
          <motion.div
            key="landing-view"
            className="absolute inset-0"
            exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
          >
            {/* ── 3D Grid — Tron landscape ─────────────────────────────────── */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 1 ? 1 : 0 }}
              transition={{ opacity: { duration: 1.2 } }}
            >
              <Grid3D position="absolute" />
            </motion.div>

            {/* ── Central Network Node ─────────────────────────────────────── */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: stage >= 2 ? 1 : 0, scale: stage >= 2 ? 1 : 0.6 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.button
                onClick={handleOrbClick}
                onHoverStart={() => setOrbHovered(true)}
                onHoverEnd={() => setOrbHovered(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                disabled={transitionState !== "landing"}
                className="relative w-28 h-28 md:w-36 md:h-36 cursor-pointer focus:outline-none"
                style={{
                  background: "none",
                  border: "none",
                  filter: orbHovered
                    ? `drop-shadow(0 0 18px ${NODE_COLOR}) drop-shadow(0 0 40px ${NODE_COLOR}66)`
                    : `drop-shadow(0 0 8px ${NODE_COLOR}88)`,
                  transition: "filter 0.4s ease",
                }}
                aria-label="Enter Nexus"
              >
                <svg
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="w-full h-full"
                >
                  <defs>
                    <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* ── Animated ripple rings from central ring ── */}
                  <motion.circle
                    cx="50" cy="50"
                    stroke={NODE_COLOR}
                    strokeWidth="1.5"
                    fill="none"
                    animate={{ r: [11, 32], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx="50" cy="50"
                    stroke={NODE_COLOR}
                    strokeWidth="1"
                    fill="none"
                    animate={{ r: [11, 44], opacity: [0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                  />

                  {/* ── Diagonal connection lines ── */}
                  <line x1="50" y1="50" x2="78" y2="22" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />
                  <line x1="50" y1="50" x2="22" y2="78" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />
                  <line x1="50" y1="50" x2="78" y2="78" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />
                  <line x1="50" y1="50" x2="22" y2="22" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />

                  {/* ── Cardinal connection lines ── */}
                  <line x1="50" y1="39" x2="50" y2="13" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />
                  <line x1="61" y1="50" x2="87" y2="50" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />
                  <line x1="50" y1="61" x2="50" y2="87" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />
                  <line x1="39" y1="50" x2="13" y2="50" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />

                  {/* ── Outer cardinal nodes ── */}
                  <circle cx="50" cy="10" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                  <circle cx="90" cy="50" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                  <circle cx="50" cy="90" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                  <circle cx="10" cy="50" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />

                  {/* ── Outer diagonal nodes (smaller) ── */}
                  <circle cx="80" cy="20" r="3.5" fill={NODE_COLOR} opacity="0.65" />
                  <circle cx="20" cy="80" r="3.5" fill={NODE_COLOR} opacity="0.65" />
                  <circle cx="80" cy="80" r="3.5" fill={NODE_COLOR} opacity="0.65" />
                  <circle cx="20" cy="20" r="3.5" fill={NODE_COLOR} opacity="0.65" />

                  {/* ── Central ring ── */}
                  <circle cx="50" cy="50" r="11" stroke={NODE_COLOR} strokeWidth="2.5" filter="url(#node-glow)" />

                  {/* ── Central fill dot ── */}
                  <circle cx="50" cy="50" r="4.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                </svg>
              </motion.button>

              {/* ── Hover rays ── */}
              <AnimatePresence>
                {orbHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    {Array.from({ length: 14 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute origin-center"
                        style={{
                          width: "2px",
                          height: "180px",
                          background: `linear-gradient(to top, transparent, ${NODE_COLOR}55, transparent)`,
                          transform: `rotate(${i * (360 / 14)}deg)`,
                        }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 0.7 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.02 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Top-center branding ──────────────────────────────────────── */}
            <motion.div
              className="absolute top-6 inset-x-0 flex justify-center items-center gap-3 text-lg tracking-wider pointer-events-none"
              style={{ color: `${NODE_COLOR}cc` }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : -10 }}
              transition={{ duration: 0.8 }}
            >
              <img src="/favicon.svg?v=2" alt="Nexus Logo" className="w-7 h-7" />
              <span className="font-light uppercase tracking-[0.2em]">Nexus</span>
            </motion.div>

            {/* ── Click hint ───────────────────────────────────────────────── */}
            <motion.p
              className="absolute bottom-10 inset-x-0 text-center text-xs font-mono tracking-widest uppercase pointer-events-none"
              style={{ color: `${NODE_COLOR}44` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              tap to enter
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Node-spawn overlay — network expands outward on transition ─────────── */}
      <AnimatePresence>
        {isNodeSpawning && (
          <motion.div
            key="node-spawn-overlay"
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 50 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.3 } }}
          >
            <svg
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              {SPAWN_NODES.map((node, i) => {
                const rad = (node.angle - 90) * (Math.PI / 180);
                // Distance in vw units (using 50vw as half-width reference)
                const tx = `calc(50vw + ${Math.cos(rad) * node.dist * 50}vw)`;
                const ty = `calc(50vh + ${Math.sin(rad) * node.dist * 50}vh)`;
                return (
                  <g key={i}>
                    {/* Line from center to node */}
                    <motion.line
                      x1="50%"
                      y1="50%"
                      x2="50%"
                      y2="50%"
                      stroke={NODE_COLOR}
                      strokeWidth="1"
                      strokeOpacity="0.35"
                      initial={{ x2: "50%", y2: "50%", opacity: 0 }}
                      animate={{
                        x2: tx,
                        y2: ty,
                        opacity: 0.35,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: i * 0.04,
                        ease: "easeOut",
                      }}
                    />
                    {/* Outer node circle */}
                    <motion.circle
                      r={node.r}
                      fill={NODE_COLOR}
                      style={{ filter: `drop-shadow(0 0 6px ${NODE_COLOR})` }}
                      initial={{ cx: "50%", cy: "50%", scale: 0, opacity: 0 }}
                      animate={{
                        cx: tx,
                        cy: ty,
                        scale: 1,
                        opacity: 0.75,
                      }}
                      transition={{
                        duration: 0.55,
                        delay: i * 0.04,
                        ease: "easeOut",
                      }}
                    />
                  </g>
                );
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dashboard ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDashboardVisible && (
          <motion.div
            key="dashboard-view"
            className="absolute inset-0"
            style={{ zIndex: 10 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.1, ease: "easeIn" } }}
            exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
          >
            <WireframeRoom onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
