import { Link } from 'react-router-dom';
import { BottomNavigation } from '@/components/BottomNavigation';

export function PublicFooter() {
  return (
    <>
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 py-10 sm:py-14" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:text-left md:flex-row md:justify-between">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src="/slt-hub-icon.png" 
                  alt="Tenexa"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
                />
                <span className="text-sm sm:text-lg font-bold">
                  <span className="font-black">Tenexa</span>
                </span>
              </div>
              <span className="text-emerald-400 font-medium flex items-center gap-2 text-xs sm:text-sm">
                <span>Made with ❤️ in</span>
                <span className="font-bold">భారత్ 🇮🇳</span>
              </span>
            </div>
            
            <nav className="flex flex-wrap justify-center md:justify-end gap-6 text-sm text-slate-400">
              <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <Link to="/features" className="hover:text-slate-300 transition-colors">Features</Link>
              <Link to="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
              <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            </nav>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-slate-400 text-xs sm:text-sm">
                © 2025 Tenexa. All rights reserved.
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation variant="public" />
      
      {/* Add padding at bottom for mobile nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
