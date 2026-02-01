// Reusable Framer Motion animation variants for TeneXA public pages

import { Variants } from 'framer-motion';

// Fade in with upward movement
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

// Fade in from left
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// Fade in from right
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// Scale in
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

// Stagger container for child animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Fast stagger for lists
export const fastStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

// Slow stagger for important elements
export const slowStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Card hover animation
export const cardHover = {
  rest: { 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: { duration: 0.3 }
  }
};

// Button magnetic effect
export const buttonMagnetic = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Glow pulse effect
export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px hsla(160, 84%, 39%, 0.3)',
      '0 0 40px hsla(160, 84%, 39%, 0.5)',
      '0 0 20px hsla(160, 84%, 39%, 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Float animation for decorative elements
export const floatAnimation: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Slide in animations
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// Word stagger for headlines
export const wordStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const wordFadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

// Counter animation helper
export const countUp = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 10
    }
  }
};

// Marquee animation for trust badges
export const marquee = {
  animate: {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 25,
        ease: 'linear'
      }
    }
  }
};

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

// Viewport animation settings
export const viewportOnce = { once: true, margin: '-100px' };
export const viewportAlways = { once: false, margin: '-50px' };

// Transition presets
export const springTransition = { type: 'spring', stiffness: 100, damping: 15 };
export const smoothTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
export const fastTransition = { duration: 0.3, ease: 'easeOut' };

// Hover card with glow
export const glowCard = {
  rest: {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3 }
  },
  hover: {
    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
    y: -5,
    transition: { duration: 0.3 }
  }
};

// Rotate in
export const rotateIn: Variants = {
  initial: { opacity: 0, rotate: -10, scale: 0.9 },
  animate: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Blur fade in
export const blurFadeIn: Variants = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.6 }
  }
};

// Timeline progress
export const timelineProgress: Variants = {
  initial: { scaleY: 0 },
  animate: { 
    scaleY: 1,
    transition: { duration: 1.5, ease: 'easeInOut' }
  }
};
