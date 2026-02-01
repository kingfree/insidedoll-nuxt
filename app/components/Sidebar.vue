<script setup lang="ts">
/**
 * 侧边栏组件 - 完整的目录层级结构
 */

const { isOpen, close } = useSidebar()

// 完整的导航树结构
const navTree = [
  {
    label: '主要页面',
    icon: 'i-heroicons-home',
    children: [
      { label: '主页', path: '/main', icon: 'i-heroicons-home' },
      { label: '简介', path: '/info', icon: 'i-heroicons-information-circle' },
      { label: '最新消息', path: '/wnew', icon: 'i-heroicons-bell' },
    ]
  },
  {
    label: '小说作品',
    icon: 'i-heroicons-book-open',
    badge: '261',
    children: [
      {
        label: 'お人形達の学園',
        path: '/storyg1',
        icon: 'i-heroicons-academic-cap',
        badge: '2/19',
        children: [
          { label: '0G 系列', path: '/storyg1/0g', badge: '19' }
        ]
      },
      {
        label: 'とん太的作品',
        path: '/story01',
        icon: 'i-heroicons-document-text',
        badge: '170',
        children: [
          { label: '01 系列', path: '/story01/01' },
          { label: '02 系列', path: '/story01/02' },
          { label: '03 系列', path: '/story01/03' },
          { label: '04 系列', path: '/story01/04' },
          { label: '05 系列', path: '/story01/05' },
          { label: '06 系列', path: '/story01/06' },
          { label: '07 系列', path: '/story01/07' },
          { label: '08 系列', path: '/story01/08' },
          { label: '09 系列', path: '/story01/09' },
          { label: '0A 系列', path: '/story01/0a', badge: '70' },
          { label: '0B 系列', path: '/story01/0b' },
          { label: '0C 系列', path: '/story01/0c' },
          { label: '0D 系列', path: '/story01/0d' },
          { label: '0E 系列', path: '/story01/0e' },
          { label: '0F 系列', path: '/story01/0f' },
          { label: '0H 系列', path: '/story01/0h' },
          { label: '0I 系列', path: '/story01/0i' },
          { label: '0K 系列', path: '/story01/0k' },
          { label: '0L 系列', path: '/story01/0l' },
          { label: '0P 系列', path: '/story01/0p' },
          { label: '0R 系列', path: '/story01/0r' },
          { label: '0S 系列', path: '/story01/0s' },
          { label: '0V 系列', path: '/story01/0v' },
          { label: '0W 系列', path: '/story01/0w' },
          { label: '0X 系列', path: '/story01/0x' },
          { label: '0Y 系列', path: '/story01/0y' },
          { label: '0Z 系列', path: '/story01/0z' },
          { label: '10 系列', path: '/story01/10' },
        ]
      },
      {
        label: '成田君的故事',
        path: '/storyn1',
        icon: 'i-heroicons-user',
        badge: '61',
        children: [
          { label: 'N1 章节', path: '/storyn1/n1' },
          { label: 'N2 章节', path: '/storyn1/n2' },
          { label: 'N3 章节', path: '/storyn1/n3' },
          { label: 'N4 章节', path: '/storyn1/n4' },
          { label: 'N5 章节', path: '/storyn1/n5' },
          { label: 'N6 章节', path: '/storyn1/n6' },
          { label: 'N7 章节', path: '/storyn1/n7' },
          { label: 'N8 章节', path: '/storyn1/n8' },
          { label: 'N9 章节', path: '/storyn1/n9' },
          { label: 'NA 章节', path: '/storyn1/na' },
          { label: 'NB 章节', path: '/storyn1/nb' },
          { label: 'NC 章节', path: '/storyn1/nc' },
          { label: 'ND 章节', path: '/storyn1/nd' },
          { label: 'NE 章节', path: '/storyn1/ne' },
        ]
      },
      {
        label: '羽田君的故事',
        path: '/storyh1',
        icon: 'i-heroicons-user-circle',
        badge: '11',
        children: [
          { label: 'H0 章节', path: '/storyh1/h0', badge: '11' }
        ]
      }
    ]
  },
  {
    label: '单篇故事',
    icon: 'i-heroicons-document',
    badge: '185',
    children: [
      { label: '02 系列', icon: 'i-heroicons-document-text' },
      { label: '05 系列', icon: 'i-heroicons-document-text' },
      { label: '06 系列', icon: 'i-heroicons-document-text' },
      { label: '07 系列', icon: 'i-heroicons-document-text' },
      { label: '08 系列', icon: 'i-heroicons-document-text' },
      { label: '09 系列', icon: 'i-heroicons-document-text' },
      { label: '0A 系列', icon: 'i-heroicons-document-text' },
      { label: '0C-0S 系列', icon: 'i-heroicons-document-text' },
      { label: 'N8 系列', icon: 'i-heroicons-document-text' },
      { label: 'NC-ND 系列', icon: 'i-heroicons-document-text' },
    ]
  },
  {
    label: '访谈 & 互动',
    icon: 'i-heroicons-chat-bubble-left-right',
    badge: '185',
    children: [
      { label: '访谈存档', path: '/intvarc', badge: '176', icon: 'i-heroicons-archive-box' },
      { label: '访谈索引', badge: '9', icon: 'i-heroicons-list-bullet' }
    ]
  },
  {
    label: '其他内容',
    icon: 'i-heroicons-ellipsis-horizontal-circle',
    children: [
      { label: '专栏', path: '/column', icon: 'i-heroicons-newspaper' },
      { label: '同人小说', path: '/novel_info_main', icon: 'i-heroicons-book-open' },
      { label: '链接', path: '/link', icon: 'i-heroicons-link' },
      { label: '博客', path: '/blog', icon: 'i-heroicons-rss', badge: '1' },
    ]
  }
]
</script>

<template>
  <!-- 侧边栏 -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="isOpen"
      class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto z-40 shadow-lg"
    >
      <div class="p-4">
        <!-- 导航标题 -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📚 目录导航
          </h2>
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="gray"
            variant="ghost"
            @click="close"
            aria-label="关闭侧边栏"
          />
        </div>

        <!-- 导航树 -->
        <nav class="mb-6">
          <NavTree :items="navTree" />
        </nav>

        <USeparator class="my-4" />

        <!-- 翻译进度 -->
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 mr-2" />
            翻译进度
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">总文件数</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">651</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">已翻译</span>
              <UBadge color="green" variant="subtle">2</UBadge>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">待翻译</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">649</span>
            </div>

            <!-- 进度条 -->
            <div class="pt-2">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-gray-500 dark:text-gray-400">完成度</span>
                <span class="font-medium text-primary-600 dark:text-primary-400">0.31%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                  style="width: 0.31%"
                />
              </div>
            </div>
          </div>
        </div>

        <USeparator class="my-4" />

        <!-- 快捷链接 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <UIcon name="i-heroicons-link" class="w-4 h-4 mr-2" />
            项目资源
          </h3>
          <div class="space-y-1">
            <UButton
              to="https://github.com"
              target="_blank"
              icon="i-heroicons-code-bracket"
              variant="ghost"
              color="gray"
              size="sm"
              block
              class="justify-start"
            >
              GitHub 仓库
            </UButton>
            <UButton
              icon="i-heroicons-document-text"
              variant="ghost"
              color="gray"
              size="sm"
              block
              class="justify-start"
            >
              翻译指南
            </UButton>
            <UButton
              icon="i-heroicons-map"
              variant="ghost"
              color="gray"
              size="sm"
              block
              class="justify-start"
            >
              网站结构
            </UButton>
          </div>
        </div>
      </div>
    </aside>
  </Transition>

  <!-- 遮罩层（移动端） -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="close"
    />
  </Transition>
</template>
