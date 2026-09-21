// Mock 数据与类型定义

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: 'both' | 'me' | 'partner' | 'shared';
  dueDate?: string;
  tags?: string[];
  category?: string;
  column: 'todo' | 'in_progress' | 'done';
}

export type ChoreType = 'solo' | 'shared';

export interface Chore {
  id: string;
  title: string;
  subtitle?: string;
  type: ChoreType; // solo = 单人轮换, shared = 双人共同
  todayAssignee?: 'me' | 'partner'; // 单人类型时：今天轮到谁
  myChecked: boolean;
  partnerChecked: boolean;
  icon: string; // lucide icon name
  accent: 'sage' | 'terracotta' | 'honey' | 'lavender' | 'mist';
}

export type MemoryTag = 'milestone' | 'trip' | 'home' | 'anniversary' | 'daily';

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  description?: string;
  imageGradient: string; // 渐变色占位
  icon: string;
  tag: MemoryTag;
  image_urls?: string[]; // 真实图片 URL 列表（Supabase Storage）
  cover_image_index?: number; // 封面图在 image_urls 中的索引
}

// --- 协作看板数据 ---
export const mockTasks: Task[] = [
  {
    id: 't1',
    title: '对比并选购客厅吸顶灯',
    description: '看了三家，再选选北欧风的木质款',
    status: 'in_progress',
    priority: 'high',
    assignee: 'both',
    dueDate: '本周日',
    tags: ['家居', '装修'],
    column: 'in_progress',
  },
  {
    id: 't2',
    title: '去柜台办理共同开销的联名借记卡',
    description: '记得带身份证和户口本',
    status: 'todo',
    priority: 'medium',
    assignee: 'both',
    dueDate: '下周六',
    tags: ['财务'],
    column: 'todo',
  },
  {
    id: 't3',
    title: '周末的宜家采购清单',
    description: '调味罐、收纳盒、床边地毯',
    status: 'todo',
    priority: 'medium',
    assignee: 'me',
    dueDate: '周六',
    tags: ['购物'],
    column: 'todo',
  },
  {
    id: 't4',
    title: '阳台绿植改造方案',
    description: '柠檬树 + 常春藤 + 小吊椅',
    status: 'in_progress',
    priority: 'low',
    assignee: 'partner',
    tags: ['家居'],
    column: 'in_progress',
  },
  {
    id: 't5',
    title: '预约婚纱照试纱',
    description: '收藏了三家工作室，周末电话问一下档期',
    status: 'done',
    priority: 'high',
    assignee: 'both',
    dueDate: '已完成',
    tags: ['大事'],
    column: 'done',
  },
  {
    id: 't6',
    title: '整理冰箱囤货清单',
    status: 'done',
    priority: 'low',
    assignee: 'me',
    tags: ['日常'],
    column: 'done',
  },
];

// --- 日常打卡数据 ---
export const mockChores: Chore[] = [
  {
    id: 'c1',
    title: '准备今日的双人晚餐',
    subtitle: '一起下厨，今天想吃什么？',
    type: 'shared',
    myChecked: true,
    partnerChecked: false,
    icon: 'ChefHat',
    accent: 'terracotta',
  },
  {
    id: 'c2',
    title: '清理扫地机器人',
    subtitle: '本周轮到 TA 倒尘盒',
    type: 'solo',
    todayAssignee: 'partner',
    myChecked: false,
    partnerChecked: false,
    icon: 'Sparkles',
    accent: 'sage',
  },
  {
    id: 'c3',
    title: '喝够八杯水',
    subtitle: '互相提醒，保持水润',
    type: 'shared',
    myChecked: true,
    partnerChecked: true,
    icon: 'Droplets',
    accent: 'mist',
  },
  {
    id: 'c4',
    title: '遛猫/铲屎',
    subtitle: '今天我负责',
    type: 'solo',
    todayAssignee: 'me',
    myChecked: false,
    partnerChecked: false,
    icon: 'Heart',
    accent: 'honey',
  },
  {
    id: 'c5',
    title: '晨间十分钟拉伸',
    subtitle: '一起做 Yoga 唤醒身体',
    type: 'shared',
    myChecked: false,
    partnerChecked: false,
    icon: 'Sun',
    accent: 'lavender',
  },
  {
    id: 'c6',
    title: '倒垃圾',
    subtitle: '干湿分类别忘了',
    type: 'solo',
    todayAssignee: 'me',
    myChecked: true,
    partnerChecked: false,
    icon: 'Trash2',
    accent: 'sage',
  },
];

// --- 时间轴数据 ---
export const mockMemories: MemoryItem[] = [
  {
    id: 'm1',
    title: '搬进了我们的小家',
    date: '2024年9月15日',
    description: '第一次一起布置客厅到凌晨三点，虽然累但看着满屋子的纸箱觉得特别幸福。',
    imageGradient: 'from-sage-200 via-sage-100 to-cream-100',
    icon: 'Home',
    tag: 'milestone',
  },
  {
    id: 'm2',
    title: '青岛看海之旅',
    date: '2024年10月3日',
    description: '国庆假期去了青岛，在八大关的老别墅门口拍了好多照片。',
    imageGradient: 'from-mist-200 via-mist-100 to-cream-100',
    icon: 'Waves',
    tag: 'trip',
  },
  {
    id: 'm3',
    title: '一起完成的第一顿火锅',
    date: '2024年11月22日',
    description: '外面下着初雪，我们围着桌子吃着自己调的蘸料，暖到心里。',
    imageGradient: 'from-terracotta-200 via-honey-100 to-cream-100',
    icon: 'UtensilsCrossed',
    tag: 'daily',
  },
  {
    id: 'm4',
    title: '阳台花园初步成型',
    date: '2024年12月5日',
    description: '从一颗种子到满阳台的绿色，是我们一起等待了三个月的小奇迹。',
    imageGradient: 'from-sage-300 via-sage-100 to-cream-100',
    icon: 'Flower2',
    tag: 'home',
  },
  {
    id: 'm5',
    title: '在一起三周年',
    date: '2025年1月18日',
    description: '三年了，还是会为你煮的一碗面心动。',
    imageGradient: 'from-terracotta-200 via-lavender-100 to-cream-100',
    icon: 'Heart',
    tag: 'anniversary',
  },
  {
    id: 'm6',
    title: '婚纱照试纱日',
    date: '2025年3月9日',
    description: '你穿着白纱走出来的那一刻，我突然明白"怦然心动"是动词。',
    imageGradient: 'from-lavender-200 via-cream-100 to-honey-100',
    icon: 'Camera',
    tag: 'milestone',
  },
];

// 标签颜色映射
export const tagColors: Record<string, string> = {
  '家居': 'bg-sage-100 text-sage-600',
  '装修': 'bg-terracotta-100 text-terracotta-600',
  '财务': 'bg-honey-100 text-honey-600',
  '购物': 'bg-lavender-100 text-lavender-600',
  '大事': 'bg-terracotta-100 text-terracotta-600',
  '日常': 'bg-mist-100 text-mist-600',
};

// 状态标签样式
export const statusStyles: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: '待推进', className: 'bg-terracotta-50 text-terracotta-500 border-terracotta-100' },
  in_progress: { label: '进行中', className: 'bg-honey-50 text-honey-500 border-honey-100' },
  done: { label: '已完成', className: 'bg-sage-50 text-sage-500 border-sage-100' },
};

// 时间轴标签样式
export const memoryTagStyles: Record<string, { label: string; className: string }> = {
  milestone: { label: '里程碑', className: 'bg-terracotta-50 text-terracotta-500' },
  trip: { label: '旅行', className: 'bg-mist-50 text-mist-500' },
  home: { label: '家', className: 'bg-sage-50 text-sage-500' },
  anniversary: { label: '纪念日', className: 'bg-lavender-50 text-lavender-500' },
  daily: { label: '日常', className: 'bg-honey-50 text-honey-500' },
};

// accent 配色映射（用于打卡卡片图标背景）
export const accentBg: Record<string, string> = {
  sage: 'bg-sage-100 text-sage-500',
  terracotta: 'bg-terracotta-100 text-terracotta-500',
  honey: 'bg-honey-100 text-honey-500',
  lavender: 'bg-lavender-100 text-lavender-500',
  mist: 'bg-mist-100 text-mist-500',
};
