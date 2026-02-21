import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu, Users, Rocket, Globe } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI-First Infrastructure",
    description: "Building the neural pathways of tomorrow's heartland economy with cutting-edge AI integration services.",
  },
  {
    icon: Users,
    title: "Connected Ecosystem",
    description: "A living network of funders, developers, and businesses working in symbiosis to accelerate innovation.",
  },
  {
    icon: Rocket,
    title: "Rapid Deployment",
    description: "From concept to production in weeks, not years. We bring Silicon Valley speed to prairie pragmatism.",
  },
  {
    icon: Globe,
    title: "Global Reach, Local Roots",
    description: "Serving clients worldwide while staying true to our Midwest values of hard work and integrity.",
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-prairie-deep" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block text-primary font-medium mb-4 tracking-wider uppercase text-sm"
          >
            Our Mission
          </motion.span>
          
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Terraforming the Midwest </span>
            <span className="text-gradient-wheat">Midwest</span>
            <span className="text-foreground"> with </span>
            <span className="text-gradient-neon">AI</span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
          The Silicon Prairie isn't just a nickname—it's a blueprint. 
          We connect the hidden nodes of the Midwest:
          the Funders fueling growth, the Developers writing the code, and the Businesses ready to evolve.
          Our mission is simple: To integrate Artificial Intelligence into the soil of the heartland.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-8 h-full transition-all duration-500 hover:border-primary/30">
                {/* Icon */}
                <div className="relative mb-6 inline-block">
                  <div className="h-14 w-14 rounded-xl gradient-neon flex items-center justify-center group-hover:shadow-glow-cyan transition-shadow duration-500">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="absolute inset-0 rounded-xl gradient-neon opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 glass-card rounded-2xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient-neon mb-2">
                50+
              </div>
              <div className="text-muted-foreground text-sm md:text-base">Active Partners</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient-wheat mb-2">
                $12M
              </div>
              <div className="text-muted-foreground text-sm md:text-base">Funding Deployed</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient-neon mb-2">
                200+
              </div>
              <div className="text-muted-foreground text-sm md:text-base">AI Integrations</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
