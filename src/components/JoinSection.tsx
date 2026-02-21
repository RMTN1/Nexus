import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Loader2, ArrowRight, DollarSign, Code, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const userTypes = [
  { value: "funder", label: "Funder", icon: DollarSign, description: "Invest in AI ventures" },
  { value: "developer", label: "Developer", icon: Code, description: "Build AI solutions" },
  { value: "business", label: "Business", icon: Building2, description: "Integrate AI services" },
];

const JoinSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !userType) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email and select your role.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Welcome to Silicon Prairie!",
      description: "We'll be in touch soon with next steps.",
    });
  };

  return (
    <section id="join" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 grid-overlay opacity-10" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-20 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
      />

      <div className="relative container mx-auto px-6" ref={ref}>
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block text-primary font-medium mb-4 tracking-wider uppercase text-sm">
                Join the Network
              </span>
              
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Become a Node in the </span>
                <span className="text-gradient-neon">Network</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                The grid is growing. Whether you are a Funder, Developer, or Business—connect to the Silicon Prairie ecosystem here.
              </p>

              {/* Benefits */}
              <div className="space-y-4">
                {[
                  "Priority access to funding opportunities",
                  "Connect with top Midwest AI talent",
                  "Exclusive workshops and networking events",
                  "Early adopter benefits and discounts",
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground/80">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="glass-card rounded-2xl p-8 md:p-10">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="h-20 w-20 rounded-full gradient-neon flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3 text-foreground">
                      You're In!
                    </h3>
                    <p className="text-muted-foreground">
                      Welcome to Silicon Prairie. Check your inbox for next steps.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                        Join the Network
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Start your journey with Silicon Prairie today
                      </p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50 border-border/50 focus:border-primary h-12"
                      />
                    </div>

                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-foreground">I am a...</Label>
                      <RadioGroup
                        value={userType}
                        onValueChange={setUserType}
                        className="grid grid-cols-1 gap-3"
                      >
                        {userTypes.map((type) => (
                          <Label
                            key={type.value}
                            htmlFor={type.value}
                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              userType === type.value
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-border bg-muted/30"
                            }`}
                          >
                            <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                            <div className={`p-2 rounded-lg ${
                              userType === type.value ? "bg-primary/10" : "bg-muted"
                            }`}>
                              <type.icon className={`w-5 h-5 ${
                                userType === type.value ? "text-primary" : "text-muted-foreground"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${
                                userType === type.value ? "text-foreground" : "text-foreground/80"
                              }`}>
                                {type.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {type.description}
                              </div>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full gradient-neon text-primary-foreground font-semibold h-12 text-base hover:opacity-90 transition-opacity group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Join Silicon Prairie
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By joining, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
