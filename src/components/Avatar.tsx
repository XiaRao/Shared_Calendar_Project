import type { CSSProperties } from 'react';

// 颜色调整工具函数
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 莫兰迪预设色（variant 兼容模式）
const variantColors: Record<string, string> = {
  me: '#85A17B',
  partner: '#C47260',
  sage: '#85A17B',
  terracotta: '#C47260',
  mist: '#7E929E',
  honey: '#E3A832',
  lavender: '#9575B4',
};

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

interface AvatarProps {
  name?: string;
  color?: string;
  variant?: 'me' | 'partner' | 'sage' | 'terracotta' | 'mist' | 'honey' | 'lavender';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  checked?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Avatar({
  name = '',
  color,
  variant,
  size = 'md',
  checked = false,
  className = '',
  style,
  onClick,
}: AvatarProps) {
  const bgColor = color || (variant ? variantColors[variant] : '#9ca3af');
  const initial = name ? name.charAt(0).toUpperCase() : '';

  const lighter = adjustColor(bgColor, 22);
  const gradient = `linear-gradient(135deg, ${lighter} 0%, ${bgColor} 100%)`;

  return (
    <div className={`relative inline-block ${className}`} onClick={onClick}>
      <div
        className={`${sizeMap[size]} rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm`}
        style={{ background: gradient, letterSpacing: 0, ...style }}
      >
        {initial}
      </div>
      {checked && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white" style={{ background: bgColor }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2.5 h-2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

// 双人头像（重叠）
interface DualAvatarProps {
  myName?: string;
  myColor?: string;
  myVariant?: 'me' | 'partner';
  partnerName?: string;
  partnerColor?: string;
  partnerVariant?: 'me' | 'partner';
  size?: 'sm' | 'md';
  myChecked?: boolean;
  partnerChecked?: boolean;
  className?: string;
}

export function DualAvatar({
  myName = '我',
  myColor,
  myVariant = 'me',
  partnerName = 'TA',
  partnerColor,
  partnerVariant = 'partner',
  size = 'md',
  myChecked = false,
  partnerChecked = false,
  className = '',
}: DualAvatarProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div style={{ zIndex: 2 }}>
        <Avatar
          name={myName}
          color={myColor || variantColors[myVariant]}
          size={size}
          checked={myChecked}
        />
      </div>
      <div className="-ml-2.5" style={{ zIndex: 1 }}>
        <Avatar
          name={partnerName}
          color={partnerColor || variantColors[partnerVariant]}
          size={size}
          checked={partnerChecked}
        />
      </div>
    </div>
  );
}

// 头像组（基于真实 profile 数组）
interface AvatarGroupProps {
  profiles: { display_name?: string | null; name?: string; theme_color?: string | null; color?: string }[];
  size?: 'sm' | 'md';
  max?: number;
  className?: string;
}

export function AvatarGroup({
  profiles,
  size = 'md',
  max = 2,
  className = '',
}: AvatarGroupProps) {
  if (!profiles || profiles.length === 0) return null;

  const display = profiles.slice(0, max);

  if (display.length === 1) {
    const p = display[0];
    return (
      <Avatar
        name={p.display_name || p.name || ''}
        color={p.theme_color || p.color}
        size={size}
        className={className}
      />
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {display.map((p, i) => (
        <div
          key={(p.display_name || p.name || '') + i}
          className={i === 0 ? '' : '-ml-2.5'}
          style={{ zIndex: 10 - i }}
        >
          <Avatar
            name={p.display_name || p.name || ''}
            color={p.theme_color || p.color}
            size={size}
          />
        </div>
      ))}
    </div>
  );
}

// 莫兰迪色盘预设
export const themeColorPalette = [
  { name: '鼠尾草绿', value: '#85A17B' },
  { name: '陶土红', value: '#C47260' },
  { name: '迷雾蓝', value: '#7E929E' },
  { name: '蜂蜜黄', value: '#E3A832' },
  { name: '薰衣草', value: '#9575B4' },
  { name: '雾霾粉', value: '#D4A5A5' },
];
