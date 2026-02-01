#!/usr/bin/env tsx
/**
 * 翻译进度跟踪工具
 * 用于管理 insidedoll.ddo.jp 的中文翻译项目
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, relative } from 'path'
import { existsSync } from 'fs'

interface FileInfo {
  path: string
  relativePath: string
  title: string
  source: string
  translated: boolean
  translatedPath?: string
}

interface TranslationStats {
  total: number
  translated: number
  remaining: number
  percentage: string
  files: FileInfo[]
}

const CONTENT_DIR = join(process.cwd(), 'content')
const JA_DIR = join(CONTENT_DIR, 'ja')
const CN_DIR = join(CONTENT_DIR, 'cn')

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  async function scan(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        await scan(fullPath)
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }

  await scan(dir)
  return files
}

async function extractFrontmatter(filePath: string): Promise<{ title: string; source: string } | null> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const match = content.match(/^---\n([\s\S]*?)\n---/)

    if (!match) return null

    const frontmatter = match[1]
    const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/)
    const sourceMatch = frontmatter.match(/source:\s*["'](.+?)["']/)

    return {
      title: titleMatch?.[1] || '',
      source: sourceMatch?.[1] || ''
    }
  } catch {
    return null
  }
}

async function getTranslationStats(): Promise<TranslationStats> {
  const jaFiles = await getAllMarkdownFiles(JA_DIR)
  const files: FileInfo[] = []

  for (const jaPath of jaFiles) {
    const relativePath = relative(JA_DIR, jaPath)
    const cnPath = join(CN_DIR, relativePath)
    const translated = existsSync(cnPath)

    const frontmatter = await extractFrontmatter(jaPath)

    files.push({
      path: jaPath,
      relativePath,
      title: frontmatter?.title || '',
      source: frontmatter?.source || '',
      translated,
      translatedPath: translated ? cnPath : undefined
    })
  }

  const translated = files.filter(f => f.translated).length
  const total = files.length
  const remaining = total - translated
  const percentage = ((translated / total) * 100).toFixed(2)

  return {
    total,
    translated,
    remaining,
    percentage,
    files
  }
}

async function generateReport() {
  console.log('🔍 扫描翻译文件...\n')

  const stats = await getTranslationStats()

  console.log('📊 翻译进度统计')
  console.log('='.repeat(50))
  console.log(`总文件数:     ${stats.total}`)
  console.log(`已翻译:       ${stats.translated}`)
  console.log(`未翻译:       ${stats.remaining}`)
  console.log(`完成度:       ${stats.percentage}%`)
  console.log('='.repeat(50))
  console.log()

  // 按目录分组
  const byDirectory = new Map<string, FileInfo[]>()

  for (const file of stats.files) {
    const dir = file.relativePath.split('/')[0] || 'root'
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, [])
    }
    byDirectory.get(dir)!.push(file)
  }

  console.log('📁 按目录统计:')
  console.log()

  for (const [dir, files] of Array.from(byDirectory.entries()).sort()) {
    const translatedCount = files.filter(f => f.translated).length
    const total = files.length
    const percentage = ((translatedCount / total) * 100).toFixed(1)

    const status = translatedCount === total ? '✅' :
                   translatedCount === 0 ? '⏳' : '🔄'

    console.log(`${status} ${dir.padEnd(30)} ${translatedCount.toString().padStart(3)}/${total.toString().padStart(3)} (${percentage.padStart(5)}%)`)
  }

  console.log()

  // 生成待翻译文件列表
  const untranslated = stats.files.filter(f => !f.translated)

  if (untranslated.length > 0) {
    console.log(`📝 待翻译文件 (前20个):`)
    console.log()

    for (const file of untranslated.slice(0, 20)) {
      console.log(`  - ${file.relativePath}`)
      if (file.title) {
        console.log(`    标题: ${file.title}`)
      }
    }

    if (untranslated.length > 20) {
      console.log(`\n  ... 还有 ${untranslated.length - 20} 个文件`)
    }
  }

  // 保存详细报告到文件
  const reportPath = join(process.cwd(), 'translation-progress.json')
  await writeFile(reportPath, JSON.stringify(stats, null, 2))
  console.log(`\n💾 详细报告已保存到: ${reportPath}`)
}

async function listUntranslated(limit?: number) {
  const stats = await getTranslationStats()
  const untranslated = stats.files.filter(f => !f.translated)

  const filesToShow = limit ? untranslated.slice(0, limit) : untranslated

  for (const file of filesToShow) {
    console.log(file.relativePath)
  }
}

// CLI
const command = process.argv[2]

switch (command) {
  case 'report':
  case undefined:
    generateReport()
    break

  case 'list':
    const limit = process.argv[3] ? parseInt(process.argv[3]) : undefined
    listUntranslated(limit)
    break

  case 'help':
    console.log(`
翻译进度跟踪工具

用法:
  npm run translation:report        生成完整翻译进度报告
  npm run translation:list [数量]   列出待翻译文件
  npm run translation:help          显示帮助信息

示例:
  npm run translation:report        # 显示完整报告
  npm run translation:list          # 列出所有待翻译文件
  npm run translation:list 50       # 列出前50个待翻译文件
`)
    break

  default:
    console.error(`未知命令: ${command}`)
    console.error('使用 "npm run translation:help" 查看帮助')
    process.exit(1)
}
