<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => withLeadingSlash(String(route.params.slug)).replaceAll(',', '/'))

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

const navs = ref([
  {
    label: 'とん太の作品',
    to: '/story01',
  }, {
    label: '成田君のお話',
    to: '/storyn1',
  }, {
    label: '羽田君のお話',
    to: '/storyh1',
  }, {
    label: 'お人形達の学園',
    to: '/storyg1',
  },
])
</script>
<template>
  <UPage v-if="page">
    <UPageHeader :title="page.title" />

    <UPageBody class="max-w-2xl">
      <ContentRenderer v-if="page.body" :value="page" />

      <USeparator v-if="surround?.filter(Boolean).length" />

      <UContentSurround :surround="(surround as any)" />
    </UPageBody>

    <template #left>
      <UPageAside>
        <UNavigationMenu orientation="vertical" :items="navs" />
      </UPageAside>
    </template>
    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body.toc.links" />
    </template>
  </UPage>
</template>
