import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, Zap } from "lucide-react";
import InteractiveNode from "./InteractiveNode";

const nodes = [
  { type: "funder" as const, x: 20, y: 35, label: "AgriVenture Capital", delay: 0.8 },
  { type: "developer" as const, x: 45, y: 25, label: "NeuralHarvest Labs", delay: 1.0 },
  { type: "business" as const, x: 70, y: 40, label: "Prairie Analytics Co", delay: 1.2 },
  { type: "developer" as const, x: 30, y: 55, label: "Midwest AI Studio", delay: 1.4 },
  { type: "funder" as const, x: 55, y: 60, label: "Heartland Ventures", delay: 1.6 },
  { type: "business" as const, x: 80, y: 55, label: "Lincoln TechHub", delay: 1.8 },
  { type: "business" as const, x: 15, y: 65, label: "CropIntel Systems", delay: 2.0 },
  { type: "developer" as const, x: 65, y: 70, label: "DataPrairie", delay: 2.2 },
];

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">

      {/* Interactive Nodes */}
      <div className="absolute inset-0 top-32">
        {nodes.map((node, index) => (
          <InteractiveNode key={index} {...node} />
        ))}
        
        {/* Connection lines between nodes */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(185 100% 50% / 0.1)" />
              <stop offset="50%" stopColor="hsl(185 100% 50% / 0.3)" />
              <stop offset="100%" stopColor="hsl(185 100% 50% / 0.1)" />
            </linearGradient>
          </defs>
          <motion.line
            x1="22%" y1="37%" x2="44%" y2="28%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          />
          <motion.line
            x1="47%" y1="28%" x2="68%" y2="42%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.7, duration: 1 }}
          />
          <motion.line
            x1="32%" y1="57%" x2="53%" y2="62%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.9, duration: 1 }}
          />
          <motion.line
            x1="57%" y1="62%" x2="78%" y2="57%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 2.1, duration: 1 }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">
              Lincoln, Nebraska • AI Integration Network
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-foreground">Where </span>
            <span className="text-[#D4AF37]">Golden Fields</span>
            <br />
            <span className="text-foreground">Meet </span>
            <span className="text-[#60a5fa]">Digital Futures</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Silicon Prairie connects funders, developers, and businesses to terraform 
            the heartland into America's next AI innovation hub.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="gradient-neon text-primary-foreground font-semibold px-8 py-6 text-lg hover:opacity-90 transition-opacity shadow-glow-cyan"
              onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join the Network
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-6 text-lg"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore the Mission
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Discover</span>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
