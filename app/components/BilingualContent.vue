<script setup lang="ts">
/**
 * 双语内容组件
 * 根据显示模式自动切换显示中文/日文/双语
 */

interface Props {
  jaTitle?: string
  cnTitle?: string
  jaContent?: string
  cnContent?: string
}

const props = defineProps<Props>()

const { displayMode } = useDisplayMode()
</script>

<template>
  <div>
    <!-- 双语模式 -->
    <div v-if="displayMode === 'both'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 日文原文 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">日本語</span>
          <UBadge color="blue" variant="subtle">原文</UBadge>
        </div>
        <div class="prose dark:prose-invert max-w-none">
          <h1 v-if="jaTitle">{{ jaTitle }}</h1>
          <slot name="ja">
            <div v-if="jaContent" v-html="jaContent" />
            <slot />
          </slot>
        </div>
      </div>

      <!-- 中文翻译 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">中文</span>
          <UBadge color="green" variant="subtle">翻译</UBadge>
        </div>
        <div class="prose dark:prose-invert max-w-none">
          <h1 v-if="cnTitle">{{ cnTitle }}</h1>
          <slot name="cn">
            <div v-if="cnContent" v-html="cnContent" />
            <div v-else class="text-gray-400 italic">
              <UIcon name="i-heroicons-language" class="mr-2" />
              待翻译...
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- 仅显示中文 -->
    <div v-else-if="displayMode === 'cn'" class="prose dark:prose-invert max-w-none">
      <h1 v-if="cnTitle">{{ cnTitle }}</h1>
      <slot name="cn">
        <div v-if="cnContent" v-html="cnContent" />
        <slot />
      </slot>
    </div>

    <!-- 仅显示日文 -->
    <div v-else class="prose dark:prose-invert max-w-none">
      <h1 v-if="jaTitle">{{ jaTitle }}</h1>
      <slot name="ja">
        <div v-if="jaContent" v-html="jaContent" />
        <slot />
      </slot>
    </div>
  </div>
</template>
