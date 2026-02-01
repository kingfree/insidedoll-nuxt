import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const schema = z.object({
  title: z.string(),
  source: z.string(),
  date: z.string().optional(),
  update: z.string().optional(),
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
    }),
    content_cn: defineCollection({
      type: 'page',
      source: {
        include: 'cn/**/*.md',
        prefix: ''
      },
      schema
    })
  }
})
