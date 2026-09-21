import React, { useState, useRef, type ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { PageHeader, PageContainer } from './Layout';
import { BottomSheet, FAB } from './BottomSheet';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { memoryTagStyles, type MemoryItem, type MemoryTag } from '../data/mockData';
import { supabase } from '../lib/supabase';

function getIcon(name: string): ComponentType<any> {
  const icons = LucideIcons as unknown as Record<string, ComponentType<any>>;
  return icons[name] || LucideIcons.Heart;
}

// 获取封面图 URL
function getCoverUrl(memory: MemoryItem): string | null {
  if (!memory.image_urls || memory.image_urls.length === 0) return null;
  const idx = memory.cover_image_index ?? 0;
  return memory.image_urls[idx] || memory.image_urls[0] || null;
}

function MemoryCard({ memory, index, onClick }: { memory: MemoryItem; index: number; onClick?: () => void }) {
  const Icon = getIcon(memory.icon);
  const tagStyle = memoryTagStyles[memory.tag] || memoryTagStyles.daily;
  const isLeft = index % 2 === 0;
  const coverUrl = getCoverUrl(memory);

  return (
    <div className="relative flex gap-4 animate-fade-in-up cursor-pointer" style={{ animationDelay: `${index * 80}ms` }} onClick={onClick}>
      {/* 时间线 - 左侧（桌面） */}
      <div className="hidden md:flex md:w-1/2 md:justify-end md:pr-8">
        {isLeft && (
          <div className="w-full max-w-xs">
            <MemoryCardContent memory={memory} Icon={Icon} tagStyle={tagStyle} align="right" coverUrl={coverUrl} />
          </div>
        )}
      </div>

      {/* 中间圆点 */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-6 z-10">
        <div className="w-4 h-4 rounded-full bg-white border-2 border-sage-300 shadow-sm flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
        </div>
      </div>

      {/* 连线 */}
      <div className="absolute left-[23px] md:left-1/2 md:-translate-x-px top-10 bottom-0 w-0.5 bg-gradient-to-b from-sage-200 via-cream-200 to-transparent" />

      {/* 内容 - 移动端单列 / 桌面端右列 */}
      <div className="flex-1 md:w-1/2 pl-10 md:pl-0">
        <div className="md:hidden">
          <MemoryCardContent memory={memory} Icon={Icon} tagStyle={tagStyle} align="left" coverUrl={coverUrl} />
        </div>
        <div className="hidden md:block">
          {!isLeft && (
            <div className="max-w-xs ml-8">
              <MemoryCardContent memory={memory} Icon={Icon} tagStyle={tagStyle} align="left" coverUrl={coverUrl} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemoryCardContent({ memory, Icon, tagStyle, align, coverUrl, className, ...rest }: React.HTMLAttributes<HTMLDivElement> & {
  memory: MemoryItem;
  Icon: ComponentType<any>;
  tagStyle: { label: string; className: string };
  align: 'left' | 'right';
  coverUrl: string | null;
}) {
  const photoCount = memory.image_urls?.length || 0;

  return (
    <div className={`card-hover bg-white rounded-2xl shadow-sm border border-ink-100/60 overflow-hidden ${className || ''}`} {...rest}>
      {/* 图片区 */}
      {coverUrl ? (
        <div className="relative h-40 overflow-hidden">
          <img
            src={coverUrl}
            alt={memory.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* 多图标记 */}
          {photoCount > 1 && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
              <LucideIcons.Images size={12} strokeWidth={2} />
              <span>{photoCount}</span>
            </div>
          )}

          {/* 日期标签 */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${tagStyle.className} backdrop-blur-sm bg-opacity-90`}>
              {tagStyle.label}
            </span>
          </div>
        </div>
      ) : (
        <div className={`relative h-40 bg-gradient-to-br ${memory.imageGradient} overflow-hidden`}>
          {/* 装饰性光斑 */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/30 blur-xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent" />

          {/* 大图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
              <Icon size={32} strokeWidth={1.5} />
            </div>
          </div>

          {/* 日期标签 */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${tagStyle.className} backdrop-blur-sm bg-opacity-80`}>
              {tagStyle.label}
            </span>
          </div>
        </div>
      )}

      {/* 文字区 */}
      <div className={`p-4 ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <h3 className="text-base font-semibold text-ink-800 mb-1">{memory.title}</h3>
        <div className="text-xs text-ink-400 mb-2">{formatDate(memory.date)}</div>
        {memory.description && (
          <p className="text-sm text-ink-500 leading-relaxed line-clamp-3">
            {memory.description}
          </p>
        )}
      </div>
    </div>
  );
}

// 图片上传组件
// 日期格式化：YYYY-MM-DD → 2024年6月15日
function formatDate(dateStr: string): string {
  if (!dateStr) return '日期待定';
  // 如果已经是中文格式直接返回
  if (dateStr.includes('年')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return dateStr;
  }
}

// 获取今天的 ISO 日期
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ImageUploader({
  images,
  coverIndex,
  onChange,
  onCoverChange,
  onError,
}: {
  images: string[];
  coverIndex: number;
  onChange: (urls: string[]) => void;
  onCoverChange: (idx: number) => void;
  onError?: (msg: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      onError?.('最多只能上传 5 张照片');
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of toUpload) {
        // 1. 前端压缩：最大 1200px，1MB 以内，自动处理 iOS EXIF 旋转
        let compressedFile: File;
        try {
          compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            initialQuality: 0.8,
          });
        } catch (compressErr) {
          // 压缩失败就用原图
          console.warn('图片压缩失败，使用原图:', compressErr);
          compressedFile = file;
        }

        // 2. 生成文件名并上传
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('timeline_photos')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: compressedFile.type || 'image/jpeg',
          });

        if (uploadError) {
          console.error('上传失败:', uploadError);
          throw new Error(uploadError.message || '上传失败');
        }

        const { data: urlData } = supabase.storage
          .from('timeline_photos')
          .getPublicUrl(fileName);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      console.error('上传失败:', err);
      onError?.(err?.message || '图片上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    onChange(newImages);
    // 调整封面索引
    if (idx === coverIndex) {
      onCoverChange(0);
    } else if (idx < coverIndex) {
      onCoverChange(coverIndex - 1);
    }
  };

  const canAdd = images.length < 5;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-ink-700 text-center">回忆照片</div>
      <div className="text-xs text-ink-400 text-center mb-2">
        最多上传 5 张，点击选中的图片设为封面
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {images.map((url, idx) => (
          <div key={idx} className="relative">
            <button
              type="button"
              onClick={() => onCoverChange(idx)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === coverIndex
                  ? 'border-sage-400 ring-2 ring-sage-200 scale-105'
                  : 'border-ink-100 hover:border-ink-200'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
            {/* 删除按钮 */}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink-800/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-terracotta-500 transition-colors"
            >
              <LucideIcons.X size={12} strokeWidth={2.5} />
            </button>
            {/* 封面标记 */}
            {idx === coverIndex && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-sage-500/90 text-white text-[9px] font-medium">
                封面
              </div>
            )}
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-ink-200 bg-cream-50 flex flex-col items-center justify-center text-ink-400 hover:border-sage-300 hover:text-sage-500 hover:bg-sage-50 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-ink-200 border-t-sage-400 rounded-full animate-spin" />
            ) : (
              <>
                <LucideIcons.Plus size={18} strokeWidth={1.5} />
                <span className="text-[9px] mt-0.5">{images.length}/5</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

// 添加/编辑记忆表单
function MemoryForm({ memory, onSubmit, onCancel, onDelete, onUploadError }: {
  memory?: MemoryItem;
  onSubmit: (data: Omit<MemoryItem, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onUploadError?: (msg: string) => void;
}) {
  const { hexColor } = useAuth();
  const [title, setTitle] = useState(memory?.title || '');
  const [description, setDescription] = useState(memory?.description || '');
  const [date, setDate] = useState(memory?.date || '');
  const [tag, setTag] = useState<MemoryTag>(memory?.tag || 'daily');
  const [icon, setIcon] = useState(memory?.icon || 'Heart');
  const [gradient, setGradient] = useState(memory?.imageGradient || 'from-sage-200 via-sage-100 to-cream-100');
  const [imageUrls, setImageUrls] = useState<string[]>(memory?.image_urls || []);
  const [coverIndex, setCoverIndex] = useState<number>(memory?.cover_image_index ?? 0);

  const iconOptions = ['Heart', 'Home', 'Plane', 'Cake', 'Star', 'Coffee', 'Music', 'Camera', 'Gift', 'Flower2'];
  const gradientOptions = [
    'from-sage-200 via-sage-100 to-cream-100',
    'from-terracotta-200 via-honey-100 to-cream-100',
    'from-mist-200 via-mist-100 to-cream-100',
    'from-honey-200 via-honey-100 to-cream-100',
    'from-lavender-200 via-lavender-100 to-cream-100',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: date || '日期待定',
      tag,
      icon,
      imageGradient: gradient,
      image_urls: imageUrls,
      cover_image_index: coverIndex,
    });
  };

  const previewCover = imageUrls.length > 0 ? imageUrls[coverIndex] || null : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
      <div className="w-full">
        <label className="text-sm font-medium text-ink-700 mb-1.5 block text-center">记忆标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给这段回忆起个名字…"
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
          autoFocus
        />
      </div>

      <div className="w-full">
        <label className="text-sm font-medium text-ink-700 mb-1.5 block text-center">日期</label>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={date || ''}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setDate(todayISO())}
            className="px-3 py-3 rounded-xl bg-sage-100 text-sage-600 text-sm font-medium hover:bg-sage-200 transition-all whitespace-nowrap"
          >
            今天
          </button>
        </div>
      </div>

      {/* 图片上传 */}
      <div className="w-full">
        <ImageUploader
          images={imageUrls}
          coverIndex={coverIndex}
          onChange={setImageUrls}
          onCoverChange={setCoverIndex}
          onError={onUploadError}
        />
      </div>

      <div className="w-full">
        <label className="text-sm font-medium text-ink-700 mb-1.5 block text-center">分类</label>
        <div className="flex gap-2 flex-wrap justify-center">
          {(Object.keys(memoryTagStyles) as MemoryTag[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                tag === t
                  ? memoryTagStyles[t].className + ' ring-2 ring-offset-2 ring-sage-300'
                  : 'bg-cream-100 text-ink-500 hover:bg-cream-200'
              }`}
            >
              {memoryTagStyles[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <label className="text-sm font-medium text-ink-700 mb-1.5 block text-center">图标</label>
        <div className="flex gap-2 flex-wrap justify-center">
          {iconOptions.map((ic) => {
            const IconComp = getIcon(ic);
            return (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  icon === ic
                    ? 'bg-sage-100 text-sage-600 ring-2 ring-sage-300'
                    : 'bg-cream-50 text-ink-400 hover:bg-cream-100'
                }`}
              >
                <IconComp size={18} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 仅当没有真实图片时才显示色卡选择 */}
      {imageUrls.length === 0 && (
        <div className="w-full">
          <label className="text-sm font-medium text-ink-700 mb-1.5 block text-center">记忆色卡</label>
          <div className="flex gap-2 justify-center">
            {gradientOptions.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGradient(g)}
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${
                  gradient === g ? 'ring-2 ring-sage-400 ring-offset-2 scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full">
        <label className="text-sm font-medium text-ink-700 mb-1.5 block text-center">详细描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="记录下那些温暖的细节…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-ink-100 text-ink-800 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* 预览卡片 */}
      <div className="pt-2 w-full">
        <div className="text-xs text-ink-400 mb-2 text-center">预览效果</div>
        <div className="max-w-xs mx-auto">
          <MemoryCardContent
            memory={{
              id: 'preview',
              title: title || '记忆标题',
              date: date || '日期待定',
              tag,
              icon,
              description,
              imageGradient: gradient,
              image_urls: imageUrls,
              cover_image_index: coverIndex,
            } as MemoryItem}
            Icon={getIcon(icon)}
            tagStyle={memoryTagStyles[tag]}
            align="left"
            coverUrl={previewCover}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2 w-full">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 py-3 rounded-full bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors"
          >
            删除
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-full bg-cream-200 text-ink-600 font-medium hover:bg-cream-300 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          style={{ backgroundColor: hexColor }}
          className="flex-[2] py-3 rounded-full text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {memory ? '保存修改' : '添加记忆'}
        </button>
      </div>
    </form>
  );
}

export function TimelinePage() {
  const { memories, addMemory, updateMemory, deleteMemory } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);

  // 按年份分组
  const grouped: Record<string, MemoryItem[]> = {};
  memories.forEach((m) => {
    const year = m.date.match(/(\d{4})年/)?.[1] || '未知';
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(m);
  });

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const totalMemories = memories.length;

  const handleAdd = () => {
    setEditingMemory(null);
    setSheetOpen(true);
  };

  const handleEdit = (memory: MemoryItem) => {
    setEditingMemory(memory);
    setSheetOpen(true);
  };

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSubmit = async (data: Omit<MemoryItem, 'id'>) => {
    try {
      if (editingMemory) {
        await updateMemory(editingMemory.id, data);
        showToast('记忆已更新');
      } else {
        await addMemory(data);
        showToast('已添加新记忆');
      }
      setSheetOpen(false);
      setEditingMemory(null);
    } catch (err: any) {
      showToast(err.message || '保存失败，请重试');
    }
  };

  const handleDelete = async () => {
    if (!editingMemory) return;
    if (!window.confirm('确定要删除这段记忆吗？')) return;
    try {
      await deleteMemory(editingMemory.id);
      setSheetOpen(false);
      setEditingMemory(null);
      showToast('已删除');
    } catch (err: any) {
      showToast(err.message || '删除失败');
    }
  };

  return (
    <div className="pb-24 md:pb-12">
      <PageContainer>
        <PageHeader
          title="我们的时间轴"
          subtitle={`${totalMemories} 段回忆，慢慢写满两个人的故事`}
        />

        {/* 年份统计 */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto hide-scrollbar">
          {years.map((year) => (
            <div
              key={year}
              className="flex-shrink-0 px-4 py-2 rounded-2xl bg-white shadow-sm border border-ink-100/60"
            >
              <div className="text-lg font-bold text-ink-800">{year}</div>
              <div className="text-xs text-ink-400">{grouped[year].length} 件事</div>
            </div>
          ))}
          <div className="flex-shrink-0 px-4 py-2 rounded-2xl bg-gradient-to-br from-sage-100 to-cream-100 border border-sage-100">
            <div className="text-sm font-medium text-sage-600">全部</div>
            <div className="text-xs text-sage-400">{totalMemories} 条记忆</div>
          </div>
        </div>
      </PageContainer>

      {/* 时间轴主体 */}
      <PageContainer className="md:px-0">
        <div className="relative md:max-w-3xl md:mx-auto md:px-8">
          <div className="flex flex-col gap-8 pb-8">
            {memories.map((memory, idx) => (
              <MemoryCard key={memory.id} memory={memory} index={idx} onClick={() => handleEdit(memory)} />
            ))}
          </div>

          {/* 起点标记 */}
          <div className="relative flex justify-center pt-4 pb-8">
            <div className="relative z-10 px-4 py-2 rounded-full bg-cream-100 text-xs text-ink-400 font-medium">
              故事的起点
            </div>
          </div>
        </div>
      </PageContainer>

      {/* FAB 添加按钮 */}
      <FAB onClick={handleAdd} label="添加回忆" />

      {/* 添加/编辑抽屉 */}
      <BottomSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditingMemory(null); }} height="lg" title={editingMemory ? '编辑记忆' : '添加新记忆'}>
        <MemoryForm
          memory={editingMemory || undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setSheetOpen(false); setEditingMemory(null); }}
          onDelete={editingMemory ? handleDelete : undefined}
          onUploadError={(msg) => {
            setToast(msg);
            setTimeout(() => setToast(null), 2500);
          }}
        />
      </BottomSheet>

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full bg-ink-800/90 backdrop-blur-sm text-white text-sm font-medium shadow-lg animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}
