#!/usr/bin/env tsx
/**
 * InsideDoll 高级爬虫
 * 使用 Cheerio 更精确地解析 HTML
 */

import { writeFile, mkdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import iconv from 'iconv-lite'

const BASE_URL = 'https://insidedoll.ddo.jp'
const OUTPUT_DIR = join(process.cwd(), 'content/ja')
const DELAY_MS = 1000
const MAX_DEPTH = 5
const MAX_CONCURRENT = 3 // 并发请求数

const visited = new Set<string>()
const queue: Array<{ url: string; depth: number }> = []
const processing = new Set<string>()

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// 保留换行符
turndownService.addRule('preserveLineBreaks', {
  filter: ['br'],
  replacement: () => '  \n' // Markdown 的硬换行
})

// 保留 wikilink 格式
turndownService.addRule('preserveWikilinks', {
  filter: (node) => {
    return node.nodeName === 'A' &&
           node.textContent?.includes('戻る') ||
           node.textContent?.includes('次へ') ||
           node.textContent?.includes('目次')
  },
  replacement: (content, node) => {
    const href = (node as HTMLAnchorElement).getAttribute('href') || ''
    return `[[${content}]](${href})`
  }
})

interface PageData {
  url: string
  title: string
  content: string
  links: string[]
  source: string
}

/**
 * 检测并解码 HTML
 */
function decodeHTML(buffer: ArrayBuffer): string {
  // 先尝试检测 BOM
  const uint8Array = new Uint8Array(buffer)

  // UTF-8 BOM
  if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(buffer)
  }

  // 尝试 UTF-8
  try {
    const utf8Text = new TextDecoder('utf-8').decode(buffer)
    // 检查是否有乱码
    if (!utf8Text.includes('\uFFFD')) {
      return utf8Text
    }
  } catch {}

  // 尝试 Shift-JIS (日文网站常用)
  try {
    return iconv.decode(Buffer.from(buffer), 'shift-jis')
  } catch {}

  // 最后尝试 EUC-JP
  try {
    return iconv.decode(Buffer.from(buffer), 'euc-jp')
  } catch {}

  // 默认 UTF-8
  return new TextDecoder('utf-8').decode(buffer)
}

/**
 * 使用 Cheerio 提取标题
 */
function extractTitle($: cheerio.CheerioAPI): string {
  // 查找第一个 align="CENTER" 的 table/tr/td 中的 <b> 标签
  const centerBold = $('table[align="CENTER"] b, tr[align="CENTER"] b, td[align="CENTER"] b').first()
  if (centerBold.length) {
    return centerBold.text().trim()
  }

  // 查找 center 标签中的 b 标签
  const centerTagBold = $('center b').first()
  if (centerTagBold.length) {
    return centerTagBold.text().trim()
  }

  // 备选：title 标签
  const title = $('title').text().trim()
  if (title && title !== 'Inside Doll') {
    return title
  }

  return 'Untitled'
}

/**
 * 提取主要内容
 */
function extractContent($: cheerio.CheerioAPI): string {
  // 移除脚本和样式
  $('script, style, noscript').remove()

  // 移除导航栏等不需要的部分（根据实际情况调整）
  $('.navigation, .header, .footer, #navigation, #header, #footer').remove()

  // 获取 body 内容
  let content = $('body').html() || ''

  // 转换为 Markdown
  let markdown = turndownService.turndown(content)

  // 清理多余空行
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  // 移除 HTML 注释
  markdown = markdown.replace(/<!--[\s\S]*?-->/g, '')

  return markdown.trim()
}

/**
 * 提取所有链接
 */
function extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links: string[] = []

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href')
    if (!href) return

    // 跳过特殊链接
    if (href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('javascript:') ||
        href.includes('twitter.com') ||
        href.includes('ask.fm') ||
        href.includes('theinterviews.jp')) {
      return
    }

    // 构建完整 URL
    let fullUrl: string
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        fullUrl = href
      } else if (href.startsWith('/')) {
        fullUrl = BASE_URL + href
      } else {
        fullUrl = new URL(href, baseUrl).href
      }

      // 只抓取同域名
      if (fullUrl.startsWith(BASE_URL)) {
        links.push(fullUrl)
      }
    } catch (e) {
      // 忽略无效 URL
    }
  })

  return [...new Set(links)]
}

/**
 * URL 转文件路径
 */
function urlToFilePath(url: string): string {
  let path = url.replace(BASE_URL, '')
  path = path.split('?')[0].split('#')[0]

  if (path === '' || path === '/') {
    path = '/index.md'
  } else if (path.endsWith('/')) {
    path += 'index.md'
  } else if (!path.endsWith('.md')) {
    path = path.replace(/\.html?$/i, '') + '.md'
  }

  return join(OUTPUT_DIR, path)
}

/**
 * URL 转 source
 */
function urlToSource(url: string): string {
  let path = url.replace(BASE_URL + '/', '')
  path = path.split('?')[0].split('#')[0]
  return path.replace(/\.html?$/i, '').replace(/\/$/, '') || 'index'
}

/**
 * 抓取页面
 */
async function fetchPage(url: string): Promise<PageData | null> {
  try {
    console.log(`📥 [${processing.size}/${MAX_CONCURRENT}] ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      }
    })

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}: ${url}`)
      return null
    }

    const buffer = await response.arrayBuffer()
    const html = decodeHTML(buffer)

    const $ = cheerio.load(html)
    const title = extractTitle($)
    const content = extractContent($)
    const links = extractLinks($, url)
    const source = urlToSource(url)

    return { url, title, content, links, source }
  } catch (error) {
    console.error(`❌ 错误: ${url}`, error)
    return null
  }
}

/**
 * 保存页面
 */
async function savePage(data: PageData): Promise<void> {
  const filePath = urlToFilePath(data.url)

  const frontmatter = `---
title: "${data.title.replace(/"/g, '\\"')}"
source: "${data.source}"
---

`

  const markdown = frontmatter + data.content

  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  await writeFile(filePath, markdown, 'utf-8')
  console.log(`✅ 保存: ${data.source}`)
}

/**
 * 处理单个 URL
 */
async function processUrl(url: string, depth: number): Promise<string[]> {
  processing.add(url)

  try {
    const pageData = await fetchPage(url)

    if (pageData) {
      await savePage(pageData)
      return depth < MAX_DEPTH ? pageData.links : []
    }

    return []
  } finally {
    processing.delete(url)
  }
}

/**
 * 主爬取逻辑（带并发控制）
 */
async function crawl(startUrl: string): Promise<void> {
  queue.push({ url: startUrl, depth: 0 })

  while (queue.length > 0 || processing.size > 0) {
    // 控制并发数
    while (queue.length > 0 && processing.size < MAX_CONCURRENT) {
      const item = queue.shift()
      if (!item) break

      const { url, depth } = item

      if (visited.has(url)) continue
      visited.add(url)

      // 启动异步处理
      processUrl(url, depth).then(links => {
        // 添加新链接
        for (const link of links) {
          if (!visited.has(link)) {
            queue.push({ url: link, depth: depth + 1 })
          }
        }
      })

      // 延迟
      await new Promise(resolve => setTimeout(resolve, DELAY_MS / MAX_CONCURRENT))
    }

    // 等待一批完成
    if (processing.size >= MAX_CONCURRENT) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 InsideDoll 高级爬虫启动')
  console.log(`📍 起始: ${BASE_URL}/main`)
  console.log(`📁 输出: ${OUTPUT_DIR}`)
  console.log(`⚡️ 并发: ${MAX_CONCURRENT}`)
  console.log(`🔢 深度: ${MAX_DEPTH}`)
  console.log()

  const startTime = Date.now()

  await crawl(BASE_URL + '/main')

  // 等待所有处理完成
  while (processing.size > 0) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log()
  console.log('✅ 爬取完成！')
  console.log(`📊 总页面: ${visited.size}`)
  console.log(`⏱️  耗时: ${duration}s`)
}

main().catch(console.error)
