import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import Grid3D from "@/components/Grid3D";

// ── Time-of-day theme ─────────────────────────────────────────────────────────
type Theme = { orb: string; grid: string };

function getTimeTheme(): Theme {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return { orb: "#FB923C", grid: "#F59E0B" }; // dawn
  if (h >= 10 && h < 17) return { orb: "#D4AF37", grid: "#60a5fa" }; // day
  if (h >= 17 && h < 20) return { orb: "#C084FC", grid: "#F97316" }; // dusk
  return { orb: "#22D3EE", grid: "#6366F1" };                         // night
}

export default function Landing() {
  const theme = useMemo(getTimeTheme, []);

  const [orbHovered, setOrbHovered] = useState(false);
  const [stage, setStage] = useState(0);
  const [exiting, setExiting] = useState(false);

  // Cinematic entry
  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 100),   // grid materialises
      setTimeout(() => setStage(2), 800),   // orb appears
      setTimeout(() => setStage(3), 1400),  // branding appears
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const handleOrbClick = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => { window.location.href = "/home"; }, 950);
  };

  const orbColor = orbHovered ? theme.orb : theme.grid;

  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ background: "linear-gradient(to bottom, #a8c4d4, #c8dce8)" }}>

      {/* ── 3D Grid — Tron landscape ─────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{
          opacity: stage >= 1 ? 1 : 0,
          scale: exiting ? 5 : 1,
        }}
        transition={{
          opacity: { duration: 1.2 },
          scale: { duration: 0.95, ease: "easeIn" },
        }}
      >
        <Grid3D position="absolute" />
      </motion.div>


      {/* ── Central Orb ──────────────────────────────────────────────────────── */}
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
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          disabled={exiting}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full cursor-pointer focus:outline-none"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${orbHovered ? theme.orb : theme.grid}, ${orbHovered ? "#7a3a10" : "#1a3070"})`,
            boxShadow: `
              0 0 40px ${orbColor}88,
              0 0 80px ${orbColor}44,
              inset 0 0 30px rgba(255,255,255,0.15)
            `,
            transition: "background 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          <div
            className="absolute inset-3 rounded-full"
            style={{ background: "radial-gradient(circle at 38% 35%, rgba(255,255,255,0.45), transparent 55%)" }}
          />
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 md:w-10 md:h-10 text-white/70" />

          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: orbColor }}
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: orbColor }}
            animate={{ scale: [1, 2], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
        </motion.button>

        {/* Rays on hover */}
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
                    background: `linear-gradient(to top, transparent, ${theme.orb}55, transparent)`,
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

      {/* ── Top-center branding (truly centered) ─────────────────────────────── */}
      <motion.div
        className="absolute top-6 inset-x-0 flex justify-center items-center gap-3 text-slate-600 text-lg tracking-wider pointer-events-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : -10 }}
        transition={{ duration: 0.8 }}
      >
        <img src="/favicon.svg" alt="Logo" className="w-7 h-7" />
        <span className="font-light uppercase">Silicon Prairie</span>
      </motion.div>

      {/* ── Flash overlay on exit ────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "white", zIndex: 50 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 1 : 0 }}
        transition={{ duration: 0.95, ease: "easeIn", delay: 0.2 }}
      />
    </div>
  );
}
