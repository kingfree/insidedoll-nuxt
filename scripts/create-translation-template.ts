#!/usr/bin/env tsx
/**
 * 创建翻译模板工具
 * 从日文文件创建对应的中文翻译模板
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname, relative } from 'path'
import { existsSync } from 'fs'

const CONTENT_DIR = join(process.cwd(), 'content')
const JA_DIR = join(CONTENT_DIR, 'ja')
const CN_DIR = join(CONTENT_DIR, 'cn')

async function createTranslationTemplate(jaRelativePath: string) {
  const jaPath = join(JA_DIR, jaRelativePath)
  const cnPath = join(CN_DIR, jaRelativePath)

  if (!existsSync(jaPath)) {
    console.error(`❌ 日文文件不存在: ${jaRelativePath}`)
    return
  }

  if (existsSync(cnPath)) {
    console.error(`❌ 中文文件已存在: ${jaRelativePath}`)
    return
  }

  // 读取日文文件
  const jaContent = await readFile(jaPath, 'utf-8')

  // 提取 frontmatter
  const frontmatterMatch = jaContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!frontmatterMatch) {
    console.error(`❌ 无法解析文件frontmatter: ${jaRelativePath}`)
    return
  }

  const frontmatter = frontmatterMatch[1]
  const content = frontmatterMatch[2]

  // 创建中文翻译模板（保留原文作为注释）
  const cnContent = `---
${frontmatter}
---

${content}`

  // 确保目录存在
  await mkdir(dirname(cnPath), { recursive: true })

  // 写入文件
  await writeFile(cnPath, cnContent, 'utf-8')

  console.log(`✅ 已创建翻译模板: ${jaRelativePath}`)
}

async function batchCreate(jaRelativePaths: string[]) {
  console.log(`📝 批量创建 ${jaRelativePaths.length} 个翻译模板...\n`)

  for (const path of jaRelativePaths) {
    await createTranslationTemplate(path)
  }

  console.log(`\n✅ 完成！`)
}

// CLI
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log(`
创建翻译模板工具

用法:
  npm run translation:create <文件路径>...

示例:
  npm run translation:create storyg1/0g/story_0g33.md
  npm run translation:create story01/03/story_0301.md story01/03/story_0302.md

说明:
  - 文件路径相对于 content/ja/ 目录
  - 会在 content/cn/ 对应位置创建翻译模板
  - 模板保留原日文内容，需要手动翻译
`)
  process.exit(0)
}

batchCreate(args)
