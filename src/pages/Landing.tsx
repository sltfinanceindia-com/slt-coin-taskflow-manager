import { motion } from 'framer-motion';
import { SEOHead, generateOrganizationSchema } from '@/components/SEOHead';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { IntegrationsSection } from '@/components/landing/IntegrationsSection';
import { CTASection } from '@/components/landing/CTASection';
import { StickyCtaBar } from '@/components/landing/StickyCtaBar';

export default function Landing() {
  return (
    <>
      <SEOHead 
        title="TeneXA - Complete Enterprise HR & Workforce Management Platform"
        description="All-in-one HR, BPO, and project management platform for modern enterprises. Streamline attendance, payroll, performance, and team collaboration. Start your free trial today."
        keywords="HR software, workforce management, attendance tracking, payroll processing, project management, employee management, BPO platform, TeneXA"
        canonical="https://sltwork.lovable.app/"
        structuredData={generateOrganizationSchema()}
      />
      
      <motion.div 
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <PublicHeader />
        
        <main>
          <HeroSection />
          <ProblemSolutionSection />
          <FeaturesGrid />
          <HowItWorksSection />
          <TestimonialsSection />
          <StatsSection />
          <IntegrationsSection />
          <CTASection />
        </main>
        
        <PublicFooter />
        <StickyCtaBar />
      </motion.div>
    </>
  );
}
