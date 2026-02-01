<script setup lang="ts">
/**
 * 导航树组件
 * 显示可折叠的层级导航结构
 */

interface NavItem {
  label: string
  path?: string
  icon?: string
  badge?: string
  children?: NavItem[]
  expanded?: boolean
}

interface Props {
  items: NavItem[]
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

const { locale } = useI18n()
const { close } = useSidebar()

// 展开状态
const expanded = ref<Record<string, boolean>>({})

const toggleExpand = (label: string) => {
  expanded.value[label] = !expanded.value[label]
}

const isExpanded = (label: string) => {
  return expanded.value[label] ?? false
}

const getLocalePath = (path: string) => {
  return locale.value === 'ja' ? path : `/${locale.value}${path}`
}

const handleNavClick = () => {
  // 桌面端不自动关闭侧边栏
  if (window.innerWidth < 1024) {
    close()
  }
}
</script>

<template>
  <ul
    class="space-y-0.5"
    :class="{ 'ml-3': level > 0 }"
  >
    <li v-for="item in items" :key="item.label">
      <!-- 有子项的节点 -->
      <div v-if="item.children && item.children.length > 0">
        <button
          class="flex items-center w-full px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          @click="toggleExpand(item.label)"
        >
          <UIcon
            :name="isExpanded(item.label) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
            class="w-4 h-4 mr-1 flex-shrink-0 text-gray-400"
          />
          <UIcon
            v-if="item.icon"
            :name="item.icon"
            class="w-4 h-4 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400"
          />
          <span class="flex-1 text-gray-700 dark:text-gray-300">{{ item.label }}</span>
          <UBadge
            v-if="item.badge"
            color="gray"
            variant="subtle"
            size="xs"
          >
            {{ item.badge }}
          </UBadge>
        </button>

        <!-- 子项 -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <NavTree
            v-if="isExpanded(item.label)"
            :items="item.children"
            :level="level + 1"
          />
        </Transition>
      </div>

      <!-- 叶子节点 -->
      <NuxtLink
        v-else-if="item.path"
        :to="getLocalePath(item.path)"
        class="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
        @click="handleNavClick"
      >
        <span class="w-5 mr-1" />
        <UIcon
          v-if="item.icon"
          :name="item.icon"
          class="w-4 h-4 mr-2 flex-shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
        />
        <span class="flex-1 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
          {{ item.label }}
        </span>
        <UBadge
          v-if="item.badge"
          color="gray"
          variant="subtle"
          size="xs"
        >
          {{ item.badge }}
        </UBadge>
      </NuxtLink>
    </li>
  </ul>
</template>
