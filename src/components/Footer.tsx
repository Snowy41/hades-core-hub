import { Link } from "react-router-dom";
import { Flame, Github, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold gradient-hades-text tracking-widest">HADES</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The ultimate ghost injection client. Undetected. Unstoppable.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Product</h4>
            <div className="flex flex-col gap-2">
              <Link to="/download" className="text-sm text-muted-foreground hover:text-primary transition-colors">Download</Link>
              <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace</Link>
              <span className="text-sm text-muted-foreground">Changelog</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">Register</Link>
              <span className="text-sm text-muted-foreground">Profile</span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-foreground mb-4">Community</h4>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hades Client. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
