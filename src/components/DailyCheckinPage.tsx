import React, { useState, type ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';
import { PageHeader, PageContainer } from './Layout';
import { DualAvatar } from './Avatar';
import { BottomSheet, FAB } from './BottomSheet';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { accentBg, type Chore } from '../data/mockData';

function getIcon(name: string): ComponentType<any> {
  const icons = LucideIcons as unknown as Record<string, ComponentType<any>>;
  return icons[name] || LucideIcons.Circle;
}

interface ChoreCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  chore: Chore;
  onToggle: (id: string, who: 'me' | 'partner') => void;
  onEdit: (chore: Chore) => void;
  onDelete: (id: string) => void;
  delay?: number;
}

function ChoreCard({ chore, onToggle, onEdit, onDelete, delay = 0, className, ...rest }: ChoreCardProps) {
  const Icon = getIcon(chore.icon);
  const accentClass = accentBg[chore.accent] || accentBg.sage;
  const { myProfile, partnerProfile } = useApp();
  const { hexColor } = useAuth();

  const isShared = chore.type === 'shared';
  const bothDone = chore.myChecked && chore.partnerChecked;
  const myDone = chore.myChecked;
  const partnerDone = chore.partnerChecked;

  const todayIsMe = chore.todayAssignee === 'me';


  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除「${chore.title}」吗？`)) {
      onDelete(chore.id);
    }
  };

  return (
    <div
      className={`card-hover bg-white rounded-2xl p-4 shadow-sm border border-ink-100/60 animate-fade-in-up ${
        bothDone ? 'opacity-80' : ''
      } ${className || ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onEdit(chore)}
      {...rest}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-xl ${accentClass} flex items-center justify-center`}
        >
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3
              className={`text-sm font-semibold ${
                bothDone ? 'text-ink-400 line-through' : 'text-ink-800'
              }`}
            >
              {chore.title}
            </h3>
            {chore.type === 'shared' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender-50 text-lavender-500 font-medium">
                共同
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-mist-50 text-mist-500 font-medium">
                轮换
              </span>
            )}
          </div>
          {chore.subtitle && <p className="text-xs text-ink-500 mb-3">{chore.subtitle}</p>}

          {isShared ? (
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onToggle(chore.id, 'me')}
                style={myDone ? { backgroundColor: `${hexColor}15`, color: hexColor, boxShadow: `inset 0 0 0 1px ${hexColor}40` } : {}}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  myDone
                    ? 'ring-0'
                    : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
                }`}
              >
                {myDone ? (
                  <LucideIcons.Check size={12} strokeWidth={3} />
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-current" />
                )}
                <span>我完成了</span>
              </button>
              <button
                onClick={() => onToggle(chore.id, 'partner')}
                style={partnerDone ? { backgroundColor: `${hexColor}15`, color: hexColor, boxShadow: `inset 0 0 0 1px ${hexColor}40` } : {}}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  partnerDone
                    ? 'ring-0'
                    : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
                }`}
              >
                {partnerDone ? (
                  <LucideIcons.Check size={12} strokeWidth={3} />
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-current" />
                )}
                <span>TA完成了</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-400">今日轮到</span>
                <span
                  className={`text-xs font-medium ${
                    todayIsMe ? 'text-sage-600' : 'text-terracotta-500'
                  }`}
                >
                  {todayIsMe ? '我' : 'TA'}
                </span>
              </div>
              <button
                onClick={() => onToggle(chore.id, todayIsMe ? 'me' : 'partner')}
                style={(todayIsMe ? myDone : partnerDone) ? { backgroundColor: hexColor } : {}}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  todayIsMe ? myDone : partnerDone
                    ? 'text-white shadow-md'
                    : 'bg-cream-200 text-ink-400 hover:bg-cream-300'
                }`}
              >
                {(todayIsMe ? myDone : partnerDone) ? (
                  <LucideIcons.Check size={16} strokeWidth={3} className="animate-check-pop" />
                ) : (
                  <LucideIcons.Circle size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 pt-1">
          <DualAvatar
            size="sm"
            myName={myProfile?.display_name || '我'}
            myColor={myProfile?.theme_color || '#85A17B'}
            partnerName={partnerProfile?.display_name || 'TA'}
            partnerColor={partnerProfile?.theme_color || '#C47260'}
            myChecked={myDone}
            partnerChecked={partnerDone}
          />
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-ink-300 hover:text-terracotta-500 hover:bg-terracotta-50 transition-all opacity-0 group-hover:opacity-100"
            title="删除"
          >
            <LucideIcons.Trash2 size={14} />
          </button>
        </div>
      </div>

      {bothDone && (
        <div className="mt-3 pt-3 border-t border-ink-100/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LucideIcons.Sparkles size={12} className="text-honey-400" />
            <span className="text-xs text-sage-500 font-medium">今天一起完成啦！</span>
          </div>
          <span className="text-xs text-ink-300">100%</span>
        </div>
      )}
    </div>
  );
}

interface ChoreFormProps {
  editingChore?: Chore | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

function ChoreForm({ editingChore, onSubmit, onClose, onDelete }: ChoreFormProps) {
  const { hexColor } = useAuth();
  const [title, setTitle] = useState(editingChore?.title || '');
  const [subtitle, setSubtitle] = useState(editingChore?.subtitle || '');
  const [type, setType] = useState<'solo' | 'shared'>(editingChore?.type || 'shared');
  const [todayAssignee, setTodayAssignee] = useState<'me' | 'partner'>(editingChore?.todayAssignee || 'me');
  const [accent, setAccent] = useState<'sage' | 'terracotta' | 'honey' | 'lavender' | 'mist'>(editingChore?.accent || 'sage');
  const [icon, setIcon] = useState(editingChore?.icon || 'Heart');

  const isEditing = !!editingChore;

  const darkenColor = (hex: string, amount: number = 0.15): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const adj = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
  };


  const iconOptions = [
    { id: 'Heart', label: '生活' },
    { id: 'ChefHat', label: '做饭' },
    { id: 'Sparkles', label: '清洁' },
    { id: 'Droplets', label: '喝水' },
    { id: 'Sun', label: '运动' },
    { id: 'BookOpen', label: '阅读' },
  ];

  const accentOptions = [
    { id: 'sage', color: 'bg-sage-400' },
    { id: 'terracotta', color: 'bg-terracotta-400' },
    { id: 'honey', color: 'bg-honey-400' },
    { id: 'lavender', color: 'bg-lavender-400' },
    { id: 'mist', color: 'bg-mist-400' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      id: editingChore?.id,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      type,
      todayAssignee: type === 'solo' ? todayAssignee : undefined,
      icon,
      accent,
    });
    onClose();
  };

  const handleDelete = () => {
    if (editingChore && onDelete && confirm(`确定要删除「${editingChore.title}」吗？`)) {
      onDelete(editingChore.id);
      onClose();
    }
  };

  const SelectedIcon = getIcon(icon);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
      {/* 预览图标 */}
      <div className="flex items-center gap-3 mb-1 w-full justify-center">
        <div className={`w-14 h-14 rounded-2xl ${accentBg[accent]} flex items-center justify-center`}>
          <SelectedIcon size={24} />
        </div>
        <div className="text-left">
          <div className="text-base font-semibold text-ink-700">{title || '新习惯'}</div>
          <div className="text-xs text-ink-400">{type === 'shared' ? '共同打卡' : '单人轮换'}</div>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl text-terracotta-500 bg-terracotta-50 hover:bg-terracotta-100 transition-all"
            title="删除"
          >
            <LucideIcons.Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-1.5">任务名称</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：一起做晚餐"
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all text-left"
          autoFocus
        />
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-1.5">一句话描述（选填）</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="给这个小习惯加一句注脚"
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all text-left"
        />
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2">类型</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'shared', label: '共同打卡', desc: '两人分别完成' },
            { value: 'solo', label: '单人轮换', desc: '每天一人负责' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value as 'solo' | 'shared')}
              className={`p-3 rounded-xl border text-center transition-all ${
                type === opt.value
                  ? 'bg-sage-50 border-sage-200'
                  : 'bg-white border-ink-100 hover:border-ink-200'
              }`}
            >
              <div className={`text-sm font-medium ${type === opt.value ? 'text-sage-600' : 'text-ink-700'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-ink-400 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {type === 'solo' && (
        <div className="w-full">
          <label className="block text-xs font-medium text-ink-500 mb-2">今天谁来</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'me', label: '今天我来' },
              { value: 'partner', label: '今天 TA 来' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTodayAssignee(opt.value as 'me' | 'partner')}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  todayAssignee === opt.value
                    ? 'bg-sage-50 border-sage-200 text-sage-600'
                    : 'bg-white border-ink-100 text-ink-500 hover:border-ink-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2">图标</label>
        <div className="flex gap-2 flex-wrap justify-center">
          {iconOptions.map((opt) => {
            const Ic = getIcon(opt.id);
            const active = icon === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setIcon(opt.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  active ? `${accentBg[accent]} ring-2 ring-offset-2 ring-ink-300` : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
                }`}
                title={opt.label}
              >
                <Ic size={18} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2">颜色</label>
        <div className="flex gap-2 justify-center">
          {accentOptions.map((opt) => {
            const active = accent === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccent(opt.id as typeof accent)}
                className={`w-8 h-8 rounded-full ${opt.color} transition-all ${
                  active ? 'ring-2 ring-offset-2 ring-ink-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        style={{
          background: `linear-gradient(90deg, ${hexColor} 0%, ${darkenColor(hexColor)} 100%)`,
        }}
        className="w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEditing ? '保存修改' : '添加到今日打卡'}
      </button>
    </form>
  );
}

export function DailyCheckinPage() {
  const { chores, toggleChore, addChore, updateChore, deleteChore, myProfile, partnerProfile } = useApp();
  const { colorClass, hexColor } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'shared'>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const darkenColor = (hex: string, amount: number = 0.15): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const adj = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
  };


  const filteredChores = chores.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mine') return c.todayAssignee === 'me' || c.type === 'shared';
    if (activeFilter === 'shared') return c.type === 'shared';
    return true;
  });

  const totalToday = chores.length;
  const completedBoth = chores.filter((c) => c.myChecked && c.partnerChecked).length;
  const completedMine = chores.filter((c) => c.myChecked).length;
  const progress = totalToday > 0 ? Math.round((completedMine / totalToday) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingChore(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (chore: Chore) => {
    setEditingChore(chore);
    setSheetOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (data.id) {
      updateChore(data.id, data);
    } else {
      addChore(data);
    }
  };

  return (
    <div className="pb-24 md:pb-12 relative">
      <PageContainer>
        <PageHeader
          title="今日打卡"
          subtitle="和 TA 一起，把平凡的日子过成诗"
        />

        {/* 顶部完成度卡片 */}
        <div className="relative mb-6 animate-fade-in-up overflow-hidden rounded-3xl bg-gradient-to-br from-sage-100 via-cream-50 to-terracotta-50 p-6 shadow-sm">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-honey-100/50 blur-xl" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-ink-500 mb-1">今天的小成就</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-ink-800">{completedMine}</span>
                  <span className="text-ink-400 text-sm">/ {totalToday} 项</span>
                </div>
              </div>
              <DualAvatar
                size="md"
                myName={myProfile?.display_name || '我'}
                myColor={myProfile?.theme_color || '#85A17B'}
                partnerName={partnerProfile?.display_name || 'TA'}
                partnerColor={partnerProfile?.theme_color || '#C47260'}
                myChecked={completedMine > 0}
                partnerChecked={completedBoth > 0}
              />
            </div>

            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${hexColor} 0%, ${darkenColor(hexColor)} 100%)`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-500">完成进度 {progress}%</span>
              <span className={`font-medium ${colorClass.text}`}>{completedBoth} 项共同完成</span>
            </div>
          </div>
        </div>

        {/* 过滤 Tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto hide-scrollbar">
          {([
            { id: 'all', label: '全部' },
            { id: 'mine', label: '我的' },
            { id: 'shared', label: '共同' },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === f.id
                  ? 'bg-ink-800 text-cream-50 shadow-sm'
                  : 'bg-white text-ink-500 border border-ink-100 hover:border-ink-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 打卡列表 */}
        <div className="flex flex-col gap-3">
          {filteredChores.map((chore, idx) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              onToggle={toggleChore}
              onEdit={handleOpenEdit}
              onDelete={deleteChore}
              delay={idx * 50}
            />
          ))}
        </div>

        {filteredChores.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream-100 flex items-center justify-center text-ink-300">
              <LucideIcons.Sparkles size={24} />
            </div>
            <p className="text-ink-400 text-sm">今天没有相关任务</p>
          </div>
        )}
      </PageContainer>

      {/* 悬浮添加按钮 */}
      <FAB onClick={handleOpenAdd} label="新打卡" />

      {/* 表单底部抽屉 */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingChore ? '编辑打卡' : '添加新打卡'}
        height="lg"
      >
        <ChoreForm
          editingChore={editingChore}
          onSubmit={handleSubmit}
          onClose={() => setSheetOpen(false)}
          onDelete={deleteChore}
        />
      </BottomSheet>
    </div>
  );
}
