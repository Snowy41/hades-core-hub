import { motion } from "framer-motion";
import { Check, X, Star, Zap, Crown, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Zap,
    highlight: false,
    features: [
      { text: "Basic modules", included: true },
      { text: "Community configs", included: true },
      { text: "Standard injection", included: true },
      { text: "Ghost injection", included: false },
      { text: "Bypass engine", included: false },
      { text: "Stealth mode", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    icon: Star,
    highlight: true,
    features: [
      { text: "All modules (100+)", included: true },
      { text: "Community configs", included: true },
      { text: "Ghost injection", included: true },
      { text: "Bypass engine", included: true },
      { text: "Stealth mode", included: true },
      { text: "Priority support", included: true },
      { text: "Early access updates", included: false },
    ],
  },
  {
    name: "Lifetime",
    price: "$49.99",
    period: "one-time",
    icon: Crown,
    highlight: false,
    features: [
      { text: "All modules (100+)", included: true },
      { text: "Community configs", included: true },
      { text: "Ghost injection", included: true },
      { text: "Bypass engine", included: true },
      { text: "Stealth mode", included: true },
      { text: "Priority support", included: true },
      { text: "Early access updates", included: true },
    ],
  },
];

const changelog = [
  { version: "v2.4.0", date: "Feb 8, 2026", changes: "New KillAura modes, Vulcan bypass update, UI refresh" },
  { version: "v2.3.2", date: "Jan 28, 2026", changes: "Fixed Scaffold flagging on Hypixel, performance improvements" },
  { version: "v2.3.0", date: "Jan 15, 2026", changes: "Added Stealth Mode, new config marketplace integration" },
  { version: "v2.2.1", date: "Dec 30, 2025", changes: "Hotfix for Watchdog detection, Timer improvements" },
];

const Download = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
                Choose Your <span className="gradient-hades-text">Plan</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                From casual to competitive — we've got a tier for every player.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-xl p-6 flex flex-col ${
                    tier.highlight
                      ? "glass border-primary/40 glow-orange"
                      : "glass"
                  }`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-hades text-xs font-display font-semibold text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <tier.icon className="h-5 w-5 text-primary" />
                    <span className="font-display text-sm font-semibold tracking-wider">{tier.name}</span>
                  </div>
                  <div className="mb-6">
                    <span className="font-display text-3xl font-bold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">{tier.period}</span>
                  </div>
                  <div className="flex flex-col gap-3 flex-1 mb-6">
                    {tier.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-2 text-sm">
                        {f.included ? (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span className={f.included ? "text-foreground" : "text-muted-foreground/40"}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={
                      tier.highlight
                        ? "gradient-hades glow-orange font-display font-semibold tracking-wider"
                        : "font-display font-semibold tracking-wider"
                    }
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    {tier.price === "$0" ? "Download Free" : "Get " + tier.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Showcase */}
        <section className="py-16 border-t border-border/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                See It <span className="gradient-hades-text">In Action</span>
              </h2>
              <p className="text-muted-foreground">Watch Hades dominate on every server.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {["PvP Highlights", "Bypass Demo"].map((title) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-xl aspect-video flex items-center justify-center group cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="text-center">
                    <Play className="h-10 w-10 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-muted-foreground">{title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Changelog */}
        <section className="py-16 border-t border-border/20">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                <span className="gradient-hades-text">Changelog</span>
              </h2>
              <p className="text-muted-foreground">Latest updates and improvements.</p>
            </motion.div>
            <div className="space-y-4">
              {changelog.map((entry, i) => (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-display text-xs font-semibold text-primary">{entry.version}</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{entry.date}</div>
                    <p className="text-sm text-foreground">{entry.changes}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Download;
