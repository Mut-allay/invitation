import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { Button } from './button';
import { useTheme } from '@/contexts/theme-hooks';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110 ripple"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <SunIcon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'light'
              ? 'rotate-0 scale-100 text-amber-500'
              : 'rotate-90 scale-0 text-slate-400'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'dark'
              ? 'rotate-0 scale-100 text-blue-400'
              : '-rotate-90 scale-0 text-slate-400'
          }`}
        />
      </div>
    </Button>
  );
};

export default ThemeToggle;
