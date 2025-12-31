import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, ArrowRight } from 'lucide-react';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link to="/" onClick={() => setMobileMenuOpen(false)}>
        <Button 
          variant="ghost" 
          className={`w-full justify-start sm:w-auto transition-all duration-200 hover-lift focus-ring ${
            isActive('/') ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          Home
        </Button>
      </Link>
      <Link to="/features" onClick={() => setMobileMenuOpen(false)}>
        <Button 
          variant="ghost" 
          className={`w-full justify-start sm:w-auto transition-all duration-200 hover-lift focus-ring ${
            isActive('/features') ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          Features
        </Button>
      </Link>
      <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
        <Button 
          variant="ghost" 
          className={`w-full justify-start sm:w-auto transition-all duration-200 hover-lift focus-ring ${
            isActive('/pricing') ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          Pricing
        </Button>
      </Link>
      <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
        <Button 
          variant="ghost" 
          className={`w-full justify-start sm:w-auto transition-all duration-200 hover-lift focus-ring ${
            isActive('/contact') ? 'text-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          Contact
        </Button>
      </Link>
      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" className="w-full justify-start sm:w-auto transition-all duration-200 hover-lift focus-ring text-muted-foreground">
          Sign In
        </Button>
      </Link>
      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
        <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover-grow focus-ring">
          Start Free Trial
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex h-14 sm:h-16 items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/slt-hub-icon.png" 
              alt="Tenexa"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
              width="40"
              height="40"
              loading="eager"
            />
            <span className="text-sm sm:text-lg font-bold text-foreground">
              <span className="font-black">Tenexa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button 
                variant="ghost" 
                className={isActive('/') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Home
              </Button>
            </Link>
            <Link to="/features">
              <Button 
                variant="ghost" 
                className={isActive('/features') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Features
              </Button>
            </Link>
            <Link to="/pricing">
              <Button 
                variant="ghost" 
                className={isActive('/pricing') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Pricing
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="ghost" 
                className={isActive('/contact') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Contact
              </Button>
            </Link>
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] pt-12">
                <div className="flex flex-col gap-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
