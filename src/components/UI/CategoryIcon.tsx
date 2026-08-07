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

  if (q.includes('rent') || q.includes('house') || q.includes('home')) return 'home';
  if (q.includes('invest') || q.includes('stock') || q.includes('market') || q.includes('crypto')) return 'trending_up';
  if (q.includes('emi') || q.includes('loan') || q.includes('wallet') || q.includes('credit')) return 'account_balance_wallet';
  if (q.includes('food') || q.includes('dining') || q.includes('restaurant') || q.includes('utensils') || q.includes('eat') || q.includes('snack')) return 'restaurant';
  if (q.includes('grocer') || q.includes('supermarket') || q.includes('mart')) return 'shopping_cart';
  if (q.includes('transport') || q.includes('car') || q.includes('uber') || q.includes('taxi') || q.includes('commute') || q.includes('auto')) return 'directions_car';
  if (q.includes('fuel') || q.includes('gas') || q.includes('petrol')) return 'local_gas_station';
  if (q.includes('shop') || q.includes('store') || q.includes('target') || q.includes('bag') || q.includes('clothes')) return 'shopping_bag';
  if (q.includes('entertain') || q.includes('movie') || q.includes('netflix') || q.includes('film') || q.includes('subscript') || q.includes('tv') || q.includes('media')) return 'subscriptions';
  if (q.includes('bill') || q.includes('utility') || q.includes('electric') || q.includes('power') || q.includes('zap') || q.includes('water')) return 'electric_bolt';
  if (q.includes('health') || q.includes('medical') || q.includes('doctor') || q.includes('pharmacy') || q.includes('medicine')) return 'medical_services';
  if (q.includes('gym') || q.includes('fitness') || q.includes('workout') || q.includes('sport')) return 'fitness_center';
  if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('animal')) return 'pets';
  if (q.includes('game') || q.includes('gaming') || q.includes('playstation') || q.includes('xbox')) return 'sports_esports';
  if (q.includes('travel') || q.includes('flight') || q.includes('plane') || q.includes('hotel') || q.includes('vacation')) return 'flight';
  if (q.includes('educat') || q.includes('school') || q.includes('college') || q.includes('book') || q.includes('course')) return 'school';
  if (q.includes('gift') || q.includes('present') || q.includes('donation') || q.includes('charity')) return 'card_membership';
  if (q.includes('income') || q.includes('salary') || q.includes('deposit') || q.includes('cash') || q.includes('pay')) return 'payments';
  if (q.includes('coffee') || q.includes('starbucks') || q.includes('cafe') || q.includes('tea')) return 'local_cafe';
  if (q.includes('phone') || q.includes('mobile') || q.includes('recharge') || q.includes('data')) return 'smartphone';
  if (q.includes('beauty') || q.includes('salon') || q.includes('spa') || q.includes('makeup')) return 'face';
  if (q.includes('tech') || q.includes('gadget') || q.includes('laptop') || q.includes('computer')) return 'devices';

  return 'category';
};

/* High-contrast, vibrant icon styles matching design theme */
export const getCategoryIconStyle = (categoryName = '') => {
  const q = categoryName.toLowerCase();

  if (q.includes('rent') || q.includes('house') || q.includes('home')) {
    return { bg: 'rgba(20, 184, 166, 0.2)', color: '#14B8A6' };
  }
  if (q.includes('invest') || q.includes('stock')) {
    return { bg: 'rgba(5, 150, 105, 0.2)', color: '#10B981' };
  }
  if (q.includes('grocer') || q.includes('supermarket')) {
    return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10B981' };
  }
  if (q.includes('transport') || q.includes('car') || q.includes('uber') || q.includes('taxi')) {
    return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' };
  }
  if (q.includes('fuel') || q.includes('gas') || q.includes('petrol')) {
    return { bg: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' };
  }
  if (q.includes('shop') || q.includes('store') || q.includes('bag')) {
    return { bg: 'rgba(236, 72, 153, 0.2)', color: '#EC4899' };
  }
  if (q.includes('entertain') || q.includes('movie') || q.includes('film') || q.includes('subscript') || q.includes('tv')) {
    return { bg: 'rgba(139, 92, 246, 0.25)', color: '#C084FC' };
  }
  if (q.includes('bill') || q.includes('utility') || q.includes('electric')) {
    return { bg: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' };
  }
  if (q.includes('health') || q.includes('medical') || q.includes('doctor')) {
    return { bg: 'rgba(244, 63, 94, 0.2)', color: '#F43F5E' };
  }
  if (q.includes('travel') || q.includes('flight') || q.includes('plane')) {
    return { bg: 'rgba(14, 165, 233, 0.2)', color: '#38BDF8' };
  }
  if (q.includes('food') || q.includes('dining') || q.includes('restaurant')) {
    return { bg: 'rgba(249, 115, 22, 0.2)', color: '#F97316' };
  }
  if (q.includes('pet') || q.includes('gym') || q.includes('game') || q.includes('tech')) {
    return { bg: 'rgba(236, 72, 153, 0.2)', color: '#F472B6' };
  }

  return {
    bg: 'rgba(168, 85, 247, 0.2)',
    color: '#C084FC',
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
  const defaultStyle = getCategoryIconStyle(categoryName || name);
  const iconColor = color || defaultStyle.color;

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, color: iconColor, fontVariationSettings: "'FILL' 1" }}
    >
      {materialIcon}
    </span>
  );
};
