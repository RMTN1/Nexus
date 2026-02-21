import { motion } from "framer-motion";
import { useState } from "react";
import { DollarSign, Code, Building2 } from "lucide-react";

interface InteractiveNodeProps {
  type: "funder" | "developer" | "business";
  x: number;
  y: number;
  label: string;
  delay?: number;
}

const nodeConfig = {
  funder: {
    icon: DollarSign,
    color: "from-secondary to-wheat-amber",
    glow: "shadow-glow-gold",
    ring: "border-secondary",
    label: "Funder",
  },
  developer: {
    icon: Code,
    color: "from-primary to-neon-blue",
    glow: "shadow-glow-cyan",
    ring: "border-primary",
    label: "Developer",
  },
  business: {
    icon: Building2,
    color: "from-accent to-neon-purple",
    glow: "shadow-glow-purple",
    ring: "border-accent",
    label: "Business",
  },
};

const InteractiveNode = ({ type, x, y, label, delay = 0 }: InteractiveNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = nodeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ripple effect on hover */}
      {isHovered && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-30`}
            initial={{ scale: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-20`}
            initial={{ scale: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Outer glow ring */}
      <motion.div
        className={`absolute -inset-3 rounded-full border-2 ${config.ring} opacity-30`}
        animate={{
          scale: isHovered ? 1.3 : 1,
          opacity: isHovered ? 0.6 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main node */}
      <motion.div
        className={`relative h-14 w-14 rounded-full bg-gradient-to-br ${config.color} ${config.glow} flex items-center justify-center`}
        animate={{
          scale: isHovered ? 1.2 : 1,
          boxShadow: isHovered 
            ? `0 0 60px hsl(var(--${type === 'funder' ? 'wheat-gold' : type === 'developer' ? 'neon-cyan' : 'neon-purple'}) / 0.6)`
            : undefined,
        }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="h-6 w-6 text-primary-foreground" />
        
        {/* Pulse animation */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color}`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Label on hover */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -bottom-12 whitespace-nowrap"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="glass-card px-3 py-1.5 rounded-full">
          <span className="text-xs font-medium text-foreground">{config.label}</span>
          <span className="text-xs text-muted-foreground ml-1">• {label}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveNode;
