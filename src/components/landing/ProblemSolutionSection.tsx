import { motion } from 'framer-motion';
import { useState } from 'react';
import { AlertCircle, CheckCircle2, Link2Off, Timer, FileSpreadsheet, Clock, Eye, Layers, MapPin, Kanban, Calculator, Brain } from 'lucide-react';
import { fadeInLeft, fadeInRight, staggerContainer } from '@/lib/animations';
import { AnimatedBackground } from './AnimatedBackground';

const problems = [
  { id: 1, icon: Link2Off, title: 'Disconnected HR systems', description: "Multiple tools that don't talk to each other" },
  { id: 2, icon: Timer, title: 'Manual attendance tracking', description: 'Error-prone spreadsheets and registers' },
  { id: 3, icon: FileSpreadsheet, title: 'Spreadsheet-based projects', description: 'No real-time visibility or collaboration' },
  { id: 4, icon: Clock, title: 'Delayed payroll processing', description: 'Manual calculations causing errors' },
  { id: 5, icon: Eye, title: 'No capacity visibility', description: 'Guesswork for resource planning' }
];

const solutions = [
  { id: 1, icon: Layers, title: 'Unified platform', description: 'All HR needs in one integrated system' },
  { id: 2, icon: MapPin, title: 'GPS-based tracking', description: 'Real-time attendance with geofencing' },
  { id: 3, icon: Kanban, title: 'Advanced project tools', description: 'Kanban, Gantt, and sprint planning' },
  { id: 4, icon: Calculator, title: 'Automated payroll', description: 'Compliant calculations with one click' },
  { id: 5, icon: Brain, title: 'AI-powered forecasting', description: 'Smart capacity planning and insights' }
];

export function ProblemSolutionSection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="relative py-14 overflow-hidden">
      <AnimatedBackground variant="dark" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">From Problems to Solutions</h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">See how TeneXA transforms your biggest HR challenges into streamlined solutions</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 max-w-6xl mx-auto">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-red-500/20"><AlertCircle className="h-5 w-5 text-red-400" /></div>
              <h3 className="text-base font-semibold text-white">Struggling with...</h3>
            </div>
            <div className="space-y-3">
              {problems.map((problem) => (
                <motion.div
                  key={problem.id} variants={fadeInLeft}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredId === problem.id ? 'bg-red-500/10 border-red-500/50 scale-[1.02]' : 'bg-[#1A1A1A]/50 border-[#3A3A3A]/50 hover:border-[#3A3A3A]'
                  }`}
                  onMouseEnter={() => setHoveredId(problem.id)} onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${hoveredId === problem.id ? 'bg-red-500/20' : 'bg-[#2A2A2A]/50'}`}>
                      <problem.icon className={`h-4 w-4 ${hoveredId === problem.id ? 'text-red-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">{problem.title}</h4>
                      <p className="text-xs text-slate-400">{problem.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-[#4A90E2]/20"><CheckCircle2 className="h-5 w-5 text-[#64A8FF]" /></div>
              <h3 className="text-base font-semibold text-white">TeneXA solves it all</h3>
            </div>
            <div className="space-y-3">
              {solutions.map((solution) => (
                <motion.div
                  key={solution.id} variants={fadeInRight}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredId === solution.id ? 'bg-[#4A90E2]/10 border-[#4A90E2]/50 scale-[1.02]' : 'bg-[#1A1A1A]/50 border-[#3A3A3A]/50 hover:border-[#3A3A3A]'
                  }`}
                  onMouseEnter={() => setHoveredId(solution.id)} onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${hoveredId === solution.id ? 'bg-[#4A90E2]/20' : 'bg-[#2A2A2A]/50'}`}>
                      <solution.icon className={`h-4 w-4 ${hoveredId === solution.id ? 'text-[#64A8FF]' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#4A90E2]" />
                        <h4 className="text-sm font-semibold text-white">{solution.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">{solution.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;
