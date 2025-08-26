import React, { useState } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'bem',
    name: 'Bemba',
    nativeName: 'Ichibemba',
    flag: '🇿🇲'
  },
  {
    code: 'nya',
    name: 'Nyanja',
    nativeName: 'Chichewa',
    flag: '🇿🇲'
  }
];

interface ZambianLanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (languageCode: string) => void;
  className?: string;
}

const ZambianLanguageSelector: React.FC<ZambianLanguageSelectorProps> = ({
  currentLanguage = 'en',
  onLanguageChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange?.(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span>{currentLang.flag}</span>
        <span>{currentLang.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                  currentLanguage === language.code ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                <span>{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZambianLanguageSelector;
