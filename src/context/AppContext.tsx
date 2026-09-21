import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Task, Chore, MemoryItem } from '../data/mockData';
import type { CalendarEvent, UserColorKey } from '../data/calendarData';

interface AppState {
  tasks: Task[];
  chores: Chore[];
  calendarEvents: CalendarEvent[];
  memories: MemoryItem[];
  myColor: UserColorKey;
  partnerColor: UserColorKey;
  loading: boolean;
  myProfile: { id: string; display_name: string | null; theme_color: string | null } | null;
  partnerProfile: { id: string; display_name: string | null; theme_color: string | null } | null;
}

interface AppContextType extends AppState {
  // 看板任务
  addTask: (task: Omit<Task, 'id' | 'column'> & { status?: Task['status']; priority?: Task['priority'] }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // 打卡习惯
  toggleChore: (id: string, who: 'me' | 'partner') => Promise<void>;
  addChore: (chore: Omit<Chore, 'id' | 'myChecked' | 'partnerChecked'>) => Promise<void>;
  updateChore: (id: string, updates: Partial<Omit<Chore, 'id'>>) => Promise<void>;
  deleteChore: (id: string) => Promise<void>;

  // 日历
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  // 时间轴
  addMemory: (memory: Omit<MemoryItem, 'id'>) => Promise<void>;
  updateMemory: (id: string, updates: Partial<Omit<MemoryItem, 'id'>>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // 主题色
  setMyColor: (color: UserColorKey) => void;
  setPartnerColor: (color: UserColorKey) => void;

  // 刷新数据
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, partner } = useAuth();
  const householdId = profile?.household_id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [myColor, setMyColor] = useState<UserColorKey>('sage');
  const [partnerColor, setPartnerColor] = useState<UserColorKey>('terracotta');
  const [loading, setLoading] = useState(true);

  // --- 数据转换：Supabase 行 → 前端类型 ---

  const mapTask = (row: any): Task => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'] || 'medium',
    assignee: row.assignee || 'both',
    dueDate: row.due_date || undefined,
    tags: row.tag ? [row.tag] : [],
    column: row.status as Task['status'],
  });

  const mapChore = (row: any): Chore => ({
    id: row.id,
    title: row.title,
    subtitle: row.type === 'solo' ? '单人轮换' : '共同打卡',
    type: row.type as 'shared' | 'solo',
    todayAssignee: (row.rotation_assignee === 'me' ? 'me' : 'partner') as 'me' | 'partner',
    myChecked: row.my_done,
    partnerChecked: row.your_done,
    icon: row.icon || 'heart',
    accent: (row.color || 'sage') as Chore['accent'],
  });

  const mapCalendarEvent = (row: any): CalendarEvent => ({
    id: row.id,
    title: row.title,
    date: row.event_date,
    startTime: row.start_time || '09:00',
    endTime: row.end_time || '10:00',
    owner: row.owner as CalendarEvent['owner'],
    category: (row.color_label || 'other') as CalendarEvent['category'],
    location: row.location || '',
    notes: row.description || '',
  });

  const gradientMap: Record<string, string> = {
    sage: 'from-sage-200 via-sage-100 to-cream-100',
    terracotta: 'from-terracotta-200 via-honey-100 to-cream-100',
    honey: 'from-honey-200 via-honey-100 to-cream-100',
    lavender: 'from-lavender-200 via-cream-100 to-honey-100',
    mist: 'from-mist-200 via-mist-100 to-cream-100',
  };

  const mapMemory = (row: any): MemoryItem => ({
    id: row.id,
    title: row.title,
    date: row.memory_date,
    description: row.description || '',
    imageGradient: gradientMap[row.color] || gradientMap.sage,
    icon: row.icon || 'star',
    tag: (row.category || 'milestone') as MemoryItem['tag'],
    image_urls: row.image_urls || [],
    cover_image_index: row.cover_image_index ?? 0,
  });

  // --- 数据加载 ---

  const fetchAll = useCallback(async (hid: string) => {
    setLoading(true);
    try {
      const [tasksRes, choresRes, eventsRes, memoriesRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('household_id', hid).order('created_at', { ascending: false }),
        supabase.from('chores').select('*').eq('household_id', hid).order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*').eq('household_id', hid).order('event_date', { ascending: true }),
        supabase.from('memories').select('*').eq('household_id', hid).order('memory_date', { ascending: false }),
      ]);

      setTasks((tasksRes.data || []).map(mapTask));
      setChores((choresRes.data || []).map(mapChore));
      setCalendarEvents((eventsRes.data || []).map(mapCalendarEvent));
      setMemories((memoriesRes.data || []).map(mapMemory));
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // household 变化时重新加载数据
  useEffect(() => {
    if (householdId) {
      fetchAll(householdId);
    }
  }, [householdId, fetchAll]);

  // 从 profile 同步颜色主题
  useEffect(() => {
    if (profile?.color_theme) {
      setMyColor(profile.color_theme as UserColorKey);
    }
  }, [profile?.color_theme]);

  useEffect(() => {
    if (partner?.color_theme) {
      setPartnerColor(partner.color_theme as UserColorKey);
    } else {
      setPartnerColor('terracotta');
    }
  }, [partner?.color_theme]);

  const refreshAll = useCallback(async () => {
    if (householdId) {
      await fetchAll(householdId);
    }
  }, [householdId, fetchAll]);

  // --- 看板任务 ---

  const addTask = async (taskData: any) => {
    if (!householdId) return;
    const status = taskData.status || 'todo';
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        household_id: householdId,
        title: taskData.title,
        description: taskData.description || null,
        status,
        priority: taskData.priority || 'medium',
        assignee: taskData.assignee || 'both',
        due_date: taskData.dueDate || null,
        tag: taskData.tags?.[0] || null,
        created_by: profile?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) setTasks((prev) => [mapTask(data), ...prev]);
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!householdId) return;
    const supabaseUpdates: any = {};
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description || null;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
    if (updates.assignee !== undefined) supabaseUpdates.assignee = updates.assignee;
    if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate || null;
    if (updates.tags !== undefined) supabaseUpdates.tag = updates.tags?.[0] || null;

    const { data, error } = await supabase
      .from('tasks')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? mapTask(data) : t)));
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await updateTask(id, { status, column: status });
  };

  const deleteTask = async (id: string) => {
    if (!householdId) return;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // --- 打卡习惯 ---

  const toggleChore = async (id: string, who: 'me' | 'partner') => {
    if (!householdId) return;
    const chore = chores.find((c) => c.id === id);
    if (!chore) return;

    const field = who === 'me' ? 'my_done' : 'your_done';
    const currentValue = who === 'me' ? chore.myChecked : chore.partnerChecked;

    const { data, error } = await supabase
      .from('chores')
      .update({ [field]: !currentValue })
      .eq('id', id)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setChores((prev) => prev.map((c) => (c.id === id ? mapChore(data) : c)));
    }
  };

  const addChore = async (choreData: any) => {
    if (!householdId) return;
    const { data, error } = await supabase
      .from('chores')
      .insert({
        household_id: householdId,
        title: choreData.title,
        type: choreData.type || 'shared',
        icon: choreData.icon || 'heart',
        color: choreData.accent || 'sage',
        rotation_assignee: choreData.todayAssignee === 'me' ? 'me' : 'you',
        created_by: profile?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) setChores((prev) => [mapChore(data), ...prev]);
  };

  const updateChore = async (id: string, updates: Partial<Omit<Chore, 'id'>>) => {
    if (!householdId) return;
    const supabaseUpdates: any = {};
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.type !== undefined) supabaseUpdates.type = updates.type;
    if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;
    if (updates.accent !== undefined) supabaseUpdates.color = updates.accent;
    if (updates.todayAssignee !== undefined) {
      supabaseUpdates.rotation_assignee = updates.todayAssignee === 'me' ? 'me' : 'you';
    }

    const { data, error } = await supabase
      .from('chores')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setChores((prev) => prev.map((c) => (c.id === id ? mapChore(data) : c)));
    }
  };

  const deleteChore = async (id: string) => {
    if (!householdId) return;
    const { error } = await supabase
      .from('chores')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    setChores((prev) => prev.filter((c) => c.id !== id));
  };

  // --- 日历 ---

  const addCalendarEvent = async (eventData: any) => {
    if (!householdId) return;
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        household_id: householdId,
        title: eventData.title,
        description: eventData.notes || null,
        event_date: eventData.date,
        start_time: eventData.startTime || null,
        end_time: eventData.endTime || null,
        owner: eventData.owner || 'both',
        color_label: eventData.category || 'other',
        location: eventData.location || null,
        created_by: profile?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) setCalendarEvents((prev) => [...prev, mapCalendarEvent(data)]);
  };

  const updateCalendarEvent = async (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => {
    if (!householdId) return;
    const supabaseUpdates: any = {};
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.notes !== undefined) supabaseUpdates.description = updates.notes || null;
    if (updates.date !== undefined) supabaseUpdates.event_date = updates.date;
    if (updates.startTime !== undefined) supabaseUpdates.start_time = updates.startTime || null;
    if (updates.endTime !== undefined) supabaseUpdates.end_time = updates.endTime || null;
    if (updates.owner !== undefined) supabaseUpdates.owner = updates.owner;
    if (updates.category !== undefined) supabaseUpdates.color_label = updates.category;
    if (updates.location !== undefined) supabaseUpdates.location = updates.location || null;

    const { data, error } = await supabase
      .from('calendar_events')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setCalendarEvents((prev) => prev.map((e) => (e.id === id ? mapCalendarEvent(data) : e)));
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!householdId) return;
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // 辅助：从 gradient 字符串提取主色名
  const extractColorFromGradient = (gradient: string): string => {
    const match = gradient.match(/from-(\w+)-/);
    return match ? match[1] : 'sage';
  };

  // --- 时间轴 ---

  const addMemory = async (memoryData: any) => {
    if (!householdId) {
      console.error('[addMemory] 没有 householdId，无法添加');
      return;
    }
    const insertData = {
      household_id: householdId,
      title: memoryData.title,
      description: memoryData.description || null,
      memory_date: memoryData.date || new Date().toISOString().split('T')[0],
      category: memoryData.tag || 'milestone',
      icon: memoryData.icon || 'star',
      color: extractColorFromGradient(memoryData.imageGradient || 'from-sage-200'),
      created_by: profile?.id || null,
      image_urls: memoryData.image_urls || [],
      cover_image_index: memoryData.cover_image_index ?? 0,
    };
    console.log('[addMemory] 准备插入:', insertData);
    const { data, error } = await supabase
      .from('memories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[addMemory] Supabase 错误:', error);
      throw error;
    }
    console.log('[addMemory] 插入成功:', data);
    if (data) setMemories((prev) => [mapMemory(data), ...prev]);
  };

  const updateMemory = async (id: string, updates: Partial<Omit<MemoryItem, 'id'>>) => {
    if (!householdId) return;
    const supabaseUpdates: any = {};
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description || null;
    if (updates.date !== undefined) supabaseUpdates.memory_date = updates.date;
    if (updates.tag !== undefined) supabaseUpdates.category = updates.tag;
    if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;
    if (updates.imageGradient !== undefined) {
      supabaseUpdates.color = extractColorFromGradient(updates.imageGradient);
    }
    if (updates.image_urls !== undefined) supabaseUpdates.image_urls = updates.image_urls;
    if (updates.cover_image_index !== undefined) supabaseUpdates.cover_image_index = updates.cover_image_index;

    const { data, error } = await supabase
      .from('memories')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('household_id', householdId)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setMemories((prev) => prev.map((m) => (m.id === id ? mapMemory(data) : m)));
    }
  };

  const deleteMemory = async (id: string) => {
    if (!householdId) return;
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  // --- 主题色 ---
  const setMyColorState = (color: UserColorKey) => setMyColor(color);
  const setPartnerColorState = (color: UserColorKey) => setPartnerColor(color);

  return (
    <AppContext.Provider
      value={{
        tasks,
        chores,
        calendarEvents,
        memories,
        myColor,
        partnerColor,
        loading,
        myProfile: profile ? { id: profile.id, display_name: profile.display_name, theme_color: profile.theme_color } : null,
        partnerProfile: partner ? { id: partner.id, display_name: partner.display_name, theme_color: partner.theme_color } : null,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        toggleChore,
        addChore,
        updateChore,
        deleteChore,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addMemory,
        updateMemory,
        deleteMemory,
        setMyColor: setMyColorState,
        setPartnerColor: setPartnerColorState,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
