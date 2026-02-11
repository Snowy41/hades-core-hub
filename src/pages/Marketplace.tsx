import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Download, BadgeCheck, Filter, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const mockConfigs = [
  { id: 1, name: "HypixelGod v3", author: "Hades Team", official: true, category: "PvP", price: 0, rating: 4.9, downloads: 3420, description: "Optimized for Hypixel Bedwars & Skywars." },
  { id: 2, name: "VulcanBypass Pro", author: "Hades Team", official: true, category: "Bypass", price: 0, rating: 4.8, downloads: 2810, description: "Full Vulcan bypass configuration." },
  { id: 3, name: "SmoothAim Elite", author: "xD4rk", official: false, category: "PvP", price: 150, rating: 4.6, downloads: 890, description: "Clean aim-assist with legit settings." },
  { id: 4, name: "SpeedBridge Config", author: "BridgeMaster", official: false, category: "Movement", price: 0, rating: 4.3, downloads: 1240, description: "Perfect scaffold and bridge settings." },
  { id: 5, name: "Ghost HvH Pack", author: "ph4ntom", official: false, category: "HvH", price: 300, rating: 4.7, downloads: 560, description: "Competitive HvH config with custom KillAura." },
  { id: 6, name: "Stealth Suite", author: "Hades Team", official: true, category: "Bypass", price: 0, rating: 5.0, downloads: 4100, description: "Complete stealth mode configuration." },
];

const categories = ["All", "PvP", "Bypass", "Movement", "HvH"];

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = mockConfigs.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.author.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || c.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Header */}
        <section className="py-12 text-center">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
                Config <span className="gradient-hades-text">Marketplace</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Browse, download, and share configs. Official configs are free.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search configs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 glass border-border/50"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={category === cat ? "default" : "outline"}
                    className={category === cat ? "gradient-hades font-semibold" : "border-border/50"}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {filtered.map((config, i) => (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl p-5 flex flex-col hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-sm font-semibold">{config.name}</h3>
                        {config.official && (
                          <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">by {config.author}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {config.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">{config.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" />
                        {config.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {config.downloads.toLocaleString()}
                      </span>
                    </div>
                    <Button size="sm" variant={config.price === 0 ? "default" : "outline"} className={config.price === 0 ? "gradient-hades text-xs" : "text-xs"}>
                      {config.price === 0 ? (
                        "Free"
                      ) : (
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {config.price}
                        </span>
                      )}
                    </Button>
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

export default Marketplace;
