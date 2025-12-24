import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

const SplashScreen = ({ onComplete, minDuration = 2000 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center ${
            isDark 
              ? 'bg-gradient-to-br from-background via-background to-primary/20' 
              : 'bg-gradient-to-br from-primary via-primary/90 to-primary/80'
          }`}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${isDark ? 'bg-primary/20' : 'bg-white/10'}`}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: [null, Math.random() * -200 - 100],
                  opacity: [0.3, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Glowing ring */}
          <motion.div
            className={`absolute w-64 h-64 rounded-full border-2 ${isDark ? 'border-primary/30' : 'border-white/20'}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute w-80 h-80 rounded-full border ${isDark ? 'border-primary/20' : 'border-white/10'}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 20,
                delay: 0.2 
              }}
              className="mb-6"
            >
              <div className="relative">
                <motion.img
                  src="/slt-hub-icon.png"
                  alt="SLT work HuB"
                  className={`w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl rounded-3xl ${
                    isDark ? 'bg-card/50 p-2' : ''
                  }`}
                  animate={{ 
                    filter: isDark 
                      ? ['drop-shadow(0 0 20px hsl(var(--primary)/0.3))', 'drop-shadow(0 0 40px hsl(var(--primary)/0.5))', 'drop-shadow(0 0 20px hsl(var(--primary)/0.3))']
                      : ['drop-shadow(0 0 20px rgba(255,255,255,0.3))', 'drop-shadow(0 0 40px rgba(255,255,255,0.5))', 'drop-shadow(0 0 20px rgba(255,255,255,0.3))']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className={`text-3xl md:text-4xl font-bold mb-2 tracking-tight ${
                isDark ? 'text-foreground' : 'text-white'
              }`}
            >
              SLT work{' '}
              <span className="text-amber-400">HuB</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={`text-sm md:text-base mb-8 ${
                isDark ? 'text-muted-foreground' : 'text-white/70'
              }`}
            >
              Smart Task Management & Rewards
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${isDark ? 'bg-primary' : 'bg-white'}`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom gradient */}
          <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${
            isDark ? 'from-background/50' : 'from-black/20'
          } to-transparent`} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
