import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollProgress } from '@/hooks/useScrollAnimation';

export function StickyCtaBar() {
  const scrollProgress = useScrollProgress();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (scrollProgress > 0.4 && !isDismissed) setIsVisible(true);
    else if (scrollProgress < 0.3) setIsVisible(false);
  }, [scrollProgress, isDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden"
        >
          <div className="relative bg-gradient-to-r from-primary to-[#2E5F99] rounded-2xl shadow-2xl shadow-primary/30 p-4">
            <button
              onClick={() => { setIsDismissed(true); setIsVisible(false); }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Start your free trial today</p>
                <p className="text-white/70 text-xs">No credit card required</p>
              </div>
              <Link to="/start-trial">
                <Button size="sm" className="bg-white text-[#2E5F99] hover:bg-white/90 shadow-lg">
                  Get Started
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyCtaBar;
