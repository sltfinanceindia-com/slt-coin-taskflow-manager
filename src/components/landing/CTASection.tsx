import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Shield, Zap, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer, buttonMagnetic } from '@/lib/animations';

export function CTASection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A90E2] via-[#2E5F99] to-[#1A3A6B]">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 40%)
            `
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl"
          style={{ top: '-10%', left: '-5%' }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-white/10 blur-3xl"
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
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="block">Workforce Management?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 500+ organizations using TeneXA to streamline HR, projects, and operations. Start your free trial today.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.div variants={buttonMagnetic} whileHover="hover" whileTap="tap">
              <Link to="/start-trial">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg bg-white text-[#2E5F99] hover:bg-white/90 shadow-xl shadow-black/10">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={buttonMagnetic} whileHover="hover" whileTap="tap">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule a Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Free onboarding</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <HeadphonesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">24/7 support</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
