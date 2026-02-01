<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { Collections } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()
const slug = computed(() => withLeadingSlash(String(route.params.slug)).replaceAll(',', '/'))
const showSideBySide = useState('bilingualView', () => true)

const fetchContent = async (lang: string) => {
  const collection = ('content_' + lang) as keyof Collections
  return await queryCollection(collection).path(slug.value).first()
}

const { data: page } = await useAsyncData('page-' + slug.value, async () => {
  let content = await fetchContent(locale.value)

  if (!content && locale.value !== 'ja') {
    content = await fetchContent('ja')
  }

  return content
}, {
  watch: [locale, () => slug.value], // Refetch when locale changes
})

// Auto-redirect to first chapter if directory has no index
if (!page.value) {
  const collection = ('content_' + (locale.value || 'ja')) as keyof Collections
  const firstChild = await queryCollection(collection)
    .where({ _path: { $regex: `^${slug.value}/[^/]+$` } })
    .sort({ _path: 1 })
    .limit(1)
    .find()

  if (firstChild.length > 0) {
    await navigateTo(firstChild[0]._path)
  }
}

const alternateLocale = computed(() => locale.value === 'ja' ? 'cn' : 'ja')

const { data: alternatePage } = await useAsyncData('page-alt-' + slug.value, async () => {
  const altCode = alternateLocale.value
  return await fetchContent(altCode)
}, {
  watch: [alternateLocale, () => slug.value],
})

const jaContent = computed(() => (locale.value === 'ja' ? page.value : alternatePage.value))
const cnContent = computed(() => (locale.value === 'cn' ? page.value : alternatePage.value))
const hasBilingual = computed(() => Boolean(jaContent.value && cnContent.value))

// Fetch surrounding pages for Previous/Next navigation
const { data: surround } = await useAsyncData('surround-' + slug.value, async () => {
  const collection = ('content_' + locale.value) as keyof Collections
  return await queryCollection(collection).path(slug.value).findSurround()
}, {
  watch: [locale, () => slug.value],
})

const storageKey = computed(() => `scroll:${slug.value}`)
let scrollSaveTimer: ReturnType<typeof setTimeout> | undefined

const saveScrollPosition = (key = storageKey.value) => {
  if (!process.client) return

  localStorage.setItem(key, String(Math.round(window.scrollY)))
}

const restoreScrollPosition = async (key = storageKey.value) => {
  if (!process.client) return

  const saved = localStorage.getItem(key)

  if (saved !== null) {
    const top = Number.parseInt(saved, 10)

    if (!Number.isNaN(top)) {
      await nextTick()
      window.scrollTo({ top })
      return
    }
  }

  window.scrollTo({ top: 0 })
}

const handleScroll = () => {
  if (scrollSaveTimer) clearTimeout(scrollSaveTimer)
  scrollSaveTimer = setTimeout(() => saveScrollPosition(), 150)
}

onMounted(() => {
  restoreScrollPosition()
  if (!process.client) return

  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (!process.client) return

  if (scrollSaveTimer) clearTimeout(scrollSaveTimer)
  saveScrollPosition()
  window.removeEventListener('scroll', handleScroll)
})

watch(() => storageKey.value, (newKey, oldKey) => {
  if (!process.client) return
  if (newKey === oldKey) return

  if (oldKey) saveScrollPosition(oldKey)
  restoreScrollPosition(newKey)
})

watch(locale, () => {
  if (!process.client) return
  restoreScrollPosition()
})

watch(page, (val) => {
  if (!process.client || !val) return

  restoreScrollPosition()
})
</script>
<template>
  <UPage v-if="page">
    <UPageBody class="max-w-screen-xl mx-auto">
      <div v-if="showSideBySide && hasBilingual" class="grid gap-8 lg:grid-cols-2">
        <article class="space-y-4">
          <div class="space-y-1">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
              日本語
            </p>
            <h1 class="text-2xl font-semibold">
              {{ jaContent?.title }}
            </h1>
          </div>
          <ContentRenderer v-if="jaContent?.body" :value="jaContent" />
        </article>
        <article class="space-y-4">
          <div class="space-y-1">
            <p class="text-xs font-medium uppercase tracking-wide text-gray-500">
              中文
            </p>
            <h1 class="text-2xl font-semibold">
              {{ cnContent?.title }}
            </h1>
          </div>
          <ContentRenderer v-if="cnContent?.body" :value="cnContent" />
        </article>
      </div>

      <template v-else>
        <UPageHeader :title="page.title" />
        <ContentRenderer v-if="page.body" :value="page" />
      </template>

      <USeparator v-if="surround?.filter(Boolean).length" />

      <UContentSurround :surround="(surround as any)" />
    </UPageBody>
  </UPage>
</template>
