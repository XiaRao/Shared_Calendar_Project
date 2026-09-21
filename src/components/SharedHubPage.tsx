import React, { useState, useEffect } from 'react';
import { Calendar, MoreHorizontal, Plus, Users, User, UserPlus, Trash2, Edit2, Check } from 'lucide-react';
import { PageHeader, PageContainer } from './Layout';
import { Avatar, DualAvatar } from './Avatar';
import { BottomSheet, FAB } from './BottomSheet';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { tagColors, type Task, type TaskStatus, type TaskPriority } from '../data/mockData';

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: Task;
  delay?: number;
  onEdit?: (task: Task) => void;
  onStatusChange?: (status: TaskStatus) => void;
  onDelete?: (id: string) => void;
}

function TaskCard({ task, delay = 0, onEdit, onStatusChange, onDelete, className, ...rest }: TaskCardProps) {
  const isDone = task.status === 'done';
  const [showMenu, setShowMenu] = useState(false);
  const { myProfile, partnerProfile } = useApp();

  const priorityDots: Record<TaskPriority, string> = {
    high: 'bg-terracotta-400',
    medium: 'bg-honey-400',
    low: 'bg-mist-400',
  };

  return (
    <div
      className={`card-hover bg-white rounded-2xl p-4 shadow-sm border border-ink-100/60 relative cursor-pointer ${
        isDone ? 'opacity-70' : ''
      } animate-fade-in-up ${className || ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onEdit?.(task)}
      {...rest}
    >
      {/* 优先级指示条 */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${priorityDots[task.priority]}`} />

      {/* 顶部：标签 + 更多 */}
      <div className="flex items-start justify-between gap-2 mb-3 pl-2">
        <div className="flex flex-wrap gap-1.5">
          {task.tags?.map((tag) => (
            <span
              key={tag}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                tagColors[tag] || 'bg-cream-200 text-ink-600'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="text-ink-300 hover:text-ink-500 transition-colors -mr-1 -mt-1 p-1"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-7 z-30 bg-white rounded-xl shadow-lg border border-ink-100 py-1 w-32 overflow-hidden">
                <button
                  className="w-full px-3 py-2 text-xs text-left hover:bg-cream-50 text-ink-600 flex items-center gap-2"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.(task);
                  }}
                >
                  <Edit2 size={14} />
                  编辑
                </button>
                {onStatusChange && (
                  <div className="border-t border-ink-100/50 py-1">
                    <div className="px-3 py-1 text-[10px] text-ink-400 font-medium uppercase tracking-wide">
                      移到
                    </div>
                    {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                      <button
                        key={s}
                        className={`w-full px-3 py-1.5 text-xs text-left hover:bg-cream-50 flex items-center gap-2 ${
                          task.status === s ? 'text-sage-500 bg-sage-50/50' : 'text-ink-600'
                        }`}
                        onClick={() => {
                          onStatusChange(s);
                          setShowMenu(false);
                        }}
                      >
                        {task.status === s && <Check size={12} />}
                        <span className={task.status === s ? '' : 'ml-4'}>
                          {s === 'todo' ? '待推进' : s === 'in_progress' ? '进行中' : '已完成'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {onDelete && (
                  <button
                    className="w-full px-3 py-2 text-xs text-left hover:bg-red-50 text-red-500 border-t border-ink-100/50 flex items-center gap-2"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(task.id);
                    }}
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 标题 */}
      <h3
        className={`text-sm font-semibold leading-snug mb-2 pl-2 ${
          isDone ? 'text-ink-400 line-through' : 'text-ink-800'
        }`}
      >
        {task.title}
      </h3>

      {/* 描述 */}
      {task.description && (
        <p className="text-xs text-ink-500 leading-relaxed mb-3 pl-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* 底部：截止时间 + 负责人 */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-ink-100/50 pl-2">
        <div className="flex items-center gap-1.5 text-ink-400">
          <Calendar size={12} />
          <span className="text-[11px]">{task.dueDate || '无期限'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {task.assignee === 'both' ? (
            <DualAvatar
              size="sm"
              myName={myProfile?.display_name || '我'}
              myColor={myProfile?.theme_color || '#85A17B'}
              partnerName={partnerProfile?.display_name || 'TA'}
              partnerColor={partnerProfile?.theme_color || '#C47260'}
            />
          ) : (
            <Avatar
              name={task.assignee === 'me' ? (myProfile?.display_name || '我') : (partnerProfile?.display_name || 'TA')}
              color={task.assignee === 'me' ? (myProfile?.theme_color || '#85A17B') : (partnerProfile?.theme_color || '#C47260')}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TaskColumn({
  status,
  label,
  tasks,
  onAdd,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onAdd?: () => void;
  onEdit?: (task: Task) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  onDelete?: (id: string) => void;
}) {
  const dotColors: Record<TaskStatus, string> = {
    todo: 'bg-terracotta-400',
    in_progress: 'bg-honey-400',
    done: 'bg-sage-400',
  };

  return (
    <div className="flex-shrink-0 w-[78vw] sm:w-72 md:w-80">
      {/* 列标题 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
          <h2 className="text-sm font-semibold text-ink-700">{label}</h2>
          <span className="text-xs text-ink-400 font-medium">{tasks.length}</span>
        </div>
        <button
          className="text-ink-300 hover:text-ink-500 transition-colors"
          onClick={onAdd}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 卡片列表 */}
      <div className="flex flex-col gap-3">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            delay={idx * 60}
            onEdit={onEdit}
            onStatusChange={onStatusChange ? (s) => onStatusChange(task.id, s) : undefined}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-ink-300 text-sm">
            <p>空空如也</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 任务表单（新增/编辑通用）
interface TaskFormProps {
  initialData?: Task | null;
  defaultStatus?: TaskStatus;
  onSubmit: (data: Partial<Task> & { status: TaskStatus }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function TaskForm({ initialData, defaultStatus = 'todo', onSubmit, onDelete, onClose }: TaskFormProps) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assignee, setAssignee] = useState<'me' | 'partner' | 'both' | 'shared'>(initialData?.assignee || 'both');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'medium');
  const [tag, setTag] = useState(initialData?.tags?.[0] || '');
  const { myProfile, partnerProfile } = useApp();
  const { hexColor } = useAuth();

  const darkenColor = (hex: string, amount: number = 0.15): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const adj = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setAssignee(initialData.assignee);
      setDueDate(initialData.dueDate || '');
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setTag(initialData.tags?.[0] || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      assignee,
      dueDate: dueDate || undefined,
      tags: tag ? [tag] : [],
      status,
      priority,
    });
    onClose();
  };

  const tagOptions = ['家居', '购物', '财务', '日常', '大事'];

  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo', label: '待推进', color: 'bg-terracotta-400' },
    { value: 'in_progress', label: '进行中', color: 'bg-honey-400' },
    { value: 'done', label: '已完成', color: 'bg-sage-400' },
  ];

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'high', label: '高', color: 'bg-terracotta-400' },
    { value: 'medium', label: '中', color: 'bg-honey-400' },
    { value: 'low', label: '低', color: 'bg-mist-400' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-1.5 text-center">任务标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="要做什么？"
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all"
          autoFocus
        />
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-1.5 text-center">详情描述（选填）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="补充一些细节..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all resize-none"
        />
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">分配给谁</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'me', label: myProfile?.display_name || '我', icon: User },
            { value: 'partner', label: partnerProfile?.display_name || 'TA', icon: User },
            { value: 'both', label: '共同', icon: UserPlus },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = assignee === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAssignee(opt.value as 'me' | 'partner' | 'both')}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                  active
                    ? 'bg-sage-50 border-sage-200 text-sage-600'
                    : 'bg-white border-ink-100 text-ink-500 hover:border-ink-200'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">状态</label>
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-white border-sage-200 text-ink-700 shadow-sm'
                    : 'bg-cream-50 border-transparent text-ink-500 hover:bg-cream-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.color}`} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-medium text-ink-500 mb-2 text-center">优先级</label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((opt) => {
            const active = priority === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-white border-sage-200 text-ink-700 shadow-sm'
                    : 'bg-cream-50 border-transparent text-ink-500 hover:bg-cream-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1.5 text-center">截止日期</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-ink-100 text-sm text-ink-700 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-500 mb-1.5 text-center">分类标签</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-ink-100 text-sm text-ink-700 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100 transition-all"
          >
            <option value="">无标签</option>
            {tagOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-2 w-full">
        {isEditing && onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="px-4 py-3 rounded-2xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition-all flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-3 rounded-2xl bg-cream-100 text-ink-600 font-semibold text-sm hover:bg-cream-200 transition-all"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          style={{
            background: `linear-gradient(90deg, ${hexColor} 0%, ${darkenColor(hexColor)} 100%)`,
          }}
          className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? '保存修改' : '添加任务'}
        </button>
      </div>
    </form>
  );
}

export function SharedHubPage() {
  const { tasks, addTask, updateTask, updateTaskStatus, deleteTask } = useApp();
  const { colorClass, hexColor } = useAuth();
  const [activeView, setActiveView] = useState<'board' | 'list'>('board');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const todoTasks = tasks.filter((t) => t.column === 'todo');
  const inProgressTasks = tasks.filter((t) => t.column === 'in_progress');
  const doneTasks = tasks.filter((t) => t.column === 'done');

  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const sharedCount = tasks.filter((t) => t.assignee === 'both').length;

  const openAdd = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setSheetOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDefaultStatus(task.status);
    setSheetOpen(true);
  };

  const handleSubmit = (data: Partial<Task> & { status: TaskStatus }) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask({
        title: data.title || '新任务',
        description: data.description || '',
        status: data.status,
        priority: data.priority || 'medium',
        assignee: data.assignee || 'shared',
        dueDate: data.dueDate || '',
        category: data.category || 'general',
      });
    }
  };

  const handleDelete = () => {
    if (editingTask) {
      deleteTask(editingTask.id);
    }
  };

  return (
    <div className="pb-24 md:pb-12 relative">
      <PageContainer>
        <PageHeader
          title="一起的事"
          subtitle={`${inProgressCount} 件正在推进，${doneCount} 件已完成 ✓`}
          rightSlot={
            <button
              onClick={() => openAdd()}
              style={{ backgroundColor: hexColor }}
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-md hover:opacity-90 transition-all md:hidden"
            >
              <Plus size={20} />
            </button>
          }
        />

        {/* 顶部统计卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-ink-100/60">
            <div className="text-2xl font-bold text-ink-800">{tasks.length}</div>
            <div className="text-xs text-ink-400 mt-0.5">总任务</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-ink-100/60">
            <div className={`text-2xl font-bold ${colorClass.text}`}>{doneCount}</div>
            <div className="text-xs text-ink-400 mt-0.5">已完成</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-ink-100/60">
            <div className="flex items-center gap-1">
              <Users size={16} className="text-terracotta-400" />
              <span className="text-2xl font-bold text-ink-800">{sharedCount}</span>
            </div>
            <div className="text-xs text-ink-400 mt-0.5">共同承担</div>
          </div>
        </div>

        {/* 视图切换 - 仅桌面 */}
        <div className="hidden md:flex items-center gap-1 mb-5 bg-cream-100 rounded-full p-1 w-fit">
          {(['board', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeView === v
                  ? 'bg-white text-ink-700 shadow-sm'
                  : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              {v === 'board' ? '看板视图' : '列表视图'}
            </button>
          ))}
        </div>
      </PageContainer>

      {/* 看板式横向滚动 - 移动端 */}
      {activeView === 'board' && (
        <div className="md:hidden overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 px-5 pb-4">
            <TaskColumn
              status="todo"
              label="待推进"
              tasks={todoTasks}
              onAdd={() => openAdd('todo')}
              onEdit={openEdit}
              onStatusChange={updateTaskStatus}
              onDelete={deleteTask}
            />
            <TaskColumn
              status="in_progress"
              label="进行中"
              tasks={inProgressTasks}
              onAdd={() => openAdd('in_progress')}
              onEdit={openEdit}
              onStatusChange={updateTaskStatus}
              onDelete={deleteTask}
            />
            <TaskColumn
              status="done"
              label="已完成"
              tasks={doneTasks}
              onAdd={() => openAdd('done')}
              onEdit={openEdit}
              onStatusChange={updateTaskStatus}
              onDelete={deleteTask}
            />
          </div>
        </div>
      )}

      {/* 桌面端三列网格 */}
      {activeView === 'board' && (
        <div className="hidden md:grid md:grid-cols-3 md:gap-5 md:px-8 md:max-w-5xl md:mx-auto">
          <TaskColumn status="todo" label="待推进" tasks={todoTasks} onAdd={() => openAdd('todo')} onEdit={openEdit} onStatusChange={updateTaskStatus} onDelete={deleteTask} />
          <TaskColumn status="in_progress" label="进行中" tasks={inProgressTasks} onAdd={() => openAdd('in_progress')} onEdit={openEdit} onStatusChange={updateTaskStatus} onDelete={deleteTask} />
          <TaskColumn status="done" label="已完成" tasks={doneTasks} onAdd={() => openAdd('done')} onEdit={openEdit} onStatusChange={updateTaskStatus} onDelete={deleteTask} />
        </div>
      )}

      {/* 悬浮添加按钮 */}
      <FAB onClick={() => openAdd()} label="新任务" />

      {/* 任务底部抽屉（新增/编辑通用） */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingTask ? '编辑任务' : '添加新任务'}
        height="lg"
      >
        <TaskForm
          initialData={editingTask}
          defaultStatus={defaultStatus}
          onSubmit={handleSubmit}
          onDelete={editingTask ? handleDelete : undefined}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}
