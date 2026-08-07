import React from 'react';

export interface CategoryMaterialIconProps {
  name?: string;
  categoryName?: string;
  iconName?: string;
  className?: string;
  size?: number;
  color?: string;
}

export const getCategoryMaterialIcon = (nameName = '', iconName = '') => {
  const q = `${nameName} ${iconName}`.toLowerCase();

  if (q.includes('rent') || q.includes('house') || q.includes('home')) {
    return 'home';
  }
  if (q.includes('invest') || q.includes('stock') || q.includes('market')) {
    return 'trending_up';
  }
  if (q.includes('emi') || q.includes('loan') || q.includes('wallet')) {
    return 'account_balance_wallet';
  }
  if (q.includes('food') || q.includes('dining') || q.includes('restaurant') || q.includes('utensils')) {
    return 'restaurant';
  }
  if (q.includes('grocer') || q.includes('supermarket')) {
    return 'shopping_cart';
  }
  if (q.includes('transport') || q.includes('car') || q.includes('uber') || q.includes('taxi') || q.includes('commute')) {
    return 'directions_car';
  }
  if (q.includes('fuel') || q.includes('gas') || q.includes('petrol')) {
    return 'local_gas_station';
  }
  if (q.includes('shop') || q.includes('store') || q.includes('target') || q.includes('bag')) {
    return 'shopping_bag';
  }
  if (q.includes('entertain') || q.includes('movie') || q.includes('netflix') || q.includes('film')) {
    return 'movie';
  }
  if (q.includes('bill') || q.includes('utility') || q.includes('electric') || q.includes('zap')) {
    return 'electric_bolt';
  }
  if (q.includes('health') || q.includes('medical') || q.includes('doctor')) {
    return 'medical_services';
  }
  if (q.includes('travel') || q.includes('flight') || q.includes('plane')) {
    return 'flight';
  }
  if (q.includes('educat') || q.includes('school') || q.includes('college')) {
    return 'school';
  }
  if (q.includes('gift') || q.includes('present')) {
    return 'card_membership';
  }
  if (q.includes('income') || q.includes('salary') || q.includes('deposit') || q.includes('stripe')) {
    return 'payments';
  }
  if (q.includes('coffee') || q.includes('starbucks')) {
    return 'local_cafe';
  }

  return 'category';
};

/* Subtle, muted icon styles matching user's exact dark mode screenshot */
export const getCategoryIconStyle = (categoryName = '') => {
  const q = categoryName.toLowerCase();

  if (q.includes('rent') || q.includes('house') || q.includes('home') || q.includes('transport') || q.includes('car')) {
    return {
      bg: 'rgba(244, 63, 94, 0.12)', // Subtle Rose tint
      color: '#f43f5e',
    };
  }
  if (q.includes('invest') || q.includes('grocer') || q.includes('income') || q.includes('salary')) {
    return {
      bg: 'rgba(16, 185, 129, 0.12)', // Subtle Emerald tint
      color: '#10b981',
    };
  }
  if (q.includes('emi') || q.includes('food') || q.includes('dining') || q.includes('shopping') || q.includes('wallet')) {
    return {
      bg: 'rgba(99, 102, 241, 0.12)', // Subtle Indigo tint
      color: '#6366f1',
    };
  }

  return {
    bg: 'var(--surface-container-high)',
    color: 'var(--on-surface-variant)',
  };
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'ShoppingCart',
  'Car',
  'Fuel',
  'ShoppingBag',
  'Film',
  'Receipt',
  'Home',
  'HeartPulse',
  'Plane',
  'GraduationCap',
  'TrendingUp',
  'CreditCard',
  'Gift',
  'MoreHorizontal',
  'Zap',
  'Coffee',
  'Tv',
  'Briefcase',
  'Smartphone',
  'Sparkles',
  'DollarSign',
  'Tag',
  'Package',
];

export const CategoryIcon: React.FC<CategoryMaterialIconProps> = ({
  name,
  categoryName,
  iconName,
  className = '',
  size = 24,
  color,
}) => {
  const materialIcon = getCategoryMaterialIcon(categoryName || name, iconName || name);
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, color, fontVariationSettings: "'FILL' 1" }}
    >
      {materialIcon}
    </span>
  );
};
