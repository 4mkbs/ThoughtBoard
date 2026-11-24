import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { type Post, DEFAULT_POSTS } from '../shared/posts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let dbPath: string | null = null
function getDbPath() {
  if (!dbPath) {
    dbPath = path.join(app.getPath('userData'), 'thoughts_db.json')
  }
  return dbPath
}

async function readDb(): Promise<Post[]> {
  const filePath = getDbPath()
  let posts: Post[] = []
  let mustWrite = false
  
  let raw: string | null = null
  try {
    raw = await fs.readFile(filePath, 'utf-8')
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
    mustWrite = true // First run: no database yet
  }

  if (raw !== null) {
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) throw new Error('Database is not an array')
      posts = parsed
    } catch {
      // Keep the unreadable file instead of silently overwriting the user's data
      const backupPath = `${filePath}.corrupt-${Date.now()}`
      await fs.copyFile(filePath, backupPath)
      console.error(`Database was unreadable; saved a copy to ${backupPath}`)
      posts = []
      mustWrite = true
    }
  }

  // Ensure all 20 book- IDs are in the posts database
  for (const defaultPost of DEFAULT_POSTS) {
    if (!posts.some(p => p.id === defaultPost.id)) {
      posts.push(defaultPost)
      mustWrite = true
    }
  }

  if (mustWrite) {
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    await writeDb(posts)
  }

  return posts
}

// Write to a temp file then rename, so a crash mid-write can't leave a half-written database
async function writeDb(posts: Post[]): Promise<void> {
  const filePath = getDbPath()
  const tmpPath = `${filePath}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(posts, null, 2), 'utf-8')
  await fs.rename(tmpPath, filePath)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

// IPC Handlers
ipcMain.handle('get-posts', async () => {
  return await readDb()
})

ipcMain.handle('create-post', async (_event, { title, content, author }) => {
  if (!isNonEmptyString(author)) {
    throw new Error('Author is required')
  }
  if (!isNonEmptyString(title)) {
    throw new Error('Title is required')
  }
  if (!isNonEmptyString(content)) {
    throw new Error('Content is required')
  }

  const posts = await readDb()
  const newPost: Post = {
    id: randomUUID(),
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  posts.unshift(newPost)
  await writeDb(posts)
  return posts
})

ipcMain.handle('update-post', async (_event, { id, title, content, currentUser }) => {
  if (!isNonEmptyString(currentUser)) {
    throw new Error('User must be logged in to update a post')
  }
  if (!isNonEmptyString(title)) {
    throw new Error('Title is required')
  }
  if (!isNonEmptyString(content)) {
    throw new Error('Content is required')
  }
  
  const posts = await readDb()
  const postIndex = posts.findIndex(p => p.id === id)
  if (postIndex === -1) {
    throw new Error('Post not found')
  }
  
  const post = posts[postIndex]
  if (post.author !== currentUser) {
    throw new Error('Permission denied: You can only edit your own posts')
  }
  
  posts[postIndex] = {
    ...post,
    title: title.trim(),
    content: content.trim(),
    updatedAt: new Date().toISOString()
  }
  
  await writeDb(posts)
  return posts
})

ipcMain.handle('delete-post', async (_event, { id, currentUser }) => {
  if (!isNonEmptyString(currentUser)) {
    throw new Error('User must be logged in to delete a post')
  }
  
  const posts = await readDb()
  const postIndex = posts.findIndex(p => p.id === id)
  if (postIndex === -1) {
    throw new Error('Post not found')
  }
  
  const post = posts[postIndex]
  if (post.author !== currentUser) {
    throw new Error('Permission denied: You can only delete your own posts')
  }
  
  posts.splice(postIndex, 1)
  await writeDb(posts)
  return posts
})

// Window Control IPC Handlers
ipcMain.handle('window-minimize', () => {
  if (win) win.minimize()
})

ipcMain.handle('window-maximize', () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.handle('window-close', () => {
  if (win) win.close()
})

ipcMain.handle('open-db-folder', async () => {
  const filePath = getDbPath()
  const dirPath = path.dirname(filePath)
  await shell.openPath(dirPath)
})

ipcMain.handle('get-db-path', () => {
  return getDbPath()
})

ipcMain.handle('export-posts', async () => {
  if (!win) return { success: false, error: 'No active window' }
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Export Board Backup',
    defaultPath: path.join(app.getPath('downloads'), 'thoughtboard_backup.json'),
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  })
  if (filePath) {
    try {
      const posts = await readDb()
      await fs.writeFile(filePath, JSON.stringify(posts, null, 2), 'utf-8')
      return { success: true, filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
  return { success: false, error: 'Cancelled' }
})

ipcMain.handle('import-posts', async () => {
  if (!win) return { success: false, error: 'No active window' }
  const { filePaths } = await dialog.showOpenDialog(win, {
    title: 'Import Board Backup',
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  })
  if (filePaths && filePaths.length > 0) {
    try {
      const data = await fs.readFile(filePaths[0], 'utf-8')
      const imported = JSON.parse(data)
      if (!Array.isArray(imported)) {
        throw new Error('Invalid backup file format: Must be a JSON array')
      }
      
      const now = new Date().toISOString()
      const cleaned: Post[] = imported.map((post: any) => {
        if (
          !post || typeof post !== 'object' ||
          !isNonEmptyString(post.id) || !isNonEmptyString(post.title) ||
          !isNonEmptyString(post.content) || !isNonEmptyString(post.author)
        ) {
          throw new Error('Invalid backup file: Missing required post fields')
        }
        // Keep only known fields so unexpected data can't end up in the database
        const createdAt = isValidDate(post.createdAt) ? post.createdAt : now
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.author,
          createdAt,
          updatedAt: isValidDate(post.updatedAt) ? post.updatedAt : createdAt
        }
      })

      const currentPosts = await readDb()
      const merged = [...currentPosts]
      let importedCount = 0
      for (const post of cleaned) {
        if (!merged.some(p => p.id === post.id)) {
          merged.push(post)
          importedCount++
        }
      }
      
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      await writeDb(merged)
      return { success: true, importedCount, posts: merged }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
  return { success: false, error: 'Cancelled' }
})




// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    frame: false,
    width: 1100,
    height: 750,
    minWidth: 850,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
