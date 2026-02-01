<script setup lang="ts">
const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar()
const { displayMode, toggleChinese, toggleJapanese } = useDisplayMode()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- 导航栏 -->
    <UHeader title="Inside Doll" to="/main">
      <template #right>
        <div class="flex items-center gap-1">
          <!-- 切换侧边栏 -->
          <UTooltip text="切换侧边栏">
            <UButton
              size="sm"
              variant="ghost"
              color="gray"
              :icon="sidebarOpen ? 'i-heroicons-bars-3-bottom-left' : 'i-heroicons-bars-3'"
              @click="toggleSidebar"
              aria-label="切换侧边栏"
            />
          </UTooltip>

          <!-- 切换显示中文 -->
          <UTooltip :text="displayMode === 'cn' ? '显示双语' : '仅显示中文'">
            <UButton
              size="sm"
              variant="ghost"
              :color="displayMode === 'cn' ? 'primary' : 'gray'"
              @click="toggleChinese"
              aria-label="切换中文显示"
            >
              <span class="text-sm font-medium">中</span>
            </UButton>
          </UTooltip>

          <!-- 切换显示日文 -->
          <UTooltip :text="displayMode === 'ja' ? '显示双语' : '仅显示日文'">
            <UButton
              size="sm"
              variant="ghost"
              :color="displayMode === 'ja' ? 'primary' : 'gray'"
              @click="toggleJapanese"
              aria-label="切换日文显示"
            >
              <span class="text-sm font-medium">日</span>
            </UButton>
          </UTooltip>

          <!-- 切换深色模式 -->
          <UTooltip text="切换主题">
            <UColorModeButton />
          </UTooltip>
        </div>
      </template>
    </UHeader>

    <!-- 侧边栏组件 -->
    <Sidebar />

    <!-- 主内容区 -->
    <main
      class="transition-all duration-300"
      :class="{ 'lg:ml-80': sidebarOpen }"
    >
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>
  </div>
</template>
