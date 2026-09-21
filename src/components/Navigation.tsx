import React from 'react';
import { Home, CheckSquare, Calendar, Clock } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Profile } from '../context/AuthContext';

export type TabType = 'hub' | 'checkin' | 'calendar' | 'timeline';

interface NavigationProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

// 底部 Tab 导航（移动端）
export function BottomNav({ activeTab, onChange }: NavigationProps) {
  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'hub', label: '看板', icon: <Home size={20} strokeWidth={1.5} /> },
    { key: 'checkin', label: '打卡', icon: <CheckSquare size={20} strokeWidth={1.5} /> },
    { key: 'calendar', label: '日历', icon: <Calendar size={20} strokeWidth={1.5} /> },
    { key: 'timeline', label: '时间轴', icon: <Clock size={20} strokeWidth={1.5} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* 磨砂玻璃背景 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-ink-100" />
      
      <div className="relative max-w-lg mx-auto px-2">
        <div className="flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200 ${
                  isActive ? 'text-sage-500' : 'text-ink-400'
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// 移动端顶部 Header
interface MobileHeaderProps {
  householdName?: string;
  daysTogether?: number;
  profiles: Profile[];
  onHouseholdClick?: () => void;
  onProfileClick?: () => void;
}

export function MobileHeader({
  householdName = '我们的小窝',
  daysTogether = 0,
  profiles = [],
  onHouseholdClick,
  onProfileClick,
}: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40">
      {/* 磨砂玻璃背景 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-ink-100" />
      
      <div className="relative h-14 px-4 flex items-center justify-between">
        {/* 左侧：小窝入口 */}
        <button
          onClick={onHouseholdClick}
          className="flex items-center gap-2 -ml-1 pl-1 pr-2 py-1.5 rounded-full hover:bg-cream-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center shadow-sm">
            <Home size={16} className="text-white" strokeWidth={2} />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-ink-800 leading-tight">
              {householdName}
            </div>
            <div className="text-[10px] text-ink-400 leading-tight">
              第 {daysTogether} 天
            </div>
          </div>
        </button>

        {/* 右侧：头像组（点击打开个人中心） */}
        {onProfileClick && (
          <button
            onClick={onProfileClick}
            className="flex items-center -mr-1 pr-1 pl-2 py-1.5 rounded-full hover:bg-cream-100 transition-colors"
          >
            <AvatarGroup profiles={profiles} size="sm" />
          </button>
        )}
      </div>
    </header>
  );
}

// 动态头像组：完全由真实 profiles 数据驱动
interface AvatarGroupProps {
  profiles: Profile[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarGroup({ profiles, size = 'md' }: AvatarGroupProps) {
  if (profiles.length === 0) return null;

  // 1 人：居中单头像
  if (profiles.length === 1) {
    return (
      <Avatar
        name={profiles[0].display_name || '?'}
        color={profiles[0].theme_color || '#9ca3af'}
        size={size}
      />
    );
  }

  // 2 人：重叠式双头像
  if (profiles.length >= 2) {
    return (
      <div className="flex items-center">
        {profiles.slice(0, 2).map((p, idx) => (
          <div
            key={p.id}
            style={{ marginLeft: idx > 0 ? '-8px' : 0, zIndex: idx }}
          >
            <Avatar
              name={p.display_name || '?'}
              color={p.theme_color || '#9ca3af'}
              size={size}
            />
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// 顶部导航（桌面端）
interface TopNavProps extends NavigationProps {
  householdName?: string;
  daysTogether?: number;
  profiles: Profile[];
  onHouseholdClick?: () => void;
  onProfileClick?: () => void;
}

export function TopNav({
  activeTab,
  onChange,
  householdName = 'SyncLife',
  daysTogether = 0,
  profiles = [],
  onHouseholdClick,
  onProfileClick,
}: TopNavProps) {
  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'hub', label: '协作看板', icon: <Home size={18} strokeWidth={1.5} /> },
    { key: 'checkin', label: '日常打卡', icon: <CheckSquare size={18} strokeWidth={1.5} /> },
    { key: 'calendar', label: '共享日历', icon: <Calendar size={18} strokeWidth={1.5} /> },
    { key: 'timeline', label: '时间轴', icon: <Clock size={18} strokeWidth={1.5} /> },
  ];

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-40">
      {/* 磨砂玻璃背景 */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-ink-100" />
      
      <div className="relative max-w-4xl mx-auto px-6 h-16 flex items-center justify-between w-full">
        {/* 左侧：小窝信息 */}
        <div className="flex items-center justify-start flex-shrink-0 w-48">
          <button
            onClick={onHouseholdClick}
            className="flex items-center gap-2 -ml-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-cream-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center shadow-sm">
              <Home size={16} className="text-white" strokeWidth={2} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-ink-800 text-base leading-tight block">
                {householdName}
              </span>
              <span className="text-[10px] text-ink-400 leading-tight">
                已相伴 {daysTogether} 天
              </span>
            </div>
          </button>
        </div>

        {/* 中间：Tab 导航 */}
        <nav className="flex-1 flex justify-center">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onChange(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sage-500 text-white shadow-md shadow-sage-500/30'
                      : 'text-ink-500 hover:text-ink-700 hover:bg-cream-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* 右侧：用户头像 */}
        <div className="flex items-center justify-end flex-shrink-0 w-48">
          {onProfileClick && (
            <button
              onClick={onProfileClick}
              className="hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <AvatarGroup profiles={profiles} size="md" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
