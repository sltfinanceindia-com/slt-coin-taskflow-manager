import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Shield, Zap, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer, buttonMagnetic } from '@/lib/animations';

export function CTASection() {
  return (
    <section className="relative py-14 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2] via-[#2E5F99] to-[#1A3A6B]">
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-white/10 blur-3xl"
          style={{ top: '-10%', left: '-5%' }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"
          style={{ bottom: '-10%', right: '-5%' }}
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 variants={fadeInUp} className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your
            <span className="block">Workforce Management?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm md:text-base text-white/80 mb-8 max-w-2xl mx-auto">
            Join 500+ organizations using TeneXA to streamline HR, projects, and operations. Start your free trial today.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <motion.div variants={buttonMagnetic} whileHover="hover" whileTap="tap">
              <Link to="/start-trial">
                <Button size="default" className="w-full sm:w-auto bg-white text-[#2E5F99] hover:bg-white/90 shadow-xl shadow-black/10">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={buttonMagnetic} whileHover="hover" whileTap="tap">
              <Link to="/contact">
                <Button size="default" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule a Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Free onboarding</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <HeadphonesIcon className="h-4 w-4" />
              <span className="text-xs font-medium">24/7 support</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
