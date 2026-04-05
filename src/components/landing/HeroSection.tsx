import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Globe, HeadphonesIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from './AnimatedBackground';
import { TrustBadges } from './TrustBadges';
import { fadeInUp, staggerContainer, wordStagger, wordFadeIn, buttonMagnetic } from '@/lib/animations';

import dashboardPreview from '@/assets/dashboard-preview.jpg';

export function HeroSection() {
  const headline = "Transform Your Workforce Management";
  const words = headline.split(' ');

  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden py-14">
      <AnimatedBackground variant="hero" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-5xl text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm font-medium">
              <Sparkles className="mr-2 h-4 w-4" />
              All-in-One HR & BPO Platform
            </Badge>
          </motion.div>

          <motion.h1 
            className="mb-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-[1.1]"
            variants={wordStagger}
          >
            {words.map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-[0.25em]"
                variants={wordFadeIn}
              >
                {index === 2 ? (
                  <span className="bg-gradient-to-r from-primary to-[#64A8FF] bg-clip-text text-transparent">
                    {word}
                  </span>
                ) : word}
              </motion.span>
            ))}
            <motion.span 
              className="block mt-1 bg-gradient-to-r from-primary via-[#64A8FF] to-[#2E5F99] bg-clip-text text-transparent"
              variants={wordFadeIn}
            >
              with TeneXA
            </motion.span>
          </motion.h1>

          <motion.p 
            className="mb-8 text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            The complete enterprise platform for HR management, project tracking, 
            attendance, payroll, and team collaboration—all in one place.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
            variants={fadeInUp}
          >
            <motion.div variants={buttonMagnetic} whileHover="hover" whileTap="tap">
              <Link to="/start-trial">
                <Button size="default" className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#2E5F99] hover:from-[#64A8FF] hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={buttonMagnetic} whileHover="hover" whileTap="tap">
              <Link to="/features">
                <Button size="default" variant="outline" className="w-full sm:w-auto border-2 hover:bg-muted/50">
                  <Play className="mr-2 h-4 w-4" />
                  Explore Features
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground mb-10"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <Shield className="h-4 w-4 text-primary" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <Globe className="h-4 w-4 text-primary" />
              <span>Cloud-Native</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <HeadphonesIcon className="h-4 w-4 text-primary" />
              <span>24/7 Support</span>
            </div>
          </motion.div>

          <motion.div 
            className="relative mx-auto max-w-5xl"
            variants={fadeInUp}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-[#64A8FF]/20 to-[#2E5F99]/20 rounded-2xl blur-2xl opacity-60" />
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-background">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <motion.img 
                src={dashboardPreview}
                alt="TeneXA Dashboard - Complete workforce management platform"
                className="w-full"
                loading="lazy"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <TrustBadges />
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-1.5">
          <motion.div 
            className="w-1 h-1 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
