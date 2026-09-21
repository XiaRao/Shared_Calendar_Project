// 日历数据与类型定义

export type UserColorKey = 'sage' | 'terracotta' | 'mist' | 'honey' | 'lavender';

export const USER_COLORS: Record<UserColorKey, { bg: string; text: string; light: string; name: string; solid: string }> = {
  sage: { bg: 'bg-sage-400/20', text: 'text-sage-600', light: 'bg-sage-50', name: '鼠尾草绿', solid: 'bg-sage-400' },
  terracotta: { bg: 'bg-terracotta-400/20', text: 'text-terracotta-600', light: 'bg-terracotta-50', name: '陶土橘', solid: 'bg-terracotta-400' },
  mist: { bg: 'bg-mist-400/20', text: 'text-mist-600', light: 'bg-mist-50', name: '迷雾蓝', solid: 'bg-mist-400' },
  honey: { bg: 'bg-honey-400/20', text: 'text-honey-600', light: 'bg-honey-50', name: '蜂蜜黄', solid: 'bg-honey-400' },
  lavender: { bg: 'bg-lavender-400/20', text: 'text-lavender-600', light: 'bg-lavender-50', name: '薰衣草紫', solid: 'bg-lavender-400' },
};

export type EventOwner = 'me' | 'partner' | 'both';

// 主题颜色数组（带 hex 值，用于内联样式）
export interface ColorTheme {
  id: UserColorKey;
  name: string;
  primary: string;
}

export const colorThemes: ColorTheme[] = [
  { id: 'sage', name: '鼠尾草绿', primary: '#85A17B' },
  { id: 'terracotta', name: '陶土橘', primary: '#C47260' },
  { id: 'mist', name: '迷雾蓝', primary: '#7E929E' },
  { id: 'honey', name: '蜂蜜黄', primary: '#E3A832' },
  { id: 'lavender', name: '薰衣草', primary: '#9575B4' },
];

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  owner: EventOwner;
  category: 'home' | 'date' | 'chore' | 'health' | 'trip' | 'other';
  location?: string;
  notes?: string;
}

// 生成一些 mock 日历数据（基于当前月）
function d(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'e1',
    title: '宜家采购',
    date: d(3),
    startTime: '14:00',
    endTime: '18:00',
    owner: 'both',
    category: 'home',
    location: '宜家四元桥店',
  },
  {
    id: 'e2',
    title: '纪念日晚餐',
    date: d(6),
    startTime: '19:00',
    endTime: '22:00',
    owner: 'both',
    category: 'date',
    location: '牛排家',
  },
  {
    id: 'e3',
    title: '狗狗洗澡',
    date: d(1),
    startTime: '20:00',
    endTime: '21:00',
    owner: 'me',
    category: 'chore',
  },
  {
    id: 'e4',
    title: '瑜伽课',
    date: d(2),
    startTime: '19:30',
    endTime: '20:30',
    owner: 'partner',
    category: 'health',
  },
  {
    id: 'e5',
    title: '晨跑',
    date: d(4),
    startTime: '07:00',
    endTime: '08:00',
    owner: 'both',
    category: 'health',
  },
  {
    id: 'e6',
    title: '取快递',
    date: d(-1),
    startTime: '18:00',
    owner: 'me',
    category: 'chore',
  },
  {
    id: 'e7',
    title: '周末露营准备',
    date: d(9),
    startTime: '10:00',
    endTime: '17:00',
    owner: 'both',
    category: 'trip',
    location: '怀柔露营地',
  },
  {
    id: 'e8',
    title: '发薪日 🎉',
    date: d(8),
    owner: 'both',
    category: 'other',
  },
  {
    id: 'e9',
    title: '还信用卡',
    date: d(5),
    owner: 'me',
    category: 'other',
  },
  {
    id: 'e10',
    title: '朋友来家做客',
    date: d(10),
    startTime: '17:00',
    endTime: '22:00',
    owner: 'partner',
    category: 'other',
  },
];

// 分类标签配色
export const categoryColors: Record<string, { label: string; color: string }> = {
  home: { label: '家居', color: 'sage' },
  date: { label: '约会', color: 'terracotta' },
  chore: { label: '家务', color: 'honey' },
  health: { label: '健康', color: 'mist' },
  trip: { label: '旅行', color: 'lavender' },
  other: { label: '其他', color: 'ink' },
};
