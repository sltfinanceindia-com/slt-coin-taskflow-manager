import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Globe, HeadphonesIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from './AnimatedBackground';
import { TrustBadges } from './TrustBadges';
import { fadeInUp, staggerContainer, wordStagger, wordFadeIn, buttonMagnetic } from '@/lib/animations';

// Import dashboard preview
import dashboardPreview from '@/assets/dashboard-preview.jpg';

export function HeroSection() {
  const headline = "Transform Your Workforce Management";
  const words = headline.split(' ');

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20 lg:py-32">
      <AnimatedBackground variant="hero" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-5xl text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
              <Sparkles className="mr-2 h-4 w-4" />
              All-in-One HR & BPO Platform
            </Badge>
          </motion.div>

          {/* Animated Headline */}
          <motion.h1 
            className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
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
              className="block mt-2 bg-gradient-to-r from-primary via-[#64A8FF] to-[#2E5F99] bg-clip-text text-transparent"
              variants={wordFadeIn}
            >
              with TeneXA
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="mb-10 text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            The complete enterprise platform for HR management, project tracking, 
            attendance, payroll, and team collaboration—all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            variants={fadeInUp}
          >
            <motion.div
              variants={buttonMagnetic}
              whileHover="hover"
              whileTap="tap"
            >
              <Link to="/start-trial">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-primary to-[#2E5F99] hover:from-[#64A8FF] hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              variants={buttonMagnetic}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-14 px-8 text-lg border-2 hover:bg-muted/50"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground mb-16"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-5 w-5 text-primary" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-5 w-5 text-primary" />
              <span>Cloud-Native</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <HeadphonesIcon className="h-5 w-5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            className="relative mx-auto max-w-5xl"
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-[#64A8FF]/20 to-[#2E5F99]/20 rounded-2xl blur-2xl opacity-60" />
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-background">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <motion.img 
                src={dashboardPreview}
                alt="TeneXA Dashboard - Complete workforce management platform"
                className="w-full"
                loading="eager"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Trust Badges Marquee */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <TrustBadges />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <motion.div 
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
