import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Kanban, 
  Calculator, 
  Target, 
  Calendar, 
  GraduationCap, 
  UserPlus, 
  BarChart3, 
  Smartphone, 
  Plug, 
  Trophy,
  ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer, cardHover } from '@/lib/animations';

const features = [
  {
    icon: Users,
    title: 'HR Management',
    description: 'Complete employee lifecycle from onboarding to exit with document management.',
    color: 'from-blue-500 to-indigo-600',
    size: 'large'
  },
  {
    icon: Clock,
    title: 'Attendance & Time',
    description: 'GPS-based check-in/out with shift management.',
    color: 'from-emerald-500 to-teal-600',
    size: 'medium'
  },
  {
    icon: Kanban,
    title: 'Project Management',
    description: 'Kanban boards, sprints, and Gantt charts.',
    color: 'from-orange-500 to-red-600',
    size: 'medium'
  },
  {
    icon: Calculator,
    title: 'Payroll Processing',
    description: 'Automated salary calculations with compliance.',
    color: 'from-violet-500 to-purple-600',
    size: 'medium'
  },
  {
    icon: Target,
    title: 'Performance & OKRs',
    description: 'Goal tracking and performance reviews.',
    color: 'from-pink-500 to-rose-600',
    size: 'small'
  },
  {
    icon: Calendar,
    title: 'Leave Management',
    description: 'Streamlined leave requests and approvals.',
    color: 'from-cyan-500 to-blue-600',
    size: 'small'
  },
  {
    icon: GraduationCap,
    title: 'Training & Development',
    description: 'Course management with assessments.',
    color: 'from-amber-500 to-orange-600',
    size: 'small'
  },
  {
    icon: UserPlus,
    title: 'Recruitment',
    description: 'End-to-end hiring workflow.',
    color: 'from-lime-500 to-green-600',
    size: 'small'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights with custom reports, KPI tracking, and data visualization.',
    color: 'from-sky-500 to-indigo-600',
    size: 'large'
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Full-featured mobile experience.',
    color: 'from-fuchsia-500 to-pink-600',
    size: 'medium'
  },
  {
    icon: Trophy,
    title: 'Rewards & Gamification',
    description: 'Coin-based recognition system.',
    color: 'from-yellow-500 to-amber-600',
    size: 'small'
  },
  {
    icon: Plug,
    title: 'Integrations',
    description: 'Connect with your favorite tools.',
    color: 'from-slate-500 to-gray-600',
    size: 'small'
  }
];

export function FeaturesGrid() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700">
            Complete Platform
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need, One Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of tools designed for modern enterprise workforce management
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const isLarge = feature.size === 'large';
            const isMedium = feature.size === 'medium';
            
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className={`${
                  isLarge ? 'sm:col-span-2 lg:col-span-2' : ''
                } ${isMedium ? 'lg:col-span-1' : ''}`}
              >
                <motion.div
                  className={`group relative h-full p-6 rounded-2xl bg-background border border-border/50 overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 ${
                    isLarge ? 'min-h-[280px]' : 'min-h-[200px]'
                  }`}
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${feature.color}`} />
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    {feature.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-600" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Large card extra content */}
                  {isLarge && (
                    <Link 
                      to="/features"
                      className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Learn more
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesGrid;
