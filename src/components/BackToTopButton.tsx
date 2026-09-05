import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibilityAndProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollTop > 240) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', toggleVisibilityAndProgress, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibilityAndProgress);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="btn-back-to-top"
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-[#002147] dark:bg-[#00A3E0] text-white shadow-xl hover:shadow-[#00A3E0]/30 border border-white/20 dark:border-slate-800 cursor-pointer flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-[#00A3E0] backdrop-blur-md"
          aria-label="Volver arriba"
          title={`Volver arriba (${Math.round(scrollProgress)}%)`}
        >
          {/* Circular SVG progress ring */}
          <svg className="w-9 h-9 sm:w-10 sm:h-10 absolute -inset-0.5 transform -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-white/15 dark:stroke-slate-900/20 fill-none"
              strokeWidth="2.5"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-[#00A3E0] dark:stroke-white fill-none transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray="100"
              strokeDashoffset={100 - scrollProgress}
              strokeLinecap="round"
            />
          </svg>

          <ChevronUp className="w-5 h-5 text-white relative z-10 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
