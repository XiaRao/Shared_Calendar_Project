import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { PageHeader, PageContainer } from './Layout';
import { BottomSheet, FAB } from './BottomSheet';
import { useApp } from '../context/AppContext';
import { type CalendarEvent, type UserColorKey, colorThemes } from '../data/calendarData';

// ============ 工具函数 ============
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, days: number): Date {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeek(d: Date): Date {
  const nd = new Date(d);
  const day = nd.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 周一开始
  nd.setDate(nd.getDate() + diff);
  return nd;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

// ============ 颜色选择器 ============
function ColorPicker({ value, onChange }: { value: UserColorKey; onChange: (c: UserColorKey) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colorThemes.map((theme) => {
        const active = value === theme.id;
        const style: React.CSSProperties = {
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}88)`,
        };
        return (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className="relative w-9 h-9 rounded-full transition-all hover:scale-105"
            style={style}
            title={theme.name}
          >
            {active && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LucideIcons.Check size={14} className="text-white drop-shadow" strokeWidth={3} />
              </div>
            )}
            {active && <div className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-ink-400" />}
          </button>
        );
      })}
    </div>
  );
}

// ============ 事件表单组件 ============
interface EventFormProps {
  event?: CalendarEvent;
  onSave: (data: Partial<CalendarEvent>) => void;
  onDelete?: () => void;
  defaultDate?: string;
}

function EventForm({ event, onSave, onDelete, defaultDate }: EventFormProps) {
  const { myColor, partnerColor } = useApp();
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || defaultDate || '');
  const [startTime, setStartTime] = useState(event?.startTime || '09:00');
  const [endTime, setEndTime] = useState(event?.endTime || '10:00');
  const [owner, setOwner] = useState<CalendarEvent['owner']>(event?.owner || 'both');
  const [location, setLocation] = useState(event?.location || '');
  const [category, setCategory] = useState(event?.category || 'other');

  const myTheme = colorThemes.find((t) => t.id === myColor) || colorThemes[0];
  const partnerTheme = colorThemes.find((t) => t.id === partnerColor) || colorThemes[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      date,
      startTime,
      endTime,
      owner,
      location: location.trim(),
      category,
    });
  };

  const getOwnerStyle = (o: string) => {
    if (o === 'both') {
      return { background: `linear-gradient(135deg, ${myTheme.primary}, ${partnerTheme.primary})` };
    }
    return {};
  };

  const categories = [
    { id: 'date', label: '约会', icon: 'Heart' },
    { id: 'chore', label: '家务', icon: 'Home' },
    { id: 'health', label: '健康', icon: 'HeartPulse' },
    { id: 'trip', label: '出行', icon: 'Car' },
    { id: 'shopping', label: '购物', icon: 'ShoppingBag' },
    { id: 'other', label: '其他', icon: 'Calendar' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 items-center">
      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">日程标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：周末的宜家采购"
          className="w-full px-4 py-3 bg-cream-50 border border-ink-100 rounded-xl text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all"
          autoFocus
        />
      </div>

      <div className="w-full grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-2 text-center">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-3 bg-cream-50 border border-ink-100 rounded-xl text-sm text-ink-800 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-2 text-center">开始</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-3 bg-cream-50 border border-ink-100 rounded-xl text-sm text-ink-800 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-2 text-center">结束</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-3 bg-cream-50 border border-ink-100 rounded-xl text-sm text-ink-800 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">归属</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'me', label: '我的' },
            { id: 'partner', label: 'TA 的' },
            { id: 'both', label: '共同' },
          ].map((opt) => {
            const isActive = owner === opt.id;
            const color = opt.id === 'me' ? myTheme.primary : opt.id === 'partner' ? partnerTheme.primary : '';
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOwner(opt.id as CalendarEvent['owner'])}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'text-white shadow-md scale-105' : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
                }`}
                style={isActive ? (opt.id === 'both' ? getOwnerStyle('both') : { background: color }) : {}}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">地点（可选）</label>
        <div className="relative">
          <LucideIcons.MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例如：宜家家居四元桥店"
            className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-ink-100 rounded-xl text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">分类</label>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => {
            const Icon = (LucideIcons as unknown as Record<string, React.FC<{ className?: string }>>)[cat.icon] || LucideIcons.Calendar;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as typeof category)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sage-400 text-white shadow-sm scale-105'
                    : 'bg-cream-100 text-ink-600 hover:bg-cream-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2 w-full">
        {onDelete && event && (
          <button
            type="button"
            onClick={onDelete}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-cream-100 text-terracotta-500 hover:bg-terracotta-100 hover:text-terracotta-600 transition-all flex-shrink-0"
          >
            <LucideIcons.Trash2 className="w-5 h-5" />
          </button>
        )}
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 py-3 rounded-xl bg-sage-400 text-white font-medium shadow-md hover:bg-sage-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: owner === 'both' ? `linear-gradient(135deg, ${myTheme.primary}, ${partnerTheme.primary})` : undefined }}
        >
          {event ? '保存修改' : '添加日程'}
        </button>
      </div>
    </form>
  );
}

// ============ 月视图 ============
function MonthView({ currentDate, events, myColor, partnerColor, onDateClick }: {
  currentDate: Date;
  events: CalendarEvent[];
  myColor: string;
  partnerColor: string;
  onDateClick: (date: Date) => void;
}) {
  const myTheme = colorThemes.find((t) => t.id === myColor) || colorThemes[0];
  const partnerTheme = colorThemes.find((t) => t.id === partnerColor) || colorThemes[1];

  const monthStart = startOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      arr.push(addDays(gridStart, i));
    }
    return arr;
  }, [gridStart]);

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const getEventsForDay = (d: Date): CalendarEvent[] => {
    const key = formatDate(d);
    return events.filter((e) => e.date === key);
  };

  const getEventBgStyle = (ev: CalendarEvent): React.CSSProperties => {
    if (ev.owner === 'both') {
      return { background: `linear-gradient(90deg, ${myTheme.primary}33 0%, ${partnerTheme.primary}33 100%)` };
    }
    const color = ev.owner === 'me' ? myTheme.primary : partnerTheme.primary;
    return { background: `${color}22`, color };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ink-100/60 p-4 animate-fade-in-up">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium ${i >= 5 ? 'text-ink-400' : 'text-ink-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = day.getMonth() === currentDate.getMonth();
          const today = isToday(day);
          const dayEvents = getEventsForDay(day);
          const hasMyEvent = dayEvents.some((e) => e.owner === 'me' || e.owner === 'both');
          const hasPartnerEvent = dayEvents.some((e) => e.owner === 'partner' || e.owner === 'both');

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`relative aspect-square flex flex-col items-center justify-start pt-1 rounded-xl transition-all
                ${inMonth ? '' : 'opacity-30'}
                ${today ? 'bg-sage-50 ring-1 ring-sage-200' : 'hover:bg-cream-100/50'}
              `}
            >
              <span
                className={`text-sm font-medium ${
                  today ? 'text-sage-600' : inMonth ? 'text-ink-700' : 'text-ink-400'
                }`}
              >
                {day.getDate()}
              </span>

              {/* 事件指示器：颜色小点 */}
              <div className="flex gap-0.5 mt-0.5">
                {hasMyEvent && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: myTheme.primary }}
                  />
                )}
                {hasPartnerEvent && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: partnerTheme.primary }}
                  />
                )}
              </div>

              {/* 最多显示2个事件条 */}
              <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="text-[9px] px-1 py-0.5 rounded-full font-medium truncate"
                    style={getEventBgStyle(ev)}
                  >
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-ink-400 text-center">
                    +{dayEvents.length - 2}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ 周视图时间轴 ============
function WeekView({ currentDate, events, myColor, partnerColor, onEventClick }: {
  currentDate: Date;
  events: CalendarEvent[];
  myColor: string;
  partnerColor: string;
  onEventClick?: (ev: CalendarEvent) => void;
}) {
  const myTheme = colorThemes.find((t) => t.id === myColor) || colorThemes[0];
  const partnerTheme = colorThemes.find((t) => t.id === partnerColor) || colorThemes[1];

  const weekStart = startOfWeek(currentDate);
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7am - 8pm

  const getEventsForDay = (d: Date): CalendarEvent[] => {
    const key = formatDate(d);
    return events.filter((e) => e.date === key);
  };

  const getEventStyle = (ev: CalendarEvent): React.CSSProperties => {
    const [startH, startM] = (ev.startTime || '09:00').split(':').map(Number);
    const [endH, endM] = (ev.endTime || '10:00').split(':').map(Number);
    const startMinutes = (startH - 7) * 60 + startM;
    const endMinutes = (endH - 7) * 60 + endM;
    const top = (startMinutes / 60) * 48; // 每小时 48px
    const height = Math.max(32, ((endMinutes - startMinutes) / 60) * 48 - 2);

    let bg = '';
    let color = '';
    if (ev.owner === 'both') {
      bg = `linear-gradient(90deg, ${myTheme.primary}55, ${partnerTheme.primary}55)`;
      color = '#3D3A35';
    } else {
      const c = ev.owner === 'me' ? myTheme.primary : partnerTheme.primary;
      bg = `${c}22`;
      color = c;
    }

    return {
      top: `${top}px`,
      height: `${height}px`,
      background: bg,
      color,
      borderLeft: `3px solid ${ev.owner === 'both' ? myTheme.primary : ev.owner === 'me' ? myTheme.primary : partnerTheme.primary}`,
    };
  };

  const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ink-100/60 overflow-hidden animate-fade-in-up">
      {/* 星期头 */}
      <div className="grid grid-cols-8 border-b border-ink-100/60">
        <div className="h-12" />
        {weekDays.map((d, i) => {
          const today = isToday(d);
          return (
            <div key={i} className="h-12 flex flex-col items-center justify-center border-l border-ink-100/30">
              <div className={`text-[10px] ${today ? 'text-sage-500' : 'text-ink-400'}`}>
                {weekDayNames[i]}
              </div>
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                  today ? 'bg-sage-400 text-white' : 'text-ink-700'
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* 时间网格 */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="grid grid-cols-8 min-w-[600px]">
          {/* 时间列 */}
          <div className="relative">
            {hours.map((h) => (
              <div key={h} className="h-12 flex items-start justify-end pr-2 pt-0 text-[10px] text-ink-300">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* 每天的格子 */}
          {weekDays.map((d, di) => {
            const dayEvents = getEventsForDay(d);
            return (
              <div key={di} className="relative border-l border-ink-100/30">
                {/* 网格线 */}
                {hours.map((h) => (
                  <div key={h} className="h-12 border-b border-ink-50" />
                ))}

                {/* 事件 */}
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                    className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1 text-[11px] font-medium overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    style={getEventStyle(ev)}
                  >
                    <div className="truncate">{ev.title}</div>
                    <div className="text-[9px] opacity-70">
                      {ev.startTime}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ 日视图（左右双栏） ============
function DayView({ currentDate, events, myColor, partnerColor, onEventClick }: {
  currentDate: Date;
  events: CalendarEvent[];
  myColor: string;
  partnerColor: string;
  onEventClick?: (ev: CalendarEvent) => void;
}) {
  const myTheme = colorThemes.find((t) => t.id === myColor) || colorThemes[0];
  const partnerTheme = colorThemes.find((t) => t.id === partnerColor) || colorThemes[1];

  const dateKey = formatDate(currentDate);
  const dayEvents = events.filter((e) => e.date === dateKey);
  const myEvents = dayEvents.filter((e) => e.owner === 'me' || e.owner === 'both');
  const partnerEvents = dayEvents.filter((e) => e.owner === 'partner' || e.owner === 'both');
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  const getEventStyle = (ev: CalendarEvent, side: 'left' | 'right'): React.CSSProperties => {
    const [startH, startM] = (ev.startTime || '09:00').split(':').map(Number);
    const [endH, endM] = (ev.endTime || '10:00').split(':').map(Number);
    const startMinutes = (startH - 7) * 60 + startM;
    const endMinutes = (endH - 7) * 60 + endM;
    const top = (startMinutes / 60) * 56;
    const height = Math.max(44, ((endMinutes - startMinutes) / 60) * 56 - 2);

    let bg = '';
    let borderColor = '';
    if (ev.owner === 'both') {
      bg = side === 'left'
        ? `linear-gradient(135deg, ${myTheme.primary}22, ${myTheme.primary}11)`
        : `linear-gradient(135deg, ${partnerTheme.primary}22, ${partnerTheme.primary}11)`;
      borderColor = side === 'left' ? myTheme.primary : partnerTheme.primary;
    } else if (ev.owner === 'me') {
      bg = `${myTheme.primary}15`;
      borderColor = myTheme.primary;
    } else {
      bg = `${partnerTheme.primary}15`;
      borderColor = partnerTheme.primary;
    }

    return {
      top: `${top}px`,
      height: `${height}px`,
      background: bg,
      borderLeft: `3px solid ${borderColor}`,
    };
  };

  const getTextColor = (ev: CalendarEvent, side: 'left' | 'right'): string => {
    if (ev.owner === 'both') return side === 'left' ? myTheme.primary : partnerTheme.primary;
    return ev.owner === 'me' ? myTheme.primary : partnerTheme.primary;
  };

  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const EventCard = ({ ev, side }: { ev: CalendarEvent; side: 'left' | 'right' }) => {
    const color = getTextColor(ev, side);
    const isBoth = ev.owner === 'both';
    return (
      <div
        className="absolute left-1 right-1 rounded-xl p-2.5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all active:scale-[0.98]"
        style={getEventStyle(ev, side)}
        onClick={() => onEventClick?.(ev)}
      >
        <div className="text-xs font-semibold text-ink-800 leading-tight truncate">
          {ev.title}
        </div>
        <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color }}>
          <LucideIcons.Clock size={10} />
          {ev.startTime} - {ev.endTime}
        </div>
        {isBoth && (
          <div className="text-[10px] mt-0.5 flex items-center gap-1 text-ink-500">
            <LucideIcons.Users size={10} />
            共同
          </div>
        )}
        {ev.location && !isBoth && (
          <div className="text-[10px] mt-0.5 flex items-center gap-1 text-ink-500 truncate">
            <LucideIcons.MapPin size={10} />
            <span className="truncate">{ev.location}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ink-100/60 overflow-hidden animate-fade-in-up">
      {/* 日标题 */}
      <div className="px-5 py-4 border-b border-ink-100/60">
        <div className="text-xs text-ink-400">{weekdayNames[currentDate.getDay()]}</div>
        <div className="text-2xl font-bold text-ink-800">
          {currentDate.getMonth() + 1} 月 {currentDate.getDate()} 日
        </div>
      </div>

      {/* 双栏头部 */}
      <div className="grid grid-cols-[1fr_auto_1fr] border-b border-ink-100/60">
        {/* 我的 */}
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: myTheme.primary }} />
          <span className="text-sm font-medium text-ink-700">我的日程</span>
          <span className="text-xs text-ink-400">{myEvents.length}</span>
        </div>
        {/* 中间时间分隔 */}
        <div className="w-10 flex items-center justify-center text-xs text-ink-300 font-medium">
          时间
        </div>
        {/* TA 的 */}
        <div className="px-4 py-3 flex items-center justify-end gap-2">
          <span className="text-xs text-ink-400">{partnerEvents.length}</span>
          <span className="text-sm font-medium text-ink-700">TA 的日程</span>
          <div className="w-3 h-3 rounded-full" style={{ background: partnerTheme.primary }} />
        </div>
      </div>

      {/* 双栏时间轴 */}
      <div className="relative grid grid-cols-[1fr_auto_1fr]">
        {/* 左栏 - 我的日程 */}
        <div className="relative border-r border-ink-100/40">
          {hours.map((h) => (
            <div key={`my-${h}`} className="h-14 border-b border-ink-50" />
          ))}
          <div className="absolute top-0 left-0 right-0 bottom-0">
            {myEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} side="left" />
            ))}
          </div>
        </div>

        {/* 中间时间列 */}
        <div className="w-10 flex-shrink-0 bg-cream-50/50 border-x border-ink-100/40">
          {hours.map((h) => (
            <div
              key={h}
              className="h-14 flex items-center justify-center text-[10px] text-ink-400 font-medium border-b border-ink-50"
            >
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* 右栏 - TA 的日程 */}
        <div className="relative border-l border-ink-100/40">
          {hours.map((h) => (
            <div key={`partner-${h}`} className="h-14 border-b border-ink-50" />
          ))}
          <div className="absolute top-0 left-0 right-0 bottom-0">
            {partnerEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} side="right" />
            ))}
          </div>
        </div>
      </div>

      {dayEvents.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cream-100 flex items-center justify-center text-ink-300">
            <LucideIcons.Calendar size={24} />
          </div>
          <p className="text-ink-400 text-sm">今天没有安排</p>
          <p className="text-ink-300 text-xs mt-1">和 TA 一起规划点什么吧</p>
        </div>
      )}
    </div>
  );
}

// ============ 主页面 ============
export function CalendarPage() {
  const { myColor, partnerColor, setMyColor, setPartnerColor, calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useApp();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventSheetOpen(true);
  };

  const openEditEvent = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setEventSheetOpen(true);
  };

  const handleSaveEvent = (data: Partial<CalendarEvent>) => {
    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, data);
    } else {
      addCalendarEvent({
        title: data.title || '新日程',
        date: data.date || formatDate(currentDate),
        startTime: data.startTime || '09:00',
        endTime: data.endTime || '10:00',
        owner: (data.owner as CalendarEvent['owner']) || 'both',
        location: data.location || '',
        category: data.category || 'other',
        notes: (data as { notes?: string; description?: string }).notes || (data as { description?: string }).description || '',
      });
    }
    setEventSheetOpen(false);
  };

  const handleDeleteEvent = () => {
    if (editingEvent) {
      deleteCalendarEvent(editingEvent.id);
      setEventSheetOpen(false);
    }
  };

  const myTheme = colorThemes.find((t) => t.id === myColor) || colorThemes[0];
  const partnerTheme = colorThemes.find((t) => t.id === partnerColor) || colorThemes[1];

  const navigatePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const titleText = viewMode === 'month'
    ? `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`
    : viewMode === 'week'
    ? `${currentDate.getFullYear()}年 第${Math.ceil((currentDate.getDate() + 6 - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7)}周`
    : `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;

  // 统计
  const todayKey = formatDate(new Date());
  const todayEvents = calendarEvents.filter((e) => e.date === todayKey);
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthEventCount = calendarEvents.filter((e) => e.date.startsWith(monthKey)).length;

  return (
    <div className="pb-24 md:pb-12">
      <PageContainer>
        <PageHeader
          title="共享日历"
          subtitle="把两个人的时间，揉成一段共同的记忆"
        />

        {/* 顶部统计 + 色盘 */}
        <div className="mb-5 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div
                className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                style={{ background: myTheme.primary }}
              />
              <div
                className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                style={{ background: partnerTheme.primary }}
              />
            </div>
            <div>
              <div className="text-xs text-ink-400">本月共 {monthEventCount} 个安排</div>
            </div>
          </div>
          <button
            onClick={() => setColorSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-ink-100 text-xs text-ink-500 hover:border-ink-200 transition-all"
          >
            <LucideIcons.Palette size={12} />
            <span>专属色</span>
          </button>
        </div>

        {/* 分段控制器 + 导航 */}
        <div className="mb-4 flex items-center justify-between gap-2 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          {/* 左右导航 */}
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrev}
              className="w-9 h-9 rounded-xl bg-white border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-all"
            >
              <LucideIcons.ChevronLeft size={18} />
            </button>
            <button
              onClick={goToday}
              className="px-3 h-9 rounded-xl bg-white border border-ink-100 flex items-center justify-center text-xs font-medium text-ink-600 hover:bg-cream-100 transition-all"
            >
              今天
            </button>
            <button
              onClick={navigateNext}
              className="w-9 h-9 rounded-xl bg-white border border-ink-100 flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-all"
            >
              <LucideIcons.ChevronRight size={18} />
            </button>
          </div>

          {/* Segmented Control */}
          <div className="flex items-center p-0.5 rounded-xl bg-cream-100/80 border border-ink-100/60">
            {([
              { id: 'month', label: '月' },
              { id: 'week', label: '周' },
              { id: 'day', label: '日' },
            ] as const).map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === v.id
                    ? 'bg-white text-ink-800 shadow-sm'
                    : 'text-ink-400 hover:text-ink-600'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 日期标题 */}
        <div className="mb-4 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-bold text-ink-800">{titleText}</h2>
        </div>

        {/* 视图内容 */}
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={calendarEvents}
            myColor={myColor}
            partnerColor={partnerColor}
            onDateClick={handleDateClick}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={calendarEvents}
            myColor={myColor}
            partnerColor={partnerColor}
            onEventClick={openEditEvent}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            events={calendarEvents}
            myColor={myColor}
            partnerColor={partnerColor}
            onEventClick={openEditEvent}
          />
        )}

        {/* 今日日程小卡（月视图下方） */}
        {viewMode === 'month' && todayEvents.length > 0 && (
          <div className="mt-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink-700">今日安排</h3>
              <button onClick={() => setViewMode('day')} className="text-xs text-sage-500 font-medium">
                查看详情
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {todayEvents.map((ev) => {
                const color = ev.owner === 'me' ? myTheme.primary : ev.owner === 'partner' ? partnerTheme.primary : myTheme.primary;
                const bgStyle: React.CSSProperties = ev.owner === 'both'
                  ? { background: `linear-gradient(90deg, ${myTheme.primary}22, ${partnerTheme.primary}22)` }
                  : { background: `${color}15` };
                return (
                  <div
                    key={ev.id}
                    onClick={() => openEditEvent(ev)}
                    className="flex items-center gap-3 bg-white rounded-xl p-3 border border-ink-100/60 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    style={bgStyle}
                  >
                    <div
                      className="w-1 h-10 rounded-full"
                      style={{ background: color }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink-800">{ev.title}</div>
                      <div className="text-xs text-ink-400 mt-0.5 flex items-center gap-2">
                        <span>{ev.startTime} - {ev.endTime}</span>
                        {ev.location && <span>· {ev.location}</span>}
                      </div>
                    </div>
                    {ev.owner === 'both' && (
                      <div className="flex -space-x-1.5">
                        <div className="w-4 h-4 rounded-full ring-1 ring-white" style={{ background: myTheme.primary }} />
                        <div className="w-4 h-4 rounded-full ring-1 ring-white" style={{ background: partnerTheme.primary }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PageContainer>

      {/* FAB 添加按钮 */}
      <FAB onClick={openAddEvent} label="新建日程" />

      {/* 颜色选择底部抽屉 */}
      <BottomSheet
        open={colorSheetOpen}
        onClose={() => setColorSheetOpen(false)}
        title="选择专属颜色"
        height="md"
      >
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">我的代表色</label>
            <ColorPicker value={myColor} onChange={setMyColor} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-2">TA 的代表色</label>
            <ColorPicker value={partnerColor} onChange={setPartnerColor} />
          </div>

          {/* 预览 */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-ink-100/50">
            <div className="text-xs text-ink-400 mb-3">预览效果</div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm" style={{ background: myTheme.primary }} />
                <div className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm" style={{ background: partnerTheme.primary }} />
              </div>
              <div className="flex-1 text-sm text-ink-600">我们的日历</div>
              <div
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `linear-gradient(90deg, ${myTheme.primary}33, ${partnerTheme.primary}33)`,
                  color: '#3D3A35',
                }}
              >
                共同日程
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* 事件编辑底部抽屉 */}
      <BottomSheet
        open={eventSheetOpen}
        onClose={() => setEventSheetOpen(false)}
        title={editingEvent ? '编辑日程' : '添加日程'}
        height="lg"
      >
        {editingEvent === null ? (
          <EventForm
            onSave={handleSaveEvent}
            defaultDate={formatDate(currentDate)}
          />
        ) : (
          <EventForm
            event={editingEvent}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            defaultDate={formatDate(currentDate)}
          />
        )}
      </BottomSheet>
    </div>
  );
}
