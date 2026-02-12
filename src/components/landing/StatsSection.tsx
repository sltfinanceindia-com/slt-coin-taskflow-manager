import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useScrollAnimation';
import { Building2, Users, Zap, Headphones } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const stats = [
  { icon: Building2, value: 500, suffix: '+', label: 'Organizations', description: 'Trust TeneXA for their workforce management' },
  { icon: Users, value: 50000, suffix: '+', label: 'Employees Managed', description: 'Across industries and company sizes' },
  { icon: Zap, value: 99.9, suffix: '%', label: 'Uptime', description: 'Enterprise-grade reliability' },
  { icon: Headphones, value: 24, suffix: '/7', label: 'Support', description: 'Dedicated customer success team' }
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { ref, count } = useCountUp(stat.value, 2000);
  return (
    <motion.div ref={ref} variants={fadeInUp} className="relative group">
      <div className="text-center p-8 rounded-2xl bg-[#1A1A1A]/50 border border-[#3A3A3A]/50 hover:border-primary/50 transition-all duration-300 hover:bg-[#1A1A1A]/70">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-[#2E5F99] mb-6 group-hover:scale-110 transition-transform duration-300">
          <stat.icon className="h-7 w-7 text-white" />
        </div>
        <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-[#64A8FF] to-primary bg-clip-text text-transparent">
            {stat.value >= 1000 ? `${Math.floor(count / 1000)}K` : count}
            {stat.suffix}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{stat.label}</h3>
        <p className="text-sm text-slate-400">{stat.description}</p>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Platform by the Numbers</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Trusted by growing companies across India and beyond</p>
        </motion.div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default StatsSection;
