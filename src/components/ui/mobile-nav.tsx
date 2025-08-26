import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.mobile-nav') && !target.closest('.mobile-nav-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close nav on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Mobile Nav Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="mobile-nav-toggle lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </Button>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'mobile-nav fixed inset-y-0 left-0 z-50 w-80 max-w-[80vw] bg-white shadow-2xl lg:hidden',
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-slate-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </Button>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
