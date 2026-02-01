#!/usr/bin/env tsx
/**
 * InsideDoll 网站爬虫
 * 递归抓取并转换为 Markdown 格式
 */

import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import TurndownService from 'turndown'

const BASE_URL = 'https://insidedoll.ddo.jp'
const OUTPUT_DIR = join(process.cwd(), 'content/ja')
const DELAY_MS = 1000 // 请求间隔，避免过载服务器
const MAX_DEPTH = 5 // 最大递归深度

// 已访问的 URL 集合
const visited = new Set<string>()
// 待处理的 URL 队列
const queue: Array<{ url: string; depth: number }> = []

// Markdown 转换器
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// 自定义转换规则
turndownService.addRule('preserveLineBreaks', {
  filter: ['br'],
  replacement: () => '\n'
})

interface PageData {
  url: string
  title: string
  content: string
  links: string[]
}

/**
 * 提取页面标题
 * 注意：标题不在 <title> 中，而是在第一个 tb align="CENTER" 的 <b> 标签中
 */
function extractTitle(html: string): string {
  // 查找第一个 tb align="CENTER" 内的 <b> 标签
  const centerTableMatch = html.match(/<t[dr][^>]*align\s*=\s*["']?CENTER["']?[^>]*>[\s\S]*?<b[^>]*>(.*?)<\/b>/i)

  if (centerTableMatch && centerTableMatch[1]) {
    return centerTableMatch[1].replace(/<[^>]+>/g, '').trim()
  }

  // 备选方案：查找任何居中的 <b> 标签
  const boldCenterMatch = html.match(/<center[^>]*>[\s\S]*?<b[^>]*>(.*?)<\/b>/i)
  if (boldCenterMatch && boldCenterMatch[1]) {
    return boldCenterMatch[1].replace(/<[^>]+>/g, '').trim()
  }

  // 最后备选：使用 title 标签
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].replace(/<[^>]+>/g, '').trim()
  }

  return 'Untitled'
}

/**
 * 提取主要内容
 */
function extractContent(html: string): string {
  // 移除 script 和 style 标签
  let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // 尝试提取 body 内容
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
    content = bodyMatch[1]
  }

  // 转换为 Markdown
  const markdown = turndownService.turndown(content)

  // 清理多余的空行
  return markdown.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * 提取页面中的所有链接
 */
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const linkRegex = /<a[^>]+href\s*=\s*["']([^"']+)["']/gi

  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]

    // 跳过锚点、邮件、外部链接
    if (href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('javascript:') ||
        href.startsWith('http://') && !href.startsWith(BASE_URL) ||
        href.startsWith('https://') && !href.startsWith(BASE_URL)) {
      continue
    }

    // 构建完整 URL
    let fullUrl = href
    if (href.startsWith('/')) {
      fullUrl = BASE_URL + href
    } else if (!href.startsWith('http')) {
      fullUrl = new URL(href, baseUrl).href
    }

    // 只抓取同域名的链接
    if (fullUrl.startsWith(BASE_URL)) {
      links.push(fullUrl)
    }
  }

  return [...new Set(links)] // 去重
}

/**
 * 从 URL 生成文件路径
 */
function urlToFilePath(url: string): string {
  let path = url.replace(BASE_URL, '')

  // 移除查询参数
  path = path.split('?')[0]

  // 如果是目录，添加 index.md
  if (path.endsWith('/') || path === '') {
    path += 'index.md'
  } else if (!path.endsWith('.md')) {
    // 移除 .html 后缀，添加 .md
    path = path.replace(/\.html?$/, '') + '.md'
  }

  return join(OUTPUT_DIR, path)
}

/**
 * 从 URL 生成 source 路径（用于 frontmatter）
 */
function urlToSource(url: string): string {
  let path = url.replace(BASE_URL + '/', '')
  path = path.split('?')[0]
  return path.replace(/\.html?$/, '').replace(/\/$/, '')
}

/**
 * 抓取单个页面
 */
async function fetchPage(url: string): Promise<PageData | null> {
  try {
    console.log(`📥 抓取: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InsideDollBot/1.0)'
      }
    })

    if (!response.ok) {
      console.error(`❌ 失败: ${url} (${response.status})`)
      return null
    }

    // 检测编码（InsideDoll 可能使用 Shift-JIS 或 UTF-8）
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('shift-jis')
    const html = decoder.decode(buffer)

    const title = extractTitle(html)
    const content = extractContent(html)
    const links = extractLinks(html, url)

    return { url, title, content, links }
  } catch (error) {
    console.error(`❌ 错误: ${url}`, error)
    return null
  }
}

/**
 * 保存为 Markdown 文件
 */
async function savePage(data: PageData): Promise<void> {
  const filePath = urlToFilePath(data.url)
  const source = urlToSource(data.url)

  // 创建 frontmatter
  const frontmatter = `---
title: "${data.title.replace(/"/g, '\\"')}"
source: "${source}"
---

`

  const markdown = frontmatter + data.content

  // 确保目录存在
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  // 保存文件
  await writeFile(filePath, markdown, 'utf-8')
  console.log(`✅ 保存: ${filePath}`)
}

/**
 * 递归爬取
 */
async function crawl(startUrl: string, maxDepth: number = MAX_DEPTH): Promise<void> {
  queue.push({ url: startUrl, depth: 0 })

  while (queue.length > 0) {
    const { url, depth } = queue.shift()!

    // 跳过已访问或超过深度限制
    if (visited.has(url) || depth > maxDepth) {
      continue
    }

    visited.add(url)

    // 抓取页面
    const pageData = await fetchPage(url)

    if (pageData) {
      // 保存页面
      await savePage(pageData)

      // 添加新链接到队列
      if (depth < maxDepth) {
        for (const link of pageData.links) {
          if (!visited.has(link)) {
            queue.push({ url: link, depth: depth + 1 })
          }
        }
      }
    }

    // 延迟，避免过载服务器
    await new Promise(resolve => setTimeout(resolve, DELAY_MS))
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始爬取 InsideDoll 网站...')
  console.log(`📍 起始 URL: ${BASE_URL}`)
  console.log(`📁 输出目录: ${OUTPUT_DIR}`)
  console.log(`⏱️  请求间隔: ${DELAY_MS}ms`)
  console.log(`🔢 最大深度: ${MAX_DEPTH}`)
  console.log()

  const startTime = Date.now()

  await crawl(BASE_URL + '/main')

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log()
  console.log('✅ 爬取完成！')
  console.log(`📊 总页面数: ${visited.size}`)
  console.log(`⏱️  总耗时: ${duration}秒`)
}

// 运行
main().catch(console.error)
