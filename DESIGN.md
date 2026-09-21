# DESIGN.md — SyncLife

## 产品定位
双人协作与生活记录 Web App，面向共同生活的伴侣或室友。核心气质：温暖、极简、高颜值，参考苹果原生精致感。

---

## Design Tokens

### 色彩体系（莫兰迪低饱和 + 奶油白基底）

| 类别 | Token | 值 | 用途 |
|------|-------|-----|------|
| 背景主色 | `cream-50` | #FDFBF7 | 页面底色、最浅层级 |
| 背景次色 | `cream-100` | #FAF6EF | 卡片背景、次级区域 |
| 背景三级 | `cream-200` | #F5EFE3 | 分割、输入框底色 |
| 主点缀（鼠尾草绿） | `sage-400` | #85A17B | 主 CTA、完成态、正面情绪 |
| 主点缀深 | `sage-500` | #6A855F | 悬停态、重点文字 |
| 暖点缀（陶土红） | `terracotta-400` | #C47260 | 警示、未完成、热情感 |
| 暖点缀浅 | `terracotta-200` | #E8BBAE | 背景标签、柔和提示 |
| 冷中性（迷雾蓝） | `mist-400` | #7E929E | 次要信息、图标灰蓝 |
| 黄点缀（蜂蜜黄） | `honey-400` | #E3A832 | 高亮、纪念日、温暖 |
| 紫点缀（薰衣草） | `lavender-400` | #9575B4 | 第三状态、柔和分类 |
| 主文字 | `ink-800` | #3D3A35 | 标题、正文 |
| 次文字 | `ink-500` | #8D8880 | 辅助信息、描述 |
| 弱文字 | `ink-400` | #ABA59B | 占位符、时间戳 |
| 分割线 | `ink-200` | #E0DCD2 | 卡片边框、分割线 |

### 字体
- 字体族：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif`
- 字重体系：400（常规）、500（中黑）、600（半粗）、700（粗体）
- 字距：正文 0.01em，标题 0em

### 圆角
- 小卡片/按钮：`rounded-md` (14px)
- 主卡片：`rounded-lg` (20px)
- 大卡片/容器：`rounded-xl` (28px)
- 胶囊/全圆角：`rounded-full`

### 阴影（柔和分层，无硬阴影）
- `shadow-sm`：极浅投影，用于输入框、次级卡片
- `shadow-md`：默认卡片悬浮
- `shadow-lg`：悬浮态、弹层
- `shadow-xl`：模态框、底部面板

### 间距（8px 栅格）
- 页面水平内边距：移动端 `px-5`，桌面端 `px-8`
- 卡片内边距：`p-4` ~ `p-6`
- 元素间距：`gap-3` ~ `gap-6`

---

## 组件规范

### 卡片 Card
- 背景：`bg-white`（纯白，与 cream 底色形成微对比）
- 圆角：`rounded-2xl`
- 阴影：`shadow-sm`，hover 时 `shadow-lg` 并上移 2px
- 边框：可选 `border border-ink-100`（极浅描边增强层次）
- 内边距：`p-5`

### 按钮 Button
- 主按钮：`bg-sage-400 text-white rounded-full px-5 py-2.5 font-medium`
- 次按钮：`bg-cream-200 text-ink-700 rounded-full px-5 py-2.5 font-medium`
- 文字按钮：`text-sage-500 font-medium hover:text-sage-600`
- 禁用态：opacity-50

### 头像 Avatar
- 尺寸：`w-8 h-8`（列表）、`w-10 h-10`（详情）、`w-12 h-12`（大）
- 圆形：`rounded-full`
- 双人头像重叠：第二个 `-ml-2`，`ring-2 ring-white`

### 标签 Badge
- 圆角：`rounded-full`
- 内边距：`px-3 py-1 text-xs font-medium`
- 配色：按状态映射（鼠尾草绿=已完成/进行中，陶土红=待推进，迷雾蓝=待定）

### 底部导航 Bottom Nav
- 高度：移动端 `h-16` + safe-area-inset-bottom
- 背景：`glass-strong`（磨砂玻璃）
- 激活态：`text-sage-500`，未激活：`text-ink-400`
- 图标 + 文字，居中对齐

---

## 交互与动效

### 微交互
- 卡片点击/hover：`translateY(-2px)` + 阴影加深，缓动 `cubic-bezier(0.34, 1.56, 0.64, 1)`
- 打卡成功：弹跳缩放 `checkPop` 动画（0.4s）
- 页面进入：淡入上滑 `fadeInUp`（0.5s）
- 状态切换：颜色过渡 200ms ease

### 手势
- 卡片左右滑动切换状态（后续迭代）
- 下拉刷新（后续迭代）
- 长按呼出操作菜单（后续迭代）

---

## 布局与响应式

### 断点
- 移动端（默认）：< 640px
- 平板：`sm` ≥ 640px
- 桌面：`md` ≥ 768px
- 大屏：`lg` ≥ 1024px

### 容器宽度
- 移动端：全宽 `w-full`，水平 padding 20px
- 平板/桌面：最大宽度 `max-w-2xl`（576px）居中，营造"窄屏阅读感"

### 底部导航
- 移动端：底部固定 Tab Bar（3 个 Tab：看板 / 打卡 / 时间轴）
- 桌面端：顶部导航栏 + 侧边栏或顶部 Tab（居中内容区）

---

## 素材与实现备注

- 头像使用 SVG 占位（柔和渐变色块 + 首字母）
- 时间轴图片使用渐变色块占位 + 主题图标
- 所有图标来自 Lucide React
