// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/image', '@nuxt/ui', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },
  i18n: {
    locales: [
      { code: 'ja', name: '日本語', language: 'ja-JP', dir: 'ltr' },
      { code: 'cn', name: '中文简体', language: 'zh-CN' },
    ],
    strategy: 'prefix_except_default',
    defaultLocale: 'ja',
  }
})