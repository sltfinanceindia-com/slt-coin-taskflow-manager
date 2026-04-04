import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Heart, 
  Lightbulb, 
  Users, 
  Shield,
  ArrowRight,
  Linkedin,
  Twitter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { AnimatedBackground } from '@/components/landing/AnimatedBackground';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { SEOHead } from '@/components/SEOHead';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We constantly push boundaries to deliver cutting-edge solutions that transform how organizations work.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    icon: Heart,
    title: 'Customer Success',
    description: 'Your success is our success. We go above and beyond to ensure every customer achieves their goals.',
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We build relationships on trust through honest communication and transparent practices.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: Users,
    title: 'Team Excellence',
    description: 'Great products come from great teams. We invest in our people and celebrate collective achievements.',
    color: 'from-sky-500 to-blue-600'
  }
];

const team = [
  { name: 'Komirisetti Gopi', role: 'Founder', image: null },
];

const milestones = [
  { year: '2021', title: 'Founded', description: 'TeneXA was born with a vision to transform workforce management' },
  { year: '2022', title: 'First 100 Customers', description: 'Reached our first major milestone with 100 paying customers' },
  { year: '2023', title: 'Series A Funding', description: 'Raised funding to accelerate product development and expansion' },
  { year: '2024', title: '500+ Organizations', description: 'Now serving over 500 organizations across India' },
];

export default function About() {
  return (
    <>
      <SEOHead 
        title="About Us - TeneXA | Our Mission & Team"
        description="Learn about TeneXA's mission to transform workforce management. Meet our team and discover our values that drive innovation in HR technology."
        keywords="about TeneXA, HR software company, workforce management, our team, company values"
        canonical="https://sltwork.lovable.app/about"
      />
      
      <div className="min-h-screen bg-background">
        <PublicHeader />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-14 overflow-hidden">
            <AnimatedBackground variant="hero" />
            
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="max-w-4xl mx-auto text-center"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={fadeInUp}>
                  <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                    <Target className="mr-2 h-4 w-4" />
                    Our Mission
                  </Badge>
                </motion.div>
                
                <motion.h1 
                  variants={fadeInUp}
                  className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight"
                >
                  Building the Future of
                  <span className="block bg-gradient-to-r from-primary to-[#64A8FF] bg-clip-text text-transparent">
                    Work Management
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                  Our mission is to empower organizations with intelligent, integrated workforce solutions 
                  that simplify complexity and unlock human potential.
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Our Story Timeline */}
          <section className="py-24 lg:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Our Journey
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  From a small startup to serving 500+ organizations
                </p>
              </motion.div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />
                  
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.year}
                      className={`relative flex items-center gap-8 mb-12 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background md:-translate-x-2 z-10" />
                      
                      {/* Content */}
                      <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <span className="text-primary font-bold text-lg">{milestone.year}</span>
                        <h3 className="text-xl font-semibold text-foreground mt-1">{milestone.title}</h3>
                        <p className="text-muted-foreground mt-2">{milestone.description}</p>
                      </div>
                      
                      <div className="hidden md:block flex-1" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-24 lg:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Our Values
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {values.map((value) => (
                  <motion.div
                    key={value.title}
                    variants={fadeInUp}
                    className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <value.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-24 lg:py-32 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Meet Our Team
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The passionate people behind TeneXA
                </p>
              </motion.div>

              <motion.div
                className="flex justify-center max-w-6xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {team.map((member) => (
                  <motion.div
                    key={member.name}
                    variants={fadeInUp}
                    className="group text-center"
                  >
                    <div className="relative mb-4">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-[#2E5F99] flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {/* Social overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href="#" className="w-8 h-8 rounded-full bg-background shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-background shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Stats */}
          <StatsSection />

          {/* CTA */}
          <CTASection />
        </main>
        
        <PublicFooter />
      </div>
    </>
  );
}
