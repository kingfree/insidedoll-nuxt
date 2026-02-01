#!/usr/bin/env tsx
/**
 * 生成导航目录结构
 * 分析所有文件并生成分层导航索引
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, relative, dirname, basename } from 'path'

const CONTENT_DIR = join(process.cwd(), 'content')
const JA_DIR = join(CONTENT_DIR, 'ja')

interface FileNode {
  path: string
  relativePath: string
  title: string
  source: string
  type: 'file' | 'directory'
  children?: FileNode[]
  count?: number
}

interface NavSection {
  name: string
  title: string
  description: string
  path: string
  count: number
  subsections?: NavSection[]
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

async function scanDirectory(dir: string, rootDir: string): Promise<FileNode[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nodes: FileNode[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = relative(rootDir, fullPath)

    if (entry.isDirectory()) {
      const children = await scanDirectory(fullPath, rootDir)
      nodes.push({
        path: fullPath,
        relativePath,
        title: entry.name,
        source: relativePath,
        type: 'directory',
        children,
        count: children.length
      })
    } else if (entry.name.endsWith('.md')) {
      const frontmatter = await extractFrontmatter(fullPath)
      nodes.push({
        path: fullPath,
        relativePath,
        title: frontmatter?.title || entry.name,
        source: frontmatter?.source || relativePath,
        type: 'file'
      })
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.relativePath.localeCompare(b.relativePath)
  })
}

async function analyzeStructure() {
  console.log('📁 分析目录结构...\n')

  const rootFiles: FileNode[] = []
  const directories = new Map<string, FileNode[]>()

  const entries = await readdir(JA_DIR, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(JA_DIR, entry.name)

    if (entry.isDirectory()) {
      const children = await scanDirectory(fullPath, JA_DIR)
      const fileCount = countFiles(children)
      directories.set(entry.name, children)

      console.log(`📂 ${entry.name.padEnd(30)} ${fileCount.toString().padStart(4)} 个文件`)
    } else if (entry.name.endsWith('.md')) {
      const frontmatter = await extractFrontmatter(fullPath)
      rootFiles.push({
        path: fullPath,
        relativePath: entry.name,
        title: frontmatter?.title || entry.name,
        source: frontmatter?.source || entry.name,
        type: 'file'
      })
    }
  }

  console.log(`📄 根目录文件                      ${rootFiles.length.toString().padStart(4)} 个文件`)
  console.log()

  return { rootFiles, directories }
}

function countFiles(nodes: FileNode[]): number {
  let count = 0
  for (const node of nodes) {
    if (node.type === 'file') {
      count++
    } else if (node.children) {
      count += countFiles(node.children)
    }
  }
  return count
}

async function generateNavigationStructure() {
  const { rootFiles, directories } = await analyzeStructure()

  // 定义导航结构
  const navigation: NavSection[] = [
    {
      name: 'main-pages',
      title: '主要页面',
      description: '网站的主要导航页面',
      path: '/',
      count: 0,
      subsections: [
        { name: 'index', title: '首页', description: '年龄确认页', path: 'index', count: 1 },
        { name: 'main', title: '主页', description: '网站主导航', path: 'main', count: 1 },
        { name: 'info', title: '简介', description: '网站概要', path: 'info', count: 1 },
        { name: 'wnew', title: '最新消息', description: '更新通知', path: 'wnew', count: 1 },
      ]
    },
    {
      name: 'stories',
      title: '小说作品',
      description: '美少女着装主题小说',
      path: '/stories',
      count: 0,
      subsections: [
        {
          name: 'story01',
          title: 'とん太的作品',
          description: '主要故事系列',
          path: 'story01',
          count: directories.get('story01') ? countFiles(directories.get('story01')!) : 0
        },
        {
          name: 'storyn1',
          title: '成田君的故事',
          description: '成田系列故事',
          path: 'storyn1',
          count: directories.get('storyn1') ? countFiles(directories.get('storyn1')!) : 0
        },
        {
          name: 'storyh1',
          title: '羽田君的故事',
          description: '羽田系列故事',
          path: 'storyh1',
          count: directories.get('storyh1') ? countFiles(directories.get('storyh1')!) : 0
        },
        {
          name: 'storyg1',
          title: 'お人形達の学園',
          description: '人偶学园系列',
          path: 'storyg1',
          count: directories.get('storyg1') ? countFiles(directories.get('storyg1')!) : 0
        }
      ]
    },
    {
      name: 'single-stories',
      title: '单篇故事',
      description: '根目录下的独立故事文件',
      path: '/single-stories',
      count: rootFiles.filter(f => f.relativePath.startsWith('story_')).length
    },
    {
      name: 'interviews',
      title: '访谈 & 互动',
      description: '问答与访谈内容',
      path: '/interviews',
      count: 0,
      subsections: [
        {
          name: 'intvarc',
          title: '访谈存档',
          description: 'ザ・インタビューズ存档',
          path: 'intvarc',
          count: directories.get('intvarc') ? countFiles(directories.get('intvarc')!) : 0
        },
        {
          name: 'theinterviews',
          title: '访谈索引',
          description: '访谈索引页面',
          path: 'theinterviews_index',
          count: rootFiles.filter(f => f.relativePath.startsWith('theinterviews_')).length
        }
      ]
    },
    {
      name: 'blog',
      title: '博客',
      description: '2010-2012年的博客文章',
      path: 'blog',
      count: directories.get('blog') ? countFiles(directories.get('blog')!) : 0
    },
    {
      name: 'other',
      title: '其他内容',
      description: '专栏、链接等其他内容',
      path: '/other',
      count: 0,
      subsections: [
        { name: 'column', title: '专栏', description: '个人专栏文章', path: 'column', count: 2 },
        { name: 'novel_info', title: '同人小说', description: '出版书籍信息', path: 'novel_info', count: 4 },
        { name: 'link', title: '链接', description: '友情链接', path: 'link', count: 1 },
        { name: 'kigoffinfo', title: '活动方针', description: 'オフ会方针', path: 'kigoffinfo', count: 1 },
      ]
    }
  ]

  // 计算总数
  for (const section of navigation) {
    if (section.subsections) {
      section.count = section.subsections.reduce((sum, sub) => sum + sub.count, 0)
    }
  }

  return { navigation, rootFiles, directories }
}

async function generateMarkdownNav() {
  const { navigation, rootFiles, directories } = await generateNavigationStructure()

  let markdown = `# InsideDoll 网站导航结构

> 自动生成于 ${new Date().toLocaleString('zh-CN')}

## 📊 整体统计

`

  let totalFiles = rootFiles.length
  for (const [_, nodes] of directories) {
    totalFiles += countFiles(nodes)
  }

  markdown += `- **总文件数**: ${totalFiles}\n`
  markdown += `- **根目录文件**: ${rootFiles.length}\n`
  markdown += `- **子目录**: ${directories.size}\n\n`

  markdown += `## 🗂️ 导航结构\n\n`

  for (const section of navigation) {
    markdown += `### ${section.title}\n\n`
    markdown += `${section.description}\n\n`
    markdown += `- **路径**: \`${section.path}\`\n`
    markdown += `- **文件数**: ${section.count}\n\n`

    if (section.subsections) {
      for (const subsection of section.subsections) {
        markdown += `#### ${subsection.title}\n\n`
        markdown += `${subsection.description}\n\n`
        markdown += `- 路径: \`${subsection.path}\`\n`
        markdown += `- 文件数: ${subsection.count}\n\n`
      }
    }

    markdown += `---\n\n`
  }

  // 详细目录树
  markdown += `## 📁 详细目录树\n\n`
  markdown += `### 根目录文件\n\n`

  // 主要页面
  const mainPages = rootFiles.filter(f =>
    ['index.md', 'main.md', 'info.md', 'wnew.md', 'link.md'].includes(f.relativePath)
  )
  markdown += `#### 主要页面\n\n`
  for (const file of mainPages) {
    markdown += `- [\`${file.relativePath}\`](ja/${file.source}) - ${file.title}\n`
  }
  markdown += `\n`

  // 单篇故事
  const storyFiles = rootFiles.filter(f => f.relativePath.startsWith('story_'))
  if (storyFiles.length > 0) {
    markdown += `#### 单篇故事 (${storyFiles.length}个)\n\n`
    for (const file of storyFiles.slice(0, 20)) {
      markdown += `- [\`${file.relativePath}\`](ja/${file.source}) - ${file.title}\n`
    }
    if (storyFiles.length > 20) {
      markdown += `- ... 还有 ${storyFiles.length - 20} 个文件\n`
    }
    markdown += `\n`
  }

  // 其他文件
  const otherFiles = rootFiles.filter(f =>
    !['index.md', 'main.md', 'info.md', 'wnew.md', 'link.md'].includes(f.relativePath) &&
    !f.relativePath.startsWith('story_')
  )
  if (otherFiles.length > 0) {
    markdown += `#### 其他文件\n\n`
    for (const file of otherFiles) {
      markdown += `- [\`${file.relativePath}\`](ja/${file.source}) - ${file.title}\n`
    }
    markdown += `\n`
  }

  // 子目录
  markdown += `### 子目录\n\n`

  const majorDirs = ['story01', 'storyn1', 'storyh1', 'storyg1', 'intvarc', 'blog']
  for (const dirName of majorDirs) {
    const nodes = directories.get(dirName)
    if (!nodes) continue

    const fileCount = countFiles(nodes)
    markdown += `#### \`${dirName}/\` (${fileCount} 个文件)\n\n`

    // 显示子目录结构
    const subdirs = nodes.filter(n => n.type === 'directory')
    if (subdirs.length > 0) {
      markdown += `**子目录**: `
      markdown += subdirs.map(d => `\`${d.title}/\` (${d.count})`).join(', ')
      markdown += `\n\n`
    }

    // 显示部分文件
    const files = nodes.filter(n => n.type === 'file')
    if (files.length > 0) {
      markdown += `**文件示例**:\n\n`
      for (const file of files.slice(0, 5)) {
        markdown += `- [\`${file.relativePath}\`](ja/${file.source}) - ${file.title}\n`
      }
      if (files.length > 5) {
        markdown += `- ... 还有 ${files.length - 5} 个文件\n`
      }
      markdown += `\n`
    }
  }

  return markdown
}

async function generateJsonNav() {
  const { navigation, directories } = await generateNavigationStructure()

  // 构建完整的树形结构
  const fullTree: any = {
    navigation,
    directories: {}
  }

  for (const [dirName, nodes] of directories) {
    fullTree.directories[dirName] = buildTree(nodes)
  }

  return fullTree
}

function buildTree(nodes: FileNode[]): any {
  return nodes.map(node => ({
    name: basename(node.relativePath),
    path: node.relativePath,
    title: node.title,
    type: node.type,
    ...(node.type === 'directory' && {
      count: node.count,
      children: node.children ? buildTree(node.children) : []
    })
  }))
}

// CLI
const format = process.argv[2] || 'markdown'

if (format === 'markdown' || format === 'md') {
  generateMarkdownNav().then(async markdown => {
    const outputPath = join(process.cwd(), 'NAVIGATION.md')
    await writeFile(outputPath, markdown, 'utf-8')
    console.log(`\n✅ 导航结构已保存到: ${outputPath}`)
  })
} else if (format === 'json') {
  generateJsonNav().then(async tree => {
    const outputPath = join(process.cwd(), 'navigation-structure.json')
    await writeFile(outputPath, JSON.stringify(tree, null, 2), 'utf-8')
    console.log(`\n✅ 导航结构已保存到: ${outputPath}`)
  })
} else if (format === 'analyze') {
  analyzeStructure().then(() => {
    console.log('\n✅ 分析完成')
  })
} else {
  console.log(`
导航生成工具

用法:
  npm run nav:generate [格式]

格式选项:
  markdown, md    生成 Markdown 格式导航 (默认)
  json            生成 JSON 格式导航树
  analyze         仅分析并显示统计

示例:
  npm run nav:generate
  npm run nav:generate json
  npm run nav:generate analyze
`)
}
