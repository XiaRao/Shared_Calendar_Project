import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  X, Home, Users, Heart, Settings, Pencil, Check,
  Copy, LogOut, Sparkles
} from 'lucide-react';
import { Avatar } from './Avatar';

interface HouseholdSettingsProps {
  open: boolean;
  onClose: () => void;
}

function formatDateDisplay(dateStr: string | null | undefined): string {
  if (!dateStr) return '未设置';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '未设置';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function toInputDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function HouseholdSettings({ open, onClose }: HouseholdSettingsProps) {
  const { household, householdProfiles, daysTogether, updateHousehold, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);

  // 编辑状态
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAnniversary, setEditAnniversary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && household) {
      setEditName(household.name || '');
      setEditAnniversary(toInputDate(household.anniversary || household.created_at));
      setIsEditingName(false);
    }
  }, [open, household]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      showToast('小窝名称不能为空');
      return;
    }
    setSaving(true);
    try {
      await updateHousehold({ name: editName.trim() });
      setIsEditingName(false);
      showToast('名称已更新');
    } catch (e: any) {
      showToast(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnniversary = async () => {
    if (!editAnniversary) {
      showToast('请选择日期');
      return;
    }
    setSaving(true);
    try {
      await updateHousehold({ anniversary: editAnniversary });
      showToast('纪念日已更新');
    } catch (e: any) {
      showToast(e.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!household?.id) return;
    try {
      await navigator.clipboard.writeText(household.id);
      setCopied(true);
      showToast('邀请码已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  if (!mounted) return null;

  const drawer = (
    <>
      {/* 遮罩 */}
      <div
        className={`fixed inset-0 z-50 bg-ink-900/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 左侧抽屉 */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 顶部 Header */}
        <div className="relative px-5 pt-12 pb-6 bg-gradient-to-br from-sage-100 via-cream-50 to-cream-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-ink-500 hover:bg-white transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-300 to-sage-500 flex items-center justify-center shadow-md">
              <Home size={22} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 text-lg font-semibold text-ink-800 bg-white/80 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-300 min-w-0"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="w-7 h-7 rounded-full bg-sage-400 text-white flex items-center justify-center hover:bg-sage-500 transition-colors disabled:opacity-50"
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-ink-800 truncate">
                    {household?.name || '我们的小窝'}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-600 hover:bg-cream-200 transition-colors flex-shrink-0"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                </div>
              )}
              <div className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                <Sparkles size={12} strokeWidth={2} />
                <span>已相伴 {daysTogether} 天</span>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* 纪念日设置 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <Heart size={16} strokeWidth={1.8} className="text-terracotta-400" />
              <span>纪念日</span>
            </div>
            <div className="bg-cream-50 rounded-2xl p-4 border border-ink-100/50">
              <div className="text-xs text-ink-400 mb-2">从这一天开始计数</div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={editAnniversary}
                  onChange={(e) => setEditAnniversary(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-ink-100 text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSaveAnniversary}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-sage-400 text-white text-sm font-medium hover:bg-sage-500 transition-colors disabled:opacity-50"
                >
                  保存
                </button>
              </div>
              <div className="text-xs text-ink-400 mt-2">
                创建时间：{formatDateDisplay(household?.created_at)}
              </div>
            </div>
          </div>

          {/* 成员列表 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <Users size={16} strokeWidth={1.8} className="text-sage-500" />
              <span>空间成员</span>
              <span className="text-xs text-ink-400 font-normal">({householdProfiles.length} 人)</span>
            </div>
            <div className="bg-cream-50 rounded-2xl border border-ink-100/50 overflow-hidden">
              {householdProfiles.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx !== householdProfiles.length - 1 ? 'border-b border-ink-100/50' : ''
                  }`}
                >
                  <Avatar
                    name={p.display_name || '成员'}
                    color={p.theme_color || '#9ca3af'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-700 truncate">
                      {p.display_name || '未命名成员'}
                      {p.id === profile?.id && (
                        <span className="ml-2 text-xs text-sage-500 font-normal">（我）</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-400">
                      {p.id === household?.created_by ? '空间创建者' : '成员'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 邀请码 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <Settings size={16} strokeWidth={1.8} className="text-mist-400" />
              <span>邀请与分享</span>
            </div>
            <div className="bg-cream-50 rounded-2xl p-4 border border-ink-100/50">
              <div className="text-xs text-ink-400 mb-2">邀请码（即空间 ID）</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-xl bg-white border border-ink-100 text-xs text-ink-600 font-mono truncate">
                  {household?.id || '-'}
                </code>
                <button
                  onClick={handleCopyInviteCode}
                  className="px-3 py-2 rounded-xl bg-sage-100 text-sage-600 text-sm font-medium hover:bg-sage-200 transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <Copy size={14} strokeWidth={2} />
                  )}
                  <span>{copied ? '已复制' : '复制'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部危险操作 */}
        <div className="px-5 py-4 border-t border-ink-100 bg-cream-50/50">
          <button
            className="w-full py-3 rounded-2xl bg-white/60 text-terracotta-400 text-sm font-medium hover:bg-terracotta-50 transition-colors flex items-center justify-center gap-2 border border-terracotta-100"
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span>退出空间</span>
          </button>
          <div className="text-[10px] text-ink-300 text-center mt-2">
            退出后所有共享数据将无法从你的账户访问
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full bg-ink-800/90 backdrop-blur-sm text-white text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );

  return createPortal(drawer, document.body);
}
