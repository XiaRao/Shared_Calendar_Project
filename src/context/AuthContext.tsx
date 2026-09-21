import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  household_id: string | null;
  color_theme: string | null;
  theme_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string | null;
  created_at: string;
  anniversary: string | null;
  description: string | null;
  created_by: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  household: Household | null;
  partner: Profile | null;
  householdProfiles: Profile[];
  loading: boolean;
  daysTogether: number;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    lightBg: string;
    gradientFrom: string;
    gradientTo: string;
    shadowColor: string;
    ringColor: string;
  };
  hexColor: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createHousehold: (name?: string) => Promise<string>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateColorTheme: (color: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateThemeColor: (color: string) => Promise<void>;
  updateProfile: (updates: { display_name?: string; theme_color?: string }) => Promise<void>;
  updateHousehold: (updates: Partial<Pick<Household, 'name' | 'anniversary' | 'description'>>) => Promise<void>;
  refreshHousehold: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [householdProfiles, setHouseholdProfiles] = useState<Profile[]>([]);
  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // 颜色主题映射（Tailwind 类名 + hex 值）
  const colorThemeMap: Record<string, {
    bg: string; text: string; border: string; lightBg: string;
    gradientFrom: string; gradientTo: string; shadowColor: string; ringColor: string;
    hex: string;
  }> = {
    sage: {
      bg: 'bg-sage-400', text: 'text-sage-600', border: 'border-sage-400', lightBg: 'bg-sage-50',
      gradientFrom: 'from-sage-400', gradientTo: 'to-sage-500', shadowColor: 'shadow-sage-400/40', ringColor: 'ring-sage-400',
      hex: '#85A17B',
    },
    terracotta: {
      bg: 'bg-terracotta-400', text: 'text-terracotta-500', border: 'border-terracotta-400', lightBg: 'bg-terracotta-50',
      gradientFrom: 'from-terracotta-400', gradientTo: 'to-terracotta-500', shadowColor: 'shadow-terracotta-400/40', ringColor: 'ring-terracotta-400',
      hex: '#C47260',
    },
    mist: {
      bg: 'bg-mist-400', text: 'text-mist-600', border: 'border-mist-400', lightBg: 'bg-mist-50',
      gradientFrom: 'from-mist-400', gradientTo: 'to-mist-500', shadowColor: 'shadow-mist-400/40', ringColor: 'ring-mist-400',
      hex: '#7E929E',
    },
    honey: {
      bg: 'bg-honey-400', text: 'text-honey-600', border: 'border-honey-400', lightBg: 'bg-honey-50',
      gradientFrom: 'from-honey-400', gradientTo: 'to-honey-500', shadowColor: 'shadow-honey-400/40', ringColor: 'ring-honey-400',
      hex: '#E3A832',
    },
    lavender: {
      bg: 'bg-lavender-400', text: 'text-lavender-600', border: 'border-lavender-400', lightBg: 'bg-lavender-50',
      gradientFrom: 'from-lavender-400', gradientTo: 'to-lavender-500', shadowColor: 'shadow-lavender-400/40', ringColor: 'ring-lavender-400',
      hex: '#9575B4',
    },
  };

  const currentColor = profile?.color_theme || 'sage';
  const colorClass = colorThemeMap[currentColor] || colorThemeMap.sage;
  const hexColor = colorClass.hex;

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      setProfile(null);
      setHousehold(null);
      setPartner(null);
      return;
    }

    setProfile(data as Profile);

    if (data.household_id) {
      // 拉取 household 信息
      const { data: householdData } = await supabase
        .from('households')
        .select('*')
        .eq('id', data.household_id)
        .single();
      setHousehold(householdData as Household);

      // 计算在一起的天数（优先用 anniversary，否则用 created_at）
      const dateStr = householdData?.anniversary || householdData?.created_at;
      if (dateStr) {
        const start = new Date(dateStr);
        const today = new Date();
        const diff = Math.floor(
          (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDaysTogether(Math.max(0, diff));
      } else {
        setDaysTogether(0);
      }

      // 拉取同 household 下的所有成员
      const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('household_id', data.household_id)
        .order('created_at', { ascending: true });
      if (members && members.length > 0) {
        setHouseholdProfiles(members as Profile[]);
        // 伴侣：排除当前用户的第一个成员
        const otherMembers = members.filter((m: any) => m.id !== userId);
        setPartner(otherMembers.length > 0 ? (otherMembers[0] as Profile) : null);
      } else {
        setHouseholdProfiles([]);
        setPartner(null);
      }
    } else {
      setHousehold(null);
      setPartner(null);
      setHouseholdProfiles([]);
      setDaysTogether(0);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 监听 auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setHousehold(null);
          setPartner(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const createHousehold = async (name = '我们的小窝') => {
    const { data, error } = await supabase
      .from('households')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    const householdId = (data as Household).id;

    // 更新当前用户的 household_id
    if (user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ household_id: householdId })
        .eq('id', user.id);

      if (updateError) throw updateError;
      await fetchProfile(user.id);
    }

    return householdId;
  };

  const joinHousehold = async (inviteCode: string) => {
    // inviteCode 就是 household_id 的完整 UUID
    const { data, error } = await supabase
      .from('households')
      .select('id')
      .eq('id', inviteCode)
      .single();

    if (error || !data) {
      throw new Error('邀请码无效，请检查后重试');
    }

    if (user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ household_id: (data as Household).id })
        .eq('id', user.id);

      if (updateError) throw updateError;
      await fetchProfile(user.id);
    }
  };

  const updateColorTheme = async (color: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ color_theme: color })
      .eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const updateThemeColor = async (color: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ theme_color: color })
      .eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  // 一次性更新多个 profile 字段，减少多次请求
  const updateProfile = async (updates: { display_name?: string; theme_color?: string }) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const updateHousehold = async (updates: Partial<Pick<Household, 'name' | 'anniversary' | 'description'>>) => {
    if (!household?.id) return;
    const { error, data } = await supabase
      .from('households')
      .update(updates)
      .eq('id', household.id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setHousehold(data as Household);
      // 重新计算天数
      const dateStr = (data as Household).anniversary || (data as Household).created_at;
      if (dateStr) {
        const start = new Date(dateStr);
        const today = new Date();
        const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setDaysTogether(Math.max(0, diff));
      }
    }
  };

  const refreshHousehold = async () => {
    if (!household?.id) return;
    const { data } = await supabase
      .from('households')
      .select('*')
      .eq('id', household.id)
      .single();
    if (data) {
      setHousehold(data as Household);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        household,
        partner,
        householdProfiles,
        daysTogether,
        loading,
        colorClass,
        hexColor,
        signIn,
        signUp,
        signOut,
        createHousehold,
        joinHousehold,
        refreshProfile,
        updateColorTheme,
        updateDisplayName,
        updateThemeColor,
        updateProfile,
        updateHousehold,
        refreshHousehold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
