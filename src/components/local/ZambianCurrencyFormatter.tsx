import React from 'react';

interface ZambianCurrencyFormatterProps {
  amount: number;
  showSymbol?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ZambianCurrencyFormatter: React.FC<ZambianCurrencyFormatterProps> = ({
  amount,
  showSymbol = true,
  className = '',
  size = 'md'
}) => {
  const formatCurrency = (value: number): string => {
    // Zambian Kwacha formatting
    const formatter = new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(value);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg font-semibold';
      default:
        return 'text-base';
    }
  };

  const formattedAmount = formatCurrency(amount);
  const displayAmount = showSymbol ? formattedAmount : formattedAmount.replace('ZMW', '').trim();

  return (
    <span className={`${getSizeClasses()} ${className}`}>
      {displayAmount}
    </span>
  );
};

export default ZambianCurrencyFormatter;
