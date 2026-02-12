import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Rocket, Settings, Zap, CheckCircle2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const steps = [
  { number: '01', icon: Rocket, title: 'Quick Setup & Onboarding', description: 'Create your account, import employees via CSV or manual entry, and configure your organization structure in minutes. No IT team required.', highlights: ['5-minute setup', 'Bulk employee import', 'Organization hierarchy'], position: 'left' },
  { number: '02', icon: Settings, title: 'Customize to Your Needs', description: 'Configure workflows, approval chains, shift patterns, leave policies, and more. Everything adapts to how your organization works.', highlights: ['Custom workflows', 'Flexible policies', 'Role-based access'], position: 'right' },
  { number: '03', icon: Zap, title: 'Launch & Scale', description: 'Onboard your team with guided tutorials, go live with confidence, and scale seamlessly from 10 to 10,000+ employees.', highlights: ['Team training', 'Instant go-live', 'Unlimited scaling'], position: 'left' }
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ['0%', '100%']);

  return (
    <section ref={containerRef} className="py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16 lg:mb-24" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Get Started in 3 Simple Steps</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From sign-up to fully operational in less than a day</p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2">
            <motion.div className="w-full bg-gradient-to-b from-primary to-[#2E5F99] origin-top" style={{ height: lineHeight }} />
          </div>

          <motion.div className="space-y-16 lg:space-y-24" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${step.position === 'right' ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`flex-1 ${step.position === 'right' ? 'lg:text-left' : 'lg:text-right'}`}>
                  <div className={`inline-flex items-center gap-3 mb-4 ${step.position === 'right' ? '' : 'lg:flex-row-reverse'}`}>
                    <span className="text-5xl lg:text-6xl font-bold text-primary/20">{step.number}</span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{step.description}</p>
                  <div className={`flex flex-wrap gap-3 ${step.position === 'right' ? '' : 'lg:justify-end'}`}>
                    {step.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div className="relative z-10 flex items-center justify-center" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#2E5F99] flex items-center justify-center shadow-lg shadow-primary/30">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                </motion.div>

                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
