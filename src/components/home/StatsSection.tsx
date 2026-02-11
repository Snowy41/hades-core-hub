import { motion } from "framer-motion";

const stats = [
  { value: "15K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "500+", label: "Configs" },
  { value: "0", label: "Detections" },
];

const StatsSection = () => {
  return (
    <section className="py-16 border-y border-border/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="font-display text-3xl sm:text-4xl font-bold gradient-hades-text mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
