#!/usr/bin/env tsx
/**
 * 为主要系列创建索引页面
 * 自动生成各系列的导航索引
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

const CONTENT_DIR = join(process.cwd(), 'content')
const JA_DIR = join(CONTENT_DIR, 'ja')
const CN_DIR = join(CONTENT_DIR, 'cn')

interface StoryFile {
  filename: string
  path: string
  title: string
  source: string
}

async function extractFrontmatter(filePath: string): Promise<{ title: string; source: string } | null> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return null

    const frontmatter = match[1]
    const titleMatch = frontmatter.match(/title:\s*["']?(.+?)["']?\s*$/m)
    const sourceMatch = frontmatter.match(/source:\s*["']?(.+?)["']?\s*$/m)

    return {
      title: titleMatch?.[1] || '',
      source: sourceMatch?.[1] || ''
    }
  } catch {
    return null
  }
}

async function scanSeriesDirectory(seriesDir: string): Promise<Map<string, StoryFile[]>> {
  const seriesMap = new Map<string, StoryFile[]>()

  const entries = await readdir(seriesDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = join(seriesDir, entry.name)
      const files = await readdir(subDir)
      const mdFiles: StoryFile[] = []

      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = join(subDir, file)
          const frontmatter = await extractFrontmatter(filePath)

          mdFiles.push({
            filename: file,
            path: `${entry.name}/${file}`,
            title: frontmatter?.title || file,
            source: frontmatter?.source || `${entry.name}/${file}`
          })
        }
      }

      mdFiles.sort((a, b) => a.filename.localeCompare(b.filename))
      seriesMap.set(entry.name, mdFiles)
    }
  }

  return seriesMap
}

async function createSeriesIndex(
  seriesName: string,
  seriesTitle: string,
  description: string
) {
  const jaSeriesDir = join(JA_DIR, seriesName)
  const cnSeriesDir = join(CN_DIR, seriesName)

  if (!existsSync(jaSeriesDir)) {
    console.log(`⏭️  跳过 ${seriesName} - 目录不存在`)
    return
  }

  const seriesMap = await scanSeriesDirectory(jaSeriesDir)

  // 生成日文索引
  let jaIndex = `---
title: "${seriesTitle}"
source: "${seriesName}"
---

# ${seriesTitle}

${description}

## 📚 章节列表

`

  let totalFiles = 0
  for (const [subDir, files] of Array.from(seriesMap.entries()).sort()) {
    jaIndex += `### ${subDir.toUpperCase()} 系列 (${files.length}篇)\n\n`

    for (const file of files) {
      jaIndex += `- [${file.title}](${file.path})\n`
      totalFiles++
    }
    jaIndex += `\n`
  }

  jaIndex += `\n---\n\n**共 ${totalFiles} 篇故事**\n\n`
  jaIndex += `[[返回主页]](../main)\n`

  // 保存日文索引
  const jaIndexPath = join(jaSeriesDir, 'index.md')
  await writeFile(jaIndexPath, jaIndex, 'utf-8')
  console.log(`✅ 创建日文索引: ${seriesName}/index.md (${totalFiles}篇)`)

  // 生成中文索引模板
  let cnIndex = `---
title: "${seriesTitle}"
source: "${seriesName}"
---

# ${seriesTitle}

${description}

## 📚 章节列表

`

  for (const [subDir, files] of Array.from(seriesMap.entries()).sort()) {
    cnIndex += `### ${subDir.toUpperCase()} 系列 (${files.length}篇)\n\n`

    for (const file of files) {
      cnIndex += `- [${file.title}](${file.path}) ⏳ 待翻译\n`
    }
    cnIndex += `\n`
  }

  cnIndex += `\n---\n\n**共 ${totalFiles} 篇故事**\n\n`
  cnIndex += `[[返回主页]](../main)\n`

  // 保存中文索引
  if (!existsSync(cnSeriesDir)) {
    await mkdir(cnSeriesDir, { recursive: true })
  }
  const cnIndexPath = join(cnSeriesDir, 'index.md')
  await writeFile(cnIndexPath, cnIndex, 'utf-8')
  console.log(`✅ 创建中文索引: ${seriesName}/index.md`)
}

async function createAllIndexes() {
  console.log('📝 创建系列索引页面...\n')

  await createSeriesIndex(
    'storyg1',
    'お人形達の学園',
    '人偶学园系列 - 在特殊学园中，关于美少女人偶装的故事。'
  )

  await createSeriesIndex(
    'story01',
    'とん太的作品',
    '主要故事系列 - 作者的主力作品集，涵盖多个主题和世界观。'
  )

  await createSeriesIndex(
    'storyn1',
    '成田君的故事',
    '成田系列 - 以成田为主角的系列故事。'
  )

  await createSeriesIndex(
    'storyh1',
    '羽田君的故事',
    '羽田系列 - 以羽田为主角的系列故事。'
  )

  console.log('\n✅ 所有索引页面创建完成！')
}

createAllIndexes()
