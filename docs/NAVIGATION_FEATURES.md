# 🎨 导航功能说明

## 📱 全局导航栏功能

导航栏右侧提供了四个核心功能按钮：

### 1️⃣ 切换侧边栏 (`i-heroicons-bars-3`)

**功能**：显示/隐藏左侧导航面板

**特点**：
- 📍 固定在页面左侧
- 🎯 快速访问主要章节
- 📊 实时显示翻译进度
- 📱 移动端自动添加遮罩层
- ⌨️ 点击遮罩自动关闭

**使用方法**：
```typescript
const { isOpen, toggle, open, close } = useSidebar()
```

### 2️⃣ 切换显示中文 (中)

**功能**：控制中文内容的显示

**状态**：
- 🔵 **蓝色高亮** = 仅显示中文
- ⚪️ **灰色** = 显示双语或仅日文

**行为**：
- 第一次点击：切换到"仅显示中文"模式
- 再次点击：恢复"双语显示"模式
- 自动切换到中文语言环境

### 3️⃣ 切换显示日文 (日)

**功能**：控制日文内容的显示

**状态**：
- 🔵 **蓝色高亮** = 仅显示日文
- ⚪️ **灰色** = 显示双语或仅中文

**行为**：
- 第一次点击：切换到"仅显示日文"模式
- 再次点击：恢复"双语显示"模式
- 自动切换到日文语言环境

### 4️⃣ 切换深色模式 (`UColorModeButton`)

**功能**：切换明亮/暗黑主题

**特点**：
- 🌞 亮色模式
- 🌙 暗色模式
- 🔄 跟随系统设置
- 💾 自动保存偏好

## 🎯 显示模式详解

### 模式类型

系统支持三种显示模式：

| 模式 | 值 | 说明 |
|------|-----|------|
| 双语模式 | `'both'` | 左右分栏显示中日对照 |
| 仅中文 | `'cn'` | 只显示中文翻译内容 |
| 仅日文 | `'ja'` | 只显示日文原文内容 |

### 双语模式布局

```
┌─────────────────────┬─────────────────────┐
│   日本語 (原文)      │      中文 (翻译)     │
├─────────────────────┼─────────────────────┤
│                     │                     │
│   日文内容...        │   中文内容...        │
│                     │   (或"待翻译...")   │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

### 单语模式布局

```
┌───────────────────────────────────────────┐
│            选定语言的内容                   │
├───────────────────────────────────────────┤
│                                           │
│   内容...                                 │
│                                           │
└───────────────────────────────────────────┘
```

## 🛠️ 使用组合式函数

### useDisplayMode

```vue
<script setup>
const {
  displayMode,        // 当前显示模式
  setDisplayMode,     // 设置显示模式
  toggleChinese,      // 切换中文显示
  toggleJapanese,     // 切换日文显示
  isBothMode,         // 是否双语模式
  isChineseOnly,      // 是否仅中文
  isJapaneseOnly      // 是否仅日文
} = useDisplayMode()
</script>
```

### useSidebar

```vue
<script setup>
const {
  isOpen,    // 侧边栏是否打开
  toggle,    // 切换侧边栏状态
  open,      // 打开侧边栏
  close      // 关闭侧边栏
} = useSidebar()
</script>
```

## 📦 使用组件

### BilingualContent 组件

用于在页面中自动适配显示模式的双语内容：

```vue
<template>
  <BilingualContent
    ja-title="日本語のタイトル"
    cn-title="中文标题"
  >
    <template #ja>
      <!-- 日文内容 -->
      <p>日本語の内容...</p>
    </template>

    <template #cn>
      <!-- 中文内容 -->
      <p>中文内容...</p>
    </template>
  </BilingualContent>
</template>
```

**特点**：
- ✅ 自动响应显示模式变化
- ✅ 支持标题和内容插槽
- ✅ 未翻译时显示提示
- ✅ 带有语言标签和徽章

### Sidebar 组件

独立的侧边栏组件，已内置在布局中：

**功能**：
- 🔗 快速导航链接
- 📊 翻译进度统计
- 🔄 进度条可视化
- 📱 响应式设计
- 🎨 自动主题适配

## 💡 最佳实践

### 1. 内容页面结构

```vue
<template>
  <div>
    <BilingualContent
      :ja-title="jaData.title"
      :cn-title="cnData?.title"
    >
      <template #ja>
        <ContentRenderer :value="jaData" />
      </template>

      <template #cn>
        <ContentRenderer v-if="cnData" :value="cnData" />
      </template>
    </BilingualContent>
  </div>
</template>

<script setup>
const { locale } = useI18n()
const route = useRoute()

// 加载日文原文
const { data: jaData } = await useAsyncData(
  'ja-content',
  () => queryContent('/ja/' + route.path).findOne()
)

// 加载中文翻译（可能不存在）
const { data: cnData } = await useAsyncData(
  'cn-content',
  () => queryContent('/cn/' + route.path).findOne()
)
</script>
```

### 2. 侧边栏交互

```vue
<template>
  <div>
    <!-- 在移动端显示打开侧边栏的按钮 -->
    <UButton
      icon="i-heroicons-bars-3"
      @click="open"
      class="lg:hidden"
    >
      菜单
    </UButton>
  </div>
</template>

<script setup>
const { open } = useSidebar()
</script>
```

### 3. 自定义显示模式切换

```vue
<template>
  <div>
    <!-- 自定义切换按钮 -->
    <UButtonGroup>
      <UButton
        :variant="isBothMode ? 'solid' : 'outline'"
        @click="setDisplayMode('both')"
      >
        双语
      </UButton>
      <UButton
        :variant="isChineseOnly ? 'solid' : 'outline'"
        @click="setDisplayMode('cn')"
      >
        中文
      </UButton>
      <UButton
        :variant="isJapaneseOnly ? 'solid' : 'outline'"
        @click="setDisplayMode('ja')"
      >
        日文
      </UButton>
    </UButtonGroup>
  </div>
</template>

<script setup>
const {
  setDisplayMode,
  isBothMode,
  isChineseOnly,
  isJapaneseOnly
} = useDisplayMode()
</script>
```

## 🎨 样式定制

### 侧边栏宽度

在 `Sidebar.vue` 中修改：

```vue
<!-- 默认宽度 w-72 (18rem / 288px) -->
<aside class="w-72 ...">

<!-- 可选宽度 -->
<!-- w-64 = 16rem / 256px -->
<!-- w-80 = 20rem / 320px -->
```

### 响应式断点

```vue
<!-- 桌面端才显示侧边栏 -->
<div class="hidden lg:block">

<!-- 移动端显示遮罩 -->
<div class="lg:hidden">
```

## 🔧 状态持久化

显示模式和侧边栏状态使用 `useState`，会在客户端会话期间保持：

```typescript
// 状态在刷新后会重置为默认值
const displayMode = useState('displayMode', () => 'both')
const sidebarOpen = useState('sidebarOpen', () => false)
```

如需持久化到 localStorage：

```typescript
// 在 plugins/ 中创建插件
export default defineNuxtPlugin(() => {
  const displayMode = useState('displayMode')

  // 从 localStorage 恢复
  if (process.client) {
    const saved = localStorage.getItem('displayMode')
    if (saved) displayMode.value = saved
  }

  // 监听变化并保存
  watch(displayMode, (value) => {
    if (process.client) {
      localStorage.setItem('displayMode', value)
    }
  })
})
```

## 📱 移动端优化

- ✅ 侧边栏在移动端自动全屏显示
- ✅ 点击遮罩层自动关闭
- ✅ 平滑的进入/退出动画
- ✅ 导航按钮自动调整大小
- ✅ 双语模式在移动端改为上下排列

---

**享受流畅的阅读体验！** 🎉
