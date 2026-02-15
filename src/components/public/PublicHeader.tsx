import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Menu, 
  ArrowRight, 
  ChevronDown,
  Users,
  Clock,
  Kanban,
  Calculator,
  Target,
  Calendar,
  GraduationCap,
  BarChart3,
  X
} from 'lucide-react';

const features = [
  { name: 'HR Management', description: 'Complete employee lifecycle', icon: Users, href: '/features#hr' },
  { name: 'Attendance & Time', description: 'GPS-based tracking', icon: Clock, href: '/features#attendance' },
  { name: 'Project Management', description: 'Kanban, sprints, Gantt', icon: Kanban, href: '/features#projects' },
  { name: 'Payroll Processing', description: 'Automated calculations', icon: Calculator, href: '/features#payroll' },
  { name: 'Performance & OKRs', description: 'Goal tracking', icon: Target, href: '/features#performance' },
  { name: 'Leave Management', description: 'Request & approvals', icon: Calendar, href: '/features#attendance' },
  { name: 'Training', description: 'Courses & assessments', icon: GraduationCap, href: '/features#hr' },
  { name: 'Analytics', description: 'Insights & reports', icon: BarChart3, href: '/features#analytics' },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-16' : 'h-20'
        }`} aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/slt-hub-icon.png" 
              alt="TeneXA"
              className={`rounded-lg object-contain transition-all duration-300 ${
                scrolled ? 'h-8 w-8' : 'h-10 w-10'
              }`}
              width="40"
              height="40"
              loading="eager"
            />
            <span className={`font-bold text-foreground transition-all duration-300 ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>
              <span className="font-black">TeneXA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Features Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                onBlur={() => setTimeout(() => setFeaturesOpen(false), 200)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/features') 
                    ? 'text-foreground bg-muted' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Features
                <ChevronDown className={`h-4 w-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {featuresOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-[600px] p-6 rounded-2xl bg-background dark:bg-[#1A1A1A] backdrop-blur-xl border border-border shadow-xl"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {features.map((feature) => (
                        <Link
                          key={feature.name}
                          to={feature.href}
                          className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                          onClick={(e) => {
                            setFeaturesOpen(false);
                            // If already on /features, manually trigger hash scroll
                            if (location.pathname === '/features') {
                              const hash = feature.href.split('#')[1];
                              if (hash) {
                                e.preventDefault();
                                window.location.hash = hash;
                                setTimeout(() => {
                                  document.getElementById('features-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                              }
                            }
                          }}
                        >
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                            <feature.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{feature.name}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link 
                        to="/features" 
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        View all features
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/pricing">
              <Button 
                variant="ghost" 
                className={`text-sm ${
                  isActive('/pricing') 
                    ? 'text-foreground bg-muted' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pricing
              </Button>
            </Link>
            <Link to="/resources">
              <Button 
                variant="ghost" 
                className={`text-sm ${
                  isActive('/resources') 
                    ? 'text-foreground bg-muted' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Resources
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="ghost" 
                className={`text-sm ${
                  isActive('/about') 
                    ? 'text-foreground bg-muted' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                About
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="ghost" 
                className={`text-sm ${
                  isActive('/contact') 
                    ? 'text-foreground bg-muted' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Contact
              </Button>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/start-trial">
                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile menu header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <img src="/slt-hub-icon.png" alt="TeneXA" className="h-8 w-8 rounded-lg" />
                        <span className="font-bold text-foreground">TeneXA</span>
                      </Link>
                    </div>

                    {/* Mobile menu items */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <nav className="space-y-2">
                        <Link 
                          to="/" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block p-3 rounded-lg font-medium ${
                            isActive('/') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          Home
                        </Link>
                        <Link 
                          to="/features" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block p-3 rounded-lg font-medium ${
                            isActive('/features') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          Features
                        </Link>
                        <Link 
                          to="/pricing" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block p-3 rounded-lg font-medium ${
                            isActive('/pricing') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          Pricing
                        </Link>
                        <Link 
                          to="/about" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block p-3 rounded-lg font-medium ${
                            isActive('/about') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          About
                        </Link>
                        <Link 
                          to="/resources" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block p-3 rounded-lg font-medium ${
                            isActive('/resources') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          Resources
                        </Link>
                        <Link 
                          to="/contact" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block p-3 rounded-lg font-medium ${
                            isActive('/contact') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          Contact
                        </Link>
                      </nav>
                    </div>

                    {/* Mobile menu footer */}
                    <div className="p-6 border-t border-border space-y-3">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/start-trial" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full justify-center bg-primary hover:bg-primary/90">
                          Start Free Trial
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
