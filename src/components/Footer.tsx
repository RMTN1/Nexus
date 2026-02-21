import { motion } from "framer-motion";
import { MapPin, Mail, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-border/30">
      <div className="absolute inset-0 bg-prairie-deep" />
      
      <div className="relative container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/favicon.svg" alt="Wheat Logo" className="h-10 w-10 object-contain" />
                <span className="font-display font-semibold text-xl">
                  <span className="text-[#60a5fa]">Silicon</span> <span className="text-[#D4AF37]">Prairie</span>
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Connecting the heartland to the future of AI. Building tomorrow's 
                innovation ecosystem from the ground up in Lincoln, Nebraska.
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Lincoln, Nebraska</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Network</h4>
              <ul className="space-y-3">
                {["For Funders", "For Developers", "For Businesses", "Success Stories"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors link-glow">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Connect</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:hello@siliconprairie.ai" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    hello@siliconprairie.ai
                  </a>
                </li>
                <li className="flex gap-4 pt-2">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Silicon Prairie. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
