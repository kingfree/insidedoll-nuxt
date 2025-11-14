import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const schema = z.object({
  date: z.string(),
  update: z.string(),
})

export default defineContentConfig({
  collections: {
    content_ja: defineCollection({
      type: 'page',
      source: {
        include: 'ja/**/*.md',
        prefix: ''
      },
      schema
    })
  }
})
