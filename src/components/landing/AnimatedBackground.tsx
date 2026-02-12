import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'hero' | 'section' | 'dark';
  className?: string;
}

export function AnimatedBackground({ variant = 'hero', className = '' }: AnimatedBackgroundProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Base gradient background */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A]' 
            : 'bg-gradient-to-br from-primary/5 via-background to-primary/3'
        }`}
      />
      
      {/* Blue floating orb */}
      <motion.div
        className={`absolute w-[600px] h-[600px] rounded-full blur-3xl ${
          isDark ? 'bg-[#4A90E2]/10' : 'bg-primary/15'
        }`}
        style={{ top: '-10%', left: '-5%' }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Secondary blue orb */}
      <motion.div
        className={`absolute w-[500px] h-[500px] rounded-full blur-3xl ${
          isDark ? 'bg-[#4A90E2]/8' : 'bg-primary/10'
        }`}
        style={{ top: '20%', right: '-10%' }}
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />
      
      {/* Tertiary orb */}
      <motion.div
        className={`absolute w-[400px] h-[400px] rounded-full blur-3xl ${
          isDark ? 'bg-[#2E5F99]/10' : 'bg-primary/8'
        }`}
        style={{ bottom: '10%', left: '30%' }}
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4
        }}
      />
      
      {/* Scattered blue dots pattern (banner-inspired) */}
      {isDark && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#4A90E2]"
              style={{
                width: `${8 + (i % 3) * 4}px`,
                height: `${8 + (i % 3) * 4}px`,
                top: `${10 + (i * 4.5) % 80}%`,
                left: `${5 + (i * 7.3) % 90}%`,
                opacity: 0.08 + (i % 5) * 0.04,
              }}
              animate={{
                opacity: [0.08 + (i % 5) * 0.04, 0.15 + (i % 5) * 0.05, 0.08 + (i % 5) * 0.04],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + (i % 3) * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3
              }}
            />
          ))}
        </>
      )}
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Radial gradient overlay for depth */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-radial from-transparent via-transparent to-[#0A0A0A]/50' 
            : 'bg-gradient-radial from-transparent via-transparent to-background/30'
        }`}
      />
    </div>
  );
}

export default AnimatedBackground;
