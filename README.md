# 📅 中国节假日日历

一款基于 Electron + React + TypeScript 的中国节假日日历桌面应用，集成农历、节气、天气、宜忌、备忘、倒计时、纪念日等实用功能。

![Electron](https://img.shields.io/badge/Electron-33-blue?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ 功能概览

### 📆 日历核心
- **公历+农历双历**：每个日期同时显示公历和农历信息
- **二十四节气**：自动标注节气日期
- **传统节日**：春节、元宵、端午、中秋等农历节日
- **公历节日**：元旦、妇女节、劳动节等
- **法定假日**：假期标注"休"，调休标注"班"，含补班日期提醒
- **日期详情弹窗**：点击日期查看完整信息（黄历、节日介绍、节气等）

### 🌤️ 天气模块
- **自动定位**：浏览器定位 → IP定位（ipapi.co / ip.sb）→ 默认北京
- **当前天气**：温度、体感温度、湿度、风速、天气图标
- **日出日落**：显示当日日出和日落时间
- **24小时温度趋势**：Canvas 绘制温度曲线，**鼠标悬停显示时间、温度、降雨概率**
- **3天天气预报**：今天/明天/后天的最高最低温度和降雨概率

### ⏰ 时辰与宜忌
- **实时时辰**：显示当前传统时辰（子时~亥时）及别名和时间段
- **天干地支**：年柱、月柱、日柱
- **黄历宜忌**：基于天干地支计算的每日宜忌参考
- **五行·冲煞·彭祖百忌**：完整的黄历信息

### 🎯 倒计时提醒
- 自定义倒计时事项（考试、旅行、项目截止等）
- 8种颜色标记
- 实时显示距离目标天数
- 临近提醒颜色变化（≤7天绿色、≤3天黄色、当天红色）

### 📝 生活备忘录
- **日历右键添加备忘**：在任意日期上右键即可添加
- **8种颜色分类**
- **农历重复**：支持按农历日期每年重复（如农历生日提醒）
- 日历格子上显示彩色圆点标记
- 左侧面板显示本月备忘列表

### 💕 纪念日管理
- 支持**公历**和**农历**两种日期模式
- 10种 emoji 图标（🎂💍💕🎓🏠👶🐾🌟🎁🎊）
- 自动计算下次纪念日倒计时和**第N周年**
- 农历纪念日每年自动换算到对应公历日期
- 自定义提醒：提前7天/3天/当天

### 📊 年度概览与统计
- **年度概览**：全年假期分布一览
- **年度统计**：工作日、休息日、假期天数统计

### 📋 报税与考试提醒
- 增值税、企业所得税等报税截止日期提醒
- 注册会计师、法考等考试时间提醒

### 🧮 日期计算器
- 计算两个日期之间的天数差
- 从指定日期加减天数

### 🎨 深色/浅色主题
- 一键切换深色和浅色主题
- 中国风配色方案（朱红、琥珀、松绿、月白）

---

## 🖼️ 界面布局

```
┌──────────────┬──────────────────────┬──────────────┐
│   左侧面板    │      日历主体         │   右侧面板    │
│              │                      │              │
│  🌤 天气模块  │  ◀ 2026年5月 ▶       │  📊 年度概览  │
│  🐍 今年属相  │  日 一 二 三 四 五 六  │  📈 年度统计  │
│  🎉 下一个假期 │  ┌──┬──┬──┬──┬──┬──┬──┐ │  🕐 时辰宜忌  │
│  ⏳ 倒计时    │  │  │  │  │  │  │  │  │ │  💕 纪念日   │
│  📝 本月备忘  │  ├──┼──┼──┼──┼──┼──┼──┤ │  📋 报税提醒  │
│              │  │  │  │  │  │  │  │  │ │  🎓 考试提醒  │
│              │  ├──┼──┼──┼──┼──┼──┼──┤ │  🌍 公历节日  │
│              │  │  │  │  │  │  │  │  │ │  ✨ 传统节日  │
│              │  ├──┼──┼──┼──┼──┼──┼──┤ │  🧮 日期计算  │
│              │  │  │  │  │  │  │  │  │ │              │
│              │  └──┴──┴──┴──┴──┴──┴──┘ │              │
└──────────────┴──────────────────────┴──────────────┘
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9
- **Windows** 系统（Electron 打包仅支持 Windows）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 浏览器开发
npm run dev

# Electron 开发
npm run dev:electron
```

### 构建打包

```bash
# 构建前端
npm run build

# 一键打包（构建 + Electron打包 + 生成ZIP）
node scripts/pack.cjs
```

打包完成后，可执行文件位于：
```
release/win-unpacked/中国节假日日历.exe
```

将 `win-unpacked` 文件夹复制到任意 Windows 电脑，双击 `中国节假日日历.exe` 即可运行，**无需安装 Node.js**。

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Electron 33** | 桌面应用框架，系统托盘，单实例锁 |
| **React 18** | UI 组件化开发 |
| **TypeScript 5.8** | 类型安全 |
| **Vite 6** | 构建工具，快速 HMR |
| **Tailwind CSS 3** | 原子化 CSS 样式 |
| **Zustand** | 轻量状态管理 |
| **Lucide React** | 图标库 |
| **electron-builder** | Electron 打包分发 |

### 项目结构

```
src/
├── components/          # React 组件
│   ├── CalendarGrid.tsx     # 日历网格（右键添加备忘）
│   ├── CalendarNav.tsx      # 月份导航
│   ├── WeatherWidget.tsx    # 天气模块
│   ├── AlmanacWidget.tsx    # 时辰与宜忌
│   ├── CountdownWidget.tsx  # 倒计时提醒
│   ├── AnniversaryWidget.tsx # 纪念日管理
│   ├── AnniversaryEditor.tsx # 纪念日编辑器
│   ├── MemoEditor.tsx       # 备忘录编辑器
│   ├── DateDetailModal.tsx  # 日期详情弹窗
│   ├── DateCalculator.tsx   # 日期计算器
│   ├── YearOverview.tsx     # 年度概览
│   ├── YearStats.tsx        # 年度统计
│   ├── LeftInfoPanel.tsx    # 左侧面板
│   └── RightInfoPanel.tsx   # 右侧面板
├── utils/               # 工具函数
│   ├── lunarCalendar.ts     # 农历计算
│   ├── almanac.ts           # 天干地支、时辰、宜忌
│   ├── weather.ts           # 天气 API（Open-Meteo）
│   ├── holidayData.ts       # 法定假日数据
│   ├── holidayOnline.ts     # 在线假日数据更新
│   ├── solarHolidays.ts     # 公历节日
│   ├── traditionalHolidays.ts # 传统节日
│   ├── financialData.ts     # 报税/考试数据
│   ├── festivalInfo.ts      # 节日详细介绍
│   ├── memoData.ts          # 备忘录数据管理
│   ├── countdownData.ts     # 倒计时数据管理
│   └── anniversaryData.ts   # 纪念日数据管理
├── hooks/               # React Hooks
│   ├── useCalendarStore.ts  # 日历状态
│   └── useThemeStore.ts     # 主题状态
├── pages/
│   └── Home.tsx             # 主页面布局
└── App.tsx                  # 路由入口

electron/
├── main.cjs             # Electron 主进程
├── preload.js           # 预加载脚本
├── start.cjs            # 开发启动器
└── package.json         # Electron 依赖

scripts/
├── pack.cjs             # 一键打包脚本
└── clean-badge.cjs      # 清理构建标记
```

---

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Shift + C` | 显示/隐藏日历窗口 |
| `Escape` | 隐藏日历窗口 |
| 托盘图标单击 | 显示/隐藏日历 |
| 托盘图标右键 | 打开菜单（开机自启、桌面小组件、退出） |

---

## 🔧 Electron 特性

- **单实例运行**：`app.requestSingleInstanceLock()` 防止多开
- **系统托盘**：最小化到托盘，后台运行
- **开机自启**：可选开机自动启动
- **桌面小组件**：独立的小组件窗口，可拖拽定位
- **自动定位权限**：自动授予浏览器定位权限
- **无边框窗口**：透明背景，圆角美观
- **失焦自动隐藏**：点击其他区域自动隐藏窗口

---

## 📡 数据来源

| 数据 | 来源 |
|------|------|
| 天气 | [Open-Meteo API](https://open-meteo.com/)（免费，无需API Key） |
| IP定位 | [ipapi.co](https://ipapi.co/) / [ip.sb](https://ip.sb/) |
| 法定假日 | 国务院办公厅公告 + 在线更新 |
| 农历 | 本地算法计算 |
| 节气 | 固定日期表（2020-2030） |
| 报税/考试 | 内置数据 |

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
