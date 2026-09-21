# AGENTS.md — SyncLife

## 项目概览
**SyncLife** 是一款面向共同生活伴侣/室友的双人协作与生活记录 Web App。
产品理念：温暖、极简、高颜值，拒绝"生活 KPI 化"的冷硬设计。

## 技术栈
- **框架**: React 19 + TypeScript
- **构建**: Vite 8
- **样式**: Tailwind CSS 4.0（纯 CSS 主题变量，无 config 文件）
- **图标**: Lucide React
- **包管理**: pnpm

## 目录结构
```
src/
├── App.tsx                  # 主应用，Tab 切换路由
├── main.tsx                 # 入口文件
├── index.css                # 全局样式 + Tailwind 主题定义
├── context/
│   └── AppContext.tsx       # 全局状态 Context（tasks / chores / events / 颜色主题）
├── data/
│   ├── mockData.ts          # Mock 数据 + 类型定义 + 样式映射
│   └── calendarData.ts      # 日历 Mock 数据 + 颜色主题
└── components/
    ├── Avatar.tsx           # 头像组件（单人/双人，完成态勾选角标）
    ├── Layout.tsx           # 页面容器、Header
    ├── Navigation.tsx       # 底部导航（移动端）+ 顶部导航（桌面端）
    ├── BottomSheet.tsx      # 底部抽屉组件 + FAB 悬浮按钮
    ├── SharedHubPage.tsx    # 协作看板页
    ├── DailyCheckinPage.tsx # 日常打卡页
    ├── CalendarPage.tsx     # 共享日历页（月/周/日三视图）
    └── TimelinePage.tsx     # 里程碑时间轴页
```

## 核心模块说明

### 1. SharedHubPage — 协作看板
- 三列看板布局：待推进 / 进行中 / 已完成
- 移动端：横向滚动三列
- 桌面端：三列等分网格 + 视图切换
- 卡片展示：标签、标题、描述、截止日期、负责人（单人/双人头像）
- 顶部统计卡片：总任务/已完成/共同承担

### 2. DailyCheckinPage — 日常打卡
- 顶部大卡片：今日完成度进度条 + 双人头像
- 两种任务类型：
  - **共同打卡**：两人分别勾选，都完成显示庆祝条
  - **单人轮换**：显示今日轮到谁，单个勾选按钮
- 过滤 Tabs：全部 / 我的 / 共同
- 图标背景色按 accent 分类（sage/terracotta/honey/lavender/mist）

### 3. TimelinePage — 里程碑时间轴
- 竖向时间线布局
- 移动端：单列左对齐
- 桌面端：双列交替（左右交错）
- 卡片结构：渐变图片区（图标居中）+ 标签 + 标题 + 日期 + 描述
- 顶部年份分组统计
- 底部"故事起点"标记

## 设计规范
详见 `DESIGN.md`。核心：
- 主背景：奶油白 `cream-50` (#FDFBF7)
- 主点缀：鼠尾草绿 `sage-400` (#85A17B)
- 暖点缀：陶土红 `terracotta-400` (#C47260)
- 辅助色：迷雾蓝/蜂蜜黄/薰衣草紫
- 字体：苹方/SF Pro 系统字体
- 圆角：大圆角卡片 (2xl/xl)
- 动效：微交互 + 淡入上滑 + 弹跳勾选

## 构建命令
- 开发：`pnpm dev`
- 构建：`pnpm build`
- 部署到静态预览：`pnpm deploy`（构建后自动同步到根目录，供 Python 静态服务器提供）
- Lint：`pnpm lint`
- 预览：`pnpm preview`

## 部署说明（重要）
沙箱 5000 端口由 Python http.server 提供静态文件服务，Vite 开发服务器会被服务监控机制替换。
- **预览方式**：执行 `pnpm deploy`，构建产物自动同步到根目录 `index.html` + `assets/`
- **开发方式**：代码修改后执行 `pnpm deploy` 重新构建部署
- **入口文件**：`index.dev.html` 是 Vite 开发用的源文件，`index.html` 是构建后的部署文件

## 响应式断点
- 移动端：默认（< 768px），底部 Tab 导航
- 桌面端：`md` ≥ 768px，顶部导航栏 + 居中内容区（max-w-3xl）
