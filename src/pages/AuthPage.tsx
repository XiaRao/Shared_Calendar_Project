import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cream-50 flex items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-sage-200 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-52 h-52 bg-terracotta-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-honey-200 rounded-full opacity-20 blur-3xl" />

      {/* Logo 和标题 */}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center shadow-lg shadow-sage-400/30">
            <Heart className="w-8 h-8 text-white fill-white/20" />
          </div>
          <h1 className="text-2xl font-semibold text-ink-800 mb-2">SyncLife</h1>
          <p className="text-ink-500 text-sm">两个人的生活，一起记录</p>
        </div>

        {/* 玻璃质感卡片 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-ink-800/5 border border-white/60">
          {/* Tab 切换 */}
          <div className="flex bg-cream-100 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                mode === 'signin'
                  ? 'bg-white text-sage-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-white text-sage-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm text-ink-600 mb-1.5 ml-1">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm text-ink-600 mb-1.5 ml-1">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20 transition-all text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-terracotta-500 text-sm text-center bg-terracotta-50 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sage-400 to-sage-500 text-white font-medium text-sm shadow-lg shadow-sage-400/30 hover:shadow-xl hover:shadow-sage-400/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'signin' ? '登录' : '创建账户'}
                </>
              )}
            </button>
          </form>

          {/* 底部切换提示 */}
          <p className="text-center text-sm text-ink-500 mt-5">
            {mode === 'signin' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-sage-500 font-medium ml-1 hover:text-sage-600 transition-colors"
            >
              {mode === 'signin' ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-ink-400 mt-6">
          注册即表示同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
