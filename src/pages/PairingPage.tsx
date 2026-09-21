import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, Link2, ArrowRight, Sparkles, LogOut } from 'lucide-react';

export default function PairingPage() {
  const { profile, createHousehold, joinHousehold, signOut } = useAuth();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [householdName, setHouseholdName] = useState('我们的小窝');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [celebrating, setCelebrating] = useState(false);

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      await createHousehold(householdName || '我们的小窝');
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2500);
    } catch (err: any) {
      setError(err.message || '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setError('');
    setLoading(true);
    try {
      await joinHousehold(inviteCode.trim());
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2500);
    } catch (err: any) {
      setError(err.message || '加入失败，请检查邀请码');
    } finally {
      setLoading(false);
    }
  };

  // 庆祝动画
  if (celebrating) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center animate-[bounce_0.5s_ease-in-out_3]">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center shadow-2xl shadow-sage-400/40">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-ink-800 mb-2">配对成功！</h2>
          <p className="text-ink-500">欢迎来到你们的小窝 🏠</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-cream-50 flex items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-32 left-20 w-40 h-40 bg-sage-200 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-32 right-16 w-56 h-56 bg-terracotta-200 rounded-full opacity-20 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* 顶部欢迎 */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center shadow-lg shadow-sage-400/30">
            <Heart className="w-7 h-7 text-white fill-white/20" />
          </div>
          <h1 className="text-xl font-semibold text-ink-800 mb-2">
            你好，{profile?.display_name || '朋友'}
          </h1>
          <p className="text-ink-500 text-sm">创建或加入一个共享空间，开始记录两个人的生活</p>
        </div>

        {/* 选择模式 */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full p-5 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left border border-ink-100 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sage-200 transition-colors">
                  <Plus className="w-6 h-6 text-sage-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-ink-800 mb-1">创建共享空间</h3>
                  <p className="text-sm text-ink-500">第一次使用？创建一个新的共享空间，然后把邀请码发给你的伴侣</p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-300 group-hover:text-sage-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full p-5 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left border border-ink-100 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-terracotta-100 flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta-200 transition-colors">
                  <Link2 className="w-6 h-6 text-terracotta-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-ink-800 mb-1">加入已有空间</h3>
                  <p className="text-sm text-ink-500">你的伴侣已经创建了空间？输入邀请码加入</p>
                </div>
                <ArrowRight className="w-5 h-5 text-ink-300 group-hover:text-terracotta-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>

            <button
              onClick={signOut}
              className="w-full py-3 text-ink-400 text-sm hover:text-ink-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        )}

        {/* 创建空间 */}
        {mode === 'create' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink-100">
            <button
              onClick={() => setMode('choose')}
              className="text-sm text-ink-500 hover:text-ink-700 mb-4 flex items-center gap-1"
            >
              ← 返回
            </button>
            <h2 className="text-lg font-semibold text-ink-800 mb-1">创建共享空间</h2>
            <p className="text-sm text-ink-500 mb-6">给你们的小窝取个名字吧</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-ink-600 mb-1.5 ml-1">空间名称</label>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="我们的小窝"
                  className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all text-sm text-center"
                />
              </div>

              {error && (
                <div className="text-terracotta-500 text-sm text-center bg-terracotta-50 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sage-400 to-sage-500 text-white font-medium text-sm shadow-lg shadow-sage-400/30 hover:shadow-xl hover:shadow-sage-400/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    创建空间
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 加入空间 */}
        {mode === 'join' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-ink-100">
            <button
              onClick={() => setMode('choose')}
              className="text-sm text-ink-500 hover:text-ink-700 mb-4 flex items-center gap-1"
            >
              ← 返回
            </button>
            <h2 className="text-lg font-semibold text-ink-800 mb-1">加入共享空间</h2>
            <p className="text-sm text-ink-500 mb-6">输入伴侣分享的邀请码</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-ink-600 mb-1.5 ml-1">邀请码</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="粘贴邀请码..."
                  className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-400/20 transition-all text-sm text-center font-mono"
                />
              </div>

              {error && (
                <div className="text-terracotta-500 text-sm text-center bg-terracotta-50 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleJoin}
                disabled={loading || !inviteCode.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-terracotta-400 to-terracotta-500 text-white font-medium text-sm shadow-lg shadow-terracotta-400/30 hover:shadow-xl hover:shadow-terracotta-400/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    加入空间
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
