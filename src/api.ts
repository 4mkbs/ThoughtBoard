// One API for the renderer. In the desktop app, requests go to the Electron main
// process over IPC. In the browser, the same requests are handled here and posts
// are kept in localStorage.
import { type Post, DEFAULT_POSTS } from '../shared/posts'

export const isElectron = typeof window.ipcRenderer !== 'undefined'

type Result = { success: boolean; error?: string; filePath?: string; importedCount?: number; posts?: Post[] }

const STORAGE_KEY = 'thoughtboard_posts'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

function sortNewestFirst(posts: Post[]): Post[] {
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function writeDb(posts: Post[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function readDb(): Post[] {
  let posts: Post[] = []
  let mustWrite = false
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    mustWrite = true
  } else {
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) throw new Error('not an array')
      posts = parsed
    } catch {
      // Keep the unreadable data under another key instead of losing it
      localStorage.setItem(`${STORAGE_KEY}_corrupt_${Date.now()}`, raw)
      mustWrite = true
    }
  }
  for (const defaultPost of DEFAULT_POSTS) {
    if (!posts.some(p => p.id === defaultPost.id)) {
      posts.push(defaultPost)
      mustWrite = true
    }
  }
  if (mustWrite) writeDb(sortNewestFirst(posts))
  return posts
}

function cleanImported(imported: unknown): Post[] {
  if (!Array.isArray(imported)) throw new Error('Invalid backup file format: Must be a JSON array')
  const now = new Date().toISOString()
  return imported.map((post: any) => {
    if (
      !post || typeof post !== 'object' ||
      !isNonEmptyString(post.id) || !isNonEmptyString(post.title) ||
      !isNonEmptyString(post.content) || !isNonEmptyString(post.author)
    ) {
      throw new Error('Invalid backup file: Missing required post fields')
    }
    const createdAt = isValidDate(post.createdAt) ? post.createdAt : now
    return {
      id: post.id, title: post.title, content: post.content, author: post.author,
      createdAt, updatedAt: isValidDate(post.updatedAt) ? post.updatedAt : createdAt
    }
  })
}

function pickJsonFile(): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null))
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}

function requireOwnPost(posts: Post[], id: string, currentUser: unknown, action: string): number {
  if (!isNonEmptyString(currentUser)) throw new Error(`User must be logged in to ${action} a post`)
  const index = posts.findIndex(p => p.id === id)
  if (index === -1) throw new Error('Post not found')
  if (posts[index].author !== currentUser) {
    throw new Error(`Permission denied: You can only ${action} your own posts`)
  }
  return index
}

async function webInvoke(channel: string, args: any = {}): Promise<any> {
  switch (channel) {
    case 'get-posts':
      return readDb()

    case 'create-post': {
      const { title, content, author } = args
      if (!isNonEmptyString(author)) throw new Error('Author is required')
      if (!isNonEmptyString(title)) throw new Error('Title is required')
      if (!isNonEmptyString(content)) throw new Error('Content is required')
      const posts = readDb()
      const now = new Date().toISOString()
      posts.unshift({
        id: crypto.randomUUID(), title: title.trim(), content: content.trim(),
        author: author.trim(), createdAt: now, updatedAt: now
      })
      writeDb(posts)
      return posts
    }

    case 'update-post': {
      const { id, title, content, currentUser } = args
      if (!isNonEmptyString(title)) throw new Error('Title is required')
      if (!isNonEmptyString(content)) throw new Error('Content is required')
      const posts = readDb()
      const index = requireOwnPost(posts, id, currentUser, 'edit')
      posts[index] = { ...posts[index], title: title.trim(), content: content.trim(), updatedAt: new Date().toISOString() }
      writeDb(posts)
      return posts
    }

    case 'delete-post': {
      const posts = readDb()
      posts.splice(requireOwnPost(posts, args.id, args.currentUser, 'delete'), 1)
      writeDb(posts)
      return posts
    }

    case 'get-db-path':
      return 'Saved in this browser (localStorage). Clearing site data deletes it, so export backups regularly.'

    case 'export-posts': {
      const blob = new Blob([JSON.stringify(readDb(), null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'thoughtboard_backup.json'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return { success: true } satisfies Result
    }

    case 'import-posts': {
      const file = await pickJsonFile()
      if (!file) return { success: false, error: 'Cancelled' } satisfies Result
      try {
        const cleaned = cleanImported(JSON.parse(await file.text()))
        const merged = readDb()
        let importedCount = 0
        for (const post of cleaned) {
          if (!merged.some(p => p.id === post.id)) {
            merged.push(post)
            importedCount++
          }
        }
        writeDb(sortNewestFirst(merged))
        return { success: true, importedCount, posts: merged } satisfies Result
      } catch (err: any) {
        return { success: false, error: err.message } satisfies Result
      }
    }

    // Desktop-only actions: nothing to do in a browser tab
    case 'window-minimize':
    case 'window-maximize':
    case 'window-close':
    case 'open-db-folder':
      return undefined

    default:
      throw new Error(`Unknown request: ${channel}`)
  }
}

export function invoke(channel: string, args?: unknown): Promise<any> {
  return isElectron ? window.ipcRenderer.invoke(channel, args) : webInvoke(channel, args)
}
