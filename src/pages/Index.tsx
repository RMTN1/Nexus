import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";
import Grid3D from "@/components/Grid3D";

// ── Time-of-day theme (shared with Landing) ───────────────────────────────────
type Theme = { orb: string; grid: string };

function getTimeTheme(): Theme {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return { orb: "#FB923C", grid: "#F59E0B" }; // dawn
  if (h >= 10 && h < 17) return { orb: "#D4AF37", grid: "#60a5fa" }; // day
  if (h >= 17 && h < 20) return { orb: "#C084FC", grid: "#F97316" }; // dusk
  return { orb: "#22D3EE", grid: "#6366F1" };                         // night
}

const Index = () => {
  const theme = useMemo(getTimeTheme, []);
  const [orbHovered, setOrbHovered] = useState(false);
  const [nexusOpen, setNexusOpen] = useState(false);

  const orbColor = orbHovered ? theme.orb : theme.grid;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(to bottom, #a8c4d4, #c8dce8)" }}>
      {/* ── 3D Grid background ─────────────────────────────────────────────── */}
      <Grid3D opacity={0.6} />

      {/* ── Header: back button (left) + title (center) ────────────────────── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Back button — top left */}
        <a
          href="/"
          className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm hidden sm:inline">Back</span>
        </a>

        {/* Silicon Prairie — top center */}
        <div className="flex items-center justify-center gap-3 text-slate-600 text-lg tracking-wider">
          <img src="/favicon.svg" alt="Logo" className="w-7 h-7" />
          <span className="font-light uppercase">Silicon Prairie</span>
        </div>
      </motion.header>

      {/* ── Central Orb (Nexus trigger) ────────────────────────────────────── */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
        <motion.button
          onClick={() => setNexusOpen(true)}
          onHoverStart={() => setOrbHovered(true)}
          onHoverEnd={() => setOrbHovered(false)}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full cursor-pointer focus:outline-none pointer-events-auto"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${orbHovered ? theme.orb : theme.grid}, ${orbHovered ? "#7a3a10" : "#1a3070"})`,
            boxShadow: `
              0 0 40px ${orbColor}66,
              0 0 80px ${orbColor}33,
              inset 0 0 30px rgba(255,255,255,0.12)
            `,
            transition: "background 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          {/* Specular highlight */}
          <div
            className="absolute inset-3 rounded-full"
            style={{ background: "radial-gradient(circle at 38% 35%, rgba(255,255,255,0.4), transparent 55%)" }}
          />
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 md:w-10 md:h-10 text-white/60" />

          {/* Pulse rings */}
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: orbColor }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: orbColor }}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </motion.button>

        {/* Orb label */}
        <motion.p
          className="absolute mt-44 md:mt-52 text-slate-500 text-xs tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: orbHovered ? 1 : 0.6 }}
        >
          {orbHovered ? "Open Nexus" : "Nexus"}
        </motion.p>
      </div>

      {/* ── Page content (scrollable, behind orb) ──────────────────────────── */}
      <div className="relative z-10 pt-20">
        <HeroSection />
        <AboutSection />
        <JoinSection />
        <Footer />
      </div>

      {/* ── Nexus Overlay (placeholder for now) ────────────────────────────── */}
      <AnimatePresence>
        {nexusOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setNexusOpen(false)}
            />

            {/* Nexus Panel */}
            <motion.div
              className="relative w-full max-w-md h-full bg-[#0a0a0f]/90 backdrop-blur-xl border-l border-white/10 p-8 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${theme.orb}, ${theme.grid})`,
                      boxShadow: `0 0 20px ${theme.orb}44`,
                    }}
                  />
                  <h2 className="text-xl font-light text-white/90 uppercase tracking-wider">Nexus</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNexusOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  Close
                </Button>
              </div>

              {/* Placeholder content */}
              <div className="space-y-6 text-white/70">
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <h3 className="text-sm uppercase tracking-wider text-white/50 mb-2">Profile</h3>
                  <p className="text-white/80">Your personal dashboard</p>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <h3 className="text-sm uppercase tracking-wider text-white/50 mb-2">Connections</h3>
                  <p className="text-white/80">Citizens, Developers, Investors</p>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <h3 className="text-sm uppercase tracking-wider text-white/50 mb-2">Applications</h3>
                  <p className="text-white/80">Your active applications</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
