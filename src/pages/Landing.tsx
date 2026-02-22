import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Grid3D from "@/components/Grid3D";
import WireframeRoom from "@/components/WireframeRoom";

// ── Brand color ───────────────────────────────────────────────────────────────
const NODE_COLOR = "#60a5fa";

// ── Transition state machine ──────────────────────────────────────────────────
type TransitionState = "landing" | "orb-expanding" | "portal" | "dashboard" | "returning";

export default function Landing() {
  // Detect if we're navigating directly to /home (refresh or direct URL)
  const startsOnDashboard = window.location.pathname.startsWith("/home");

  const [orbHovered, setOrbHovered] = useState(false);
  const [stage, setStage] = useState(startsOnDashboard ? 3 : 0);
  const [transitionState, setTransitionState] = useState<TransitionState>(
    startsOnDashboard ? "dashboard" : "landing"
  );

  // Back wall reveal: starts at 1 (grid always visible on landing), portal transition keeps it 1
  const revealMotion = useMotionValue(1);
  const [backWallReveal, setBackWallReveal] = useState(1);

  // Keep backWallReveal state in sync with motion value
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  // Cinematic entry
  useEffect(() => {
    if (startsOnDashboard) return;
    const t = [
      setTimeout(() => setStage(1), 100),   // grid materialises
      setTimeout(() => setStage(2), 800),   // node appears
      setTimeout(() => setStage(3), 1400),  // hint appears
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  // Sync motion value to state for Grid3D
  useEffect(() => {
    const unsub = revealMotion.on("change", (v) => setBackWallReveal(v));
    return unsub;
  }, [revealMotion]);

  const handleOrbClick = () => {
    if (transitionState !== "landing") return;
    setTransitionState("orb-expanding");

    // Animate back wall reveal: 0 → 1 over 700ms
    if (animRef.current) animRef.current.stop();
    animRef.current = animate(revealMotion, 1, {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    });

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

    // Keep back wall grid visible on return
    if (animRef.current) animRef.current.stop();
    revealMotion.set(1);

    setTimeout(() => setTransitionState("landing"), 950);
  };

  const isLandingVisible   = transitionState === "landing" || transitionState === "orb-expanding";
  const isDashboardVisible = transitionState === "portal" || transitionState === "dashboard" || transitionState === "returning";

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: "#1C1C1E" }}
    >
      {/* ── Shared perspective room background — always visible ───────────────── */}
      <Grid3D position="absolute" backWallReveal={backWallReveal} />

      {/* ── Landing content (node + hint) ─────────────────────────────────────── */}
      <AnimatePresence>
        {isLandingVisible && (
          <motion.div
            key="landing-view"
            className="absolute inset-0"
            exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
          >
            {/* ── Central Network Node (at vanishing point = center) ─────────── */}
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

                  {/* Animated ripple rings */}
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

                  {/* Diagonal lines */}
                  <line x1="50" y1="50" x2="78" y2="22" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />
                  <line x1="50" y1="50" x2="22" y2="78" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />
                  <line x1="50" y1="50" x2="78" y2="78" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />
                  <line x1="50" y1="50" x2="22" y2="22" stroke={NODE_COLOR} strokeWidth="1.5" opacity="0.5" filter="url(#node-glow)" />

                  {/* Cardinal lines */}
                  <line x1="50" y1="39" x2="50" y2="13" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />
                  <line x1="61" y1="50" x2="87" y2="50" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />
                  <line x1="50" y1="61" x2="50" y2="87" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />
                  <line x1="39" y1="50" x2="13" y2="50" stroke={NODE_COLOR} strokeWidth="2.5" opacity="0.85" filter="url(#node-glow)" />

                  {/* Cardinal outer nodes */}
                  <circle cx="50" cy="10" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                  <circle cx="90" cy="50" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                  <circle cx="50" cy="90" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                  <circle cx="10" cy="50" r="5.5" fill={NODE_COLOR} filter="url(#node-glow)" />

                  {/* Diagonal outer nodes */}
                  <circle cx="80" cy="20" r="3.5" fill={NODE_COLOR} opacity="0.65" />
                  <circle cx="20" cy="80" r="3.5" fill={NODE_COLOR} opacity="0.65" />
                  <circle cx="80" cy="80" r="3.5" fill={NODE_COLOR} opacity="0.65" />
                  <circle cx="20" cy="20" r="3.5" fill={NODE_COLOR} opacity="0.65" />

                  {/* Central ring */}
                  <circle cx="50" cy="50" r="11" stroke={NODE_COLOR} strokeWidth="2.5" filter="url(#node-glow)" />

                  {/* Central fill dot */}
                  <circle cx="50" cy="50" r="4.5" fill={NODE_COLOR} filter="url(#node-glow)" />
                </svg>
              </motion.button>

              {/* Hover rays */}
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
