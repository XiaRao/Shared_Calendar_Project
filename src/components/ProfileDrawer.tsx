import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  X, Copy, LogOut, User, Home, Palette, Check, ChevronRight, Pencil, Sparkles
} from 'lucide-react';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

// 莫兰迪色盘 - 用于用户头像专属色
const themeColorOptions = [
  { value: '#85A17B', name: '鼠尾草绿' },
  { value: '#C47260', name: '陶土红' },
  { value: '#E3A832', name: '蜂蜜黄' },
  { value: '#9575B4', name: '薰衣草' },
  { value: '#7E929E', name: '迷雾蓝' },
  { value: '#B08968', name: '焦糖棕' },
];

// 颜色分类色盘（保留原有功能）
const colorThemeOptions = [
  { value: 'sage', label: '鼠尾草绿', bg: 'bg-sage-400' },
  { value: 'terracotta', label: '陶土红', bg: 'bg-terracotta-400' },
  { value: 'honey', label: '蜂蜜黄', bg: 'bg-honey-400' },
  { value: 'lavender', label: '薰衣草', bg: 'bg-lavender-400' },
  { value: 'mist', label: '迷雾蓝', bg: 'bg-mist-400' },
];

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { profile, household, signOut, updateColorTheme, updateProfile, joinHousehold, hexColor } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [toast, setToast] = useState('');
  const [mounted, setMounted] = useState(false);

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 打开抽屉时初始化编辑值
  useEffect(() => {
    if (open && profile) {
      setEditName(profile.display_name || '');
      setSelectedColor(profile.theme_color || themeColorOptions[0].value);
      setIsEditing(false);
    }
  }, [open, profile]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleCopyInviteCode = async () => {
    if (!profile?.household_id) return;
    try {
      await navigator.clipboard.writeText(profile.household_id);
      setCopied(true);
      showToast('邀请码已复制');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  const handleChangeColorTheme = async (color: string) => {
    try {
      await updateColorTheme(color);
      showToast('主题色已更新');
    } catch (err: any) {
      showToast(err.message || '更新失败');
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !selectedColor) return;
    setSaving(true);
    try {
      await updateProfile({
        display_name: editName.trim(),
        theme_color: selectedColor,
      });
      setIsEditing(false);
      showToast('资料已保存');
    } catch (err: any) {
      showToast(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) return;
    try {
      await joinHousehold(joinCode.trim());
      showToast('加入成功！');
      setShowJoinInput(false);
      setJoinCode('');
    } catch (err: any) {
      showToast(err.message || '加入失败');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!mounted) return null;
  if (!open) return null;

  const initial = profile?.display_name?.charAt(0).toUpperCase() || '?';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-ink-800/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 抽屉 */}
      <div className="relative w-[85%] max-w-sm h-full bg-cream-50 shadow-2xl animate-[slideInRight_0.3s_ease-out] overflow-y-auto">
        {/* 顶部 */}
        <div className="sticky top-0 z-10 bg-cream-50/80 backdrop-blur-lg px-5 pt-12 pb-4 flex items-center justify-between border-b border-ink-100">
          <h2 className="text-lg font-semibold text-ink-800">个人中心</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-ink-500 hover:text-ink-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* 用户信息卡片（可编辑） */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink-100">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-semibold shadow-md flex-shrink-0 transition-colors duration-300"
                style={{ backgroundColor: isEditing ? selectedColor : (profile?.theme_color || themeColorOptions[0].value) }}
              >
                {isEditing ? (editName.trim().charAt(0).toUpperCase() || initial) : initial}
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="输入你的昵称"
                    maxLength={20}
                    className="w-full text-lg font-semibold text-ink-800 bg-transparent border-0 border-b-2 border-sage-400 focus:outline-none pb-1 placeholder:text-ink-300"
                  />
                ) : (
                  <h3 className="font-semibold text-ink-800 text-lg truncate">
                    {profile?.display_name || '未命名'}
                  </h3>
                )}
                <p className="text-sm text-ink-500 truncate">
                  {profile?.id ? `ID: ${profile.id.slice(0, 8)}...` : ''}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-ink-500 hover:text-sage-600 hover:bg-sage-50 transition-colors flex-shrink-0"
                  title="编辑资料"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 专属色盘（编辑模式显示） */}
            {isEditing && (
              <div className="mb-4">
                <p className="text-xs text-ink-500 mb-2.5">选择你的专属色</p>
                <div className="flex gap-3 flex-wrap">
                  {themeColorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className="relative w-10 h-10 rounded-full transition-transform hover:scale-110 active:scale-95"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-ink-800/60 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 保存/取消按钮（编辑模式） */}
            {isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(profile?.display_name || '');
                    setSelectedColor(profile?.theme_color || themeColorOptions[0].value);
                  }}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-cream-100 text-ink-700 text-sm font-medium hover:bg-cream-200 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !editName.trim() || !selectedColor}
                  style={{ backgroundColor: hexColor }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      保存
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 共享空间 */}
          {profile?.household_id && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-sage-500" />
                <span className="text-sm font-medium text-ink-700">共享空间</span>
              </div>
              <p className="text-ink-800 font-medium mb-3">{household?.name || '我们的小窝'}</p>

              {/* 邀请码 */}
              <div className="bg-cream-100 rounded-xl p-3 mb-3">
                <p className="text-xs text-ink-500 mb-1.5">邀请码</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-ink-700 truncate">
                    {profile.household_id}
                  </code>
                  <button
                    onClick={handleCopyInviteCode}
                    style={copied ? { backgroundColor: hexColor } : {}}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      copied
                        ? 'text-white'
                        : 'bg-white text-ink-500 hover:bg-cream-100'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-ink-400">把邀请码发给伴侣，TA 就可以加入你们的空间</p>
            </div>
          )}

          {/* 加入其他空间入口 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-ink-100">
            <button
              onClick={() => setShowJoinInput(!showJoinInput)}
              className="w-full p-4 flex items-center gap-3 hover:bg-cream-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-mist-100 flex items-center justify-center">
                <User className="w-5 h-5 text-mist-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-700">加入其他空间</p>
                <p className="text-xs text-ink-400">切换到另一个共享空间</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-ink-300 transition-transform ${showJoinInput ? 'rotate-90' : ''}`} />
            </button>

            {showJoinInput && (
              <div className="px-4 pb-4 space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="输入邀请码..."
                  className="w-full px-3 py-2.5 rounded-lg bg-cream-50 border border-ink-100 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-sage-400 font-mono"
                />
                <button
                  onClick={handleJoinHousehold}
                  disabled={!joinCode.trim()}
                  style={{ backgroundColor: hexColor }}
                  className="w-full py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  确认加入
                </button>
              </div>
            )}
          </div>

          {/* 主题颜色（颜色主题，保留原有功能） */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink-100">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-honey-500" />
              <span className="text-sm font-medium text-ink-700">主色调</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {colorThemeOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleChangeColorTheme(color.value)}
                  className="relative group"
                  title={color.label}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${color.bg} transition-transform hover:scale-110 active:scale-95 ${
                      profile?.color_theme === color.value
                        ? 'ring-2 ring-offset-2 ring-ink-800/60'
                        : ''
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 退出登录 */}
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-2xl bg-white border border-terracotta-200 text-terracotta-500 font-medium hover:bg-terracotta-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>

          <div className="h-8" />
        </div>

        {/* Toast 提示 */}
        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-ink-800/90 text-white text-sm shadow-lg animate-[fadeInUp_0.3s_ease-out] z-50">
            {toast}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
