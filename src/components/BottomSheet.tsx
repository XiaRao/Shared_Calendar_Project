import { type ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  height?: 'sm' | 'md' | 'lg';
}

export function BottomSheet({ open, onClose, title, children, height = 'md' }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const heightClasses = {
    sm: 'max-h-[45vh]',
    md: 'max-h-[70vh]',
    lg: 'max-h-[85vh]',
  };

  if (!open || !mounted) return null;

  const sheet = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 弹窗内容 - flex 列布局确保内容区可滚动且整体始终在视口内 */}
      <div
        className={`relative flex flex-col w-full max-w-md ${heightClasses[height]} bg-white rounded-3xl shadow-2xl overflow-hidden animate-modal-pop`}
      >
        {/* 顶部小把手（视觉点缀） */}
        <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-ink-200" />
        </div>

        {/* 标题栏 */}
        <div className="flex-shrink-0 flex items-center justify-center px-5 py-3 border-b border-ink-100 relative">
          <h3 className="text-base font-semibold text-ink-800">{title}</h3>
          <button
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-ink-500 hover:bg-cream-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容区 - flex-1 + min-h-0 确保超出时滚动而非撑破容器 */}
        <div className="flex-1 min-h-0 p-5 overflow-y-auto text-center">{children}</div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-modal-pop {
          animation: modalPop 0.3s cubic-bezier(0.32, 1.28, 0.64, 1);
        }
      `}</style>
    </div>
  );

  // 使用 Portal 渲染到 body 下，确保弹窗层级正确、fixed 定位不受父容器影响
  return createPortal(sheet, document.body);
}

// FAB 悬浮按钮
interface FABProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
}

export function FAB({ onClick, label = '添加', icon }: FABProps) {
  const [mounted, setMounted] = useState(false);
  const { hexColor } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 根据主色调生成稍深的渐变色
  const darkenColor = (hex: string, amount: number = 0.15): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const adj = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
  };

  const button = (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${hexColor} 0%, ${darkenColor(hexColor)} 100%)`,
        boxShadow: `0 10px 30px -8px ${hexColor}66`,
      }}
      className="fixed bottom-24 md:bottom-8 right-5 md:right-8 z-50 w-14 h-14 rounded-full text-white flex items-center justify-center hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-200 ease-out group"
      aria-label={label}
    >
      {icon || (
        <span className="text-2xl font-light leading-none">+</span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );

  // 使用 Portal 渲染到 body 下，彻底脱离任何父级容器，确保 fixed 定位始终相对于视口
  if (!mounted) return null;
  return createPortal(button, document.body);
}
