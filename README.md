# InsideDoll 中文翻译项目

> insidedoll.ddo.jp 网站的中文翻译项目

## 📚 项目文档

- **[STRUCTURE.md](STRUCTURE.md)** - 网站结构与翻译优先级指南 ⭐️ 推荐阅读
- **[TRANSLATION.md](TRANSLATION.md)** - 翻译工作流程和工具使用说明
- **[NAVIGATION.md](NAVIGATION.md)** - 完整的网站导航结构（自动生成）

## 📊 当前进度

- **总文件数**: 651
- **已翻译**: 2
- **进度**: 0.31%
- **正在进行**: storyg1/ 系列 (2/19)

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 查看翻译进度

```bash
npm run translation:report
```

### 创建翻译模板

```bash
# 单个文件
npm run translation:create index.md

# 多个文件
npm run translation:create index.md main.md info.md
```

### 查看网站结构

```bash
npm run nav:analyze
```

## 🛠️ 可用命令

### 翻译管理

```bash
npm run translation:report    # 生成翻译进度报告
npm run translation:list      # 列出待翻译文件
npm run translation:list 50   # 列出前50个待翻译文件
npm run translation:create    # 创建翻译模板
npm run translation:help      # 显示帮助
```

### 导航结构

```bash
npm run nav:generate          # 生成 Markdown 格式导航
npm run nav:json              # 生成 JSON 格式导航树
npm run nav:analyze           # 分析并显示目录统计
```

### 开发

```bash
npm run dev                   # 启动开发服务器
npm run build                 # 构建生产版本
npm run preview               # 预览生产构建
```

## 📁 目录结构

```
insidedoll-nuxt/
├── content/
│   ├── ja/              # 日文原文 (651个文件)
│   └── cn/              # 中文翻译 (进行中)
├── scripts/
│   ├── translation-tracker.ts         # 翻译进度跟踪
│   ├── create-translation-template.ts # 翻译模板生成
│   └── generate-navigation.ts         # 导航结构生成
├── STRUCTURE.md         # 网站结构指南
├── TRANSLATION.md       # 翻译工作流程
├── NAVIGATION.md        # 导航结构（自动生成）
└── README.md           # 本文件
```

## 🎯 推荐翻译路径

### 新手入门（第一周）

1. 阅读 [STRUCTURE.md](STRUCTURE.md) 了解网站结构
2. 翻译4个核心页面：index.md, main.md, info.md, wnew.md
3. 完成 storyg1/ 系列剩余文件（17个）
4. 选择感兴趣的系列继续

### 进阶路径

- **追求成就**: 完成 storyh1/ 系列（11个，最小完整系列）
- **主力内容**: 翻译 story01/ 的某个子系列
- **快速积累**: 翻译根目录下的单篇故事

详细说明请参考 [STRUCTURE.md](STRUCTURE.md)

## 📝 文件格式

所有翻译文件使用 Markdown 格式，包含 frontmatter：

```markdown
---
title: "文章标题（中文）"
source: "原始路径（保持不变）"
---

文章内容...

[[返回]](link) [[下一页]](link)
```

## 🔧 技术栈

- **框架**: Nuxt 4
- **内容**: @nuxt/content
- **UI**: @nuxt/ui
- **国际化**: @nuxtjs/i18n
- **脚本**: TypeScript (tsx)

## 📖 原站链接

- 日文原站: https://insidedoll.ddo.jp

## 💡 贡献指南

1. Fork 本仓库
2. 创建翻译模板: `npm run translation:create <文件路径>`
3. 编辑 `content/cn/` 下的对应文件
4. 提交 Pull Request

## 📮 联系方式

如有问题或建议，请提交 Issue。

---

**祝翻译愉快！** 🎉
