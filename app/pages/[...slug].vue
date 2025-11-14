<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => withLeadingSlash(String(route.params.slug)))

const { data: page } = await useAsyncData('page-' + slug.value, async () => {
  // Build collection name based on current locale
  const collection = ('content_' + locale.value) as keyof Collections
  const content = await queryCollection(collection).path(slug.value).first()

  // Optional: fallback to default locale if content is missing
  if (!content && locale.value !== 'ja') {
    return await queryCollection('content_ja').path(slug.value).first()
  }

  return content
}, {
  watch: [locale], // Refetch when locale changes
})
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
  <div v-else>
    <h1>Page not found</h1>
    <p>This page doesn't exist in {{ locale }} language.</p>
  </div>
</template>
