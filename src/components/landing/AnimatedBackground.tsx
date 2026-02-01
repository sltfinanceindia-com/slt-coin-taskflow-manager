import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'hero' | 'section' | 'dark';
  className?: string;
}

export function AnimatedBackground({ variant = 'hero', className = '' }: AnimatedBackgroundProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Animated gradient mesh background */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-emerald-50/50 via-background to-indigo-50/30'
        }`}
      />
      
      {/* Primary floating orb */}
      <motion.div
        className={`absolute w-[600px] h-[600px] rounded-full blur-3xl ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'
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
      
      {/* Secondary floating orb */}
      <motion.div
        className={`absolute w-[500px] h-[500px] rounded-full blur-3xl ${
          isDark ? 'bg-indigo-500/10' : 'bg-indigo-400/15'
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
      
      {/* Tertiary floating orb */}
      <motion.div
        className={`absolute w-[400px] h-[400px] rounded-full blur-3xl ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-400/10'
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
      
      {/* Small accent orbs */}
      <motion.div
        className={`absolute w-[200px] h-[200px] rounded-full blur-2xl ${
          isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'
        }`}
        style={{ top: '60%', right: '20%' }}
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
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
            ? 'bg-gradient-radial from-transparent via-transparent to-slate-900/50' 
            : 'bg-gradient-radial from-transparent via-transparent to-background/30'
        }`}
      />
    </div>
  );
}

export default AnimatedBackground;
