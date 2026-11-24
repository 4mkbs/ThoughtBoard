import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

const DEFAULT_POSTS: Post[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby (F. Scott Fitzgerald)',
    content: 'Set in the roaring twenties, this classic explores themes of wealth, love, and class. The story is narrated by Nick Carraway, who becomes entangled in the life of his neighbor, the mysterious Jay Gatsby. Gatsby is obsessed with reuniting with his former love, Daisy Buchanan. The novel serves as a critique of the American Dream, showing that wealth alone cannot buy happiness or erase the past.',
    author: 'classic_library',
    createdAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 20).toISOString()
  },
  {
    id: 'book-2',
    title: 'The Art of War (Sun Tzu)',
    content: 'An ancient Chinese military treatise attributed to Sun Tzu. The book contains 13 chapters, each dedicated to a different aspect of warfare and military strategy. Its core philosophy is that winning without fighting is the ultimate achievement. It emphasizes flexibility, knowing the enemy, and using deception, making it highly influential in modern business and leadership.',
    author: 'sun_tzu',
    createdAt: new Date(Date.now() - 3600000 * 24 * 19).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 19).toISOString()
  },
  {
    id: 'book-3',
    title: 'A Brief History of Time (Stephen Hawking)',
    content: 'Stephen Hawking explains complex cosmological concepts like the Big Bang, black holes, and light cones to non-specialists. The book traces the history of scientific models of the universe from Ptolemy and Copernicus to general relativity and quantum mechanics. Hawking seeks to answer fundamental questions about the origin and ultimate fate of our universe.',
    author: 'science_hub',
    createdAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString()
  },
  {
    id: 'book-4',
    title: 'Clean Code (Robert C. Martin)',
    content: 'This programming classic emphasizes writing readable and maintainable code. Robert C. Martin argues that code is clean if it is easy to understand and easy to change. He introduces principles for naming, writing compact functions, error handling, unit testing, and refactoring, teaching developers that good code requires craftsmanship.',
    author: 'clean_code_bot',
    createdAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 17).toISOString()
  },
  {
    id: 'book-5',
    title: 'Atomic Habits (James Clear)',
    content: 'James Clear presents a framework for building good habits and breaking bad ones. He argues that tiny changes (atomic habits) compound over time to produce massive results. The book is built around the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying, focusing on identity-based habit building.',
    author: 'self_improve',
    createdAt: new Date(Date.now() - 3600000 * 24 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 16).toISOString()
  },
  {
    id: 'book-6',
    title: '1984 (George Orwell)',
    content: 'A classic dystopian novel set in a totalitarian state ruled by Big Brother. The protagonist, Winston Smith, works for the Ministry of Truth, rewriting history to suit the Party\'s narrative. He rebels by starting a secret diary and entering a relationship with Julia. The book warns against government surveillance, psychological control, and the manipulation of truth.',
    author: 'dystopia_reader',
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  },
  {
    id: 'book-7',
    title: 'Sapiens: A Brief History of Humankind (Yuval Noah Harari)',
    content: 'Yuval Noah Harari surveys the history of human species, Homo sapiens, from the stone age to the 21st century. He explores three major revolutions: Cognitive, Agricultural, and Scientific. Harari argues that what makes Sapiens unique is our ability to create and believe in shared myths, such as money, religion, and nations, which allow us to cooperate in large numbers.',
    author: 'history_buff',
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
  },
  {
    id: 'book-8',
    title: 'Thinking, Fast and Slow (Daniel Kahneman)',
    content: 'Nobel laureate Daniel Kahneman explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional. System 2 is slower, more deliberative, and logical. Kahneman details cognitive biases and heuristics, showing how we make decisions under uncertainty and where our logical thinking often fails us.',
    author: 'psych_student',
    createdAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 13).toISOString()
  },
  {
    id: 'book-9',
    title: 'The Lean Startup (Eric Ries)',
    content: 'Eric Ries introduces a methodology for building successful startups in conditions of extreme uncertainty. He proposes the Build-Measure-Learn feedback loop. Startups should build a Minimum Viable Product (MVP) to test hypotheses, measure customer response, and learn whether to pivot (change direction) or persevere, reducing wasted resources.',
    author: 'startup_founder',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
  },
  {
    id: 'book-10',
    title: 'Meditations (Marcus Aurelius)',
    content: 'A collection of personal writings by Roman Emperor Marcus Aurelius, recorded as private notes to himself. The book is a cornerstone of Stoic philosophy, focusing on self-discipline, duty, logic, and acceptance of death. Marcus Aurelius counsels himself on how to maintain inner peace, control his emotional reactions, and act with virtue despite the chaos of leadership.',
    author: 'stoic_mind',
    createdAt: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 11).toISOString()
  },
  {
    id: 'book-11',
    title: 'The Alchemist (Paulo Coelho)',
    content: 'An allegorical novel about Santiago, an Andalusian shepherd boy who dreams of finding treasure in the Egyptian pyramids. Along his journey, he learns about listening to his heart, reading omens scattered along life\'s path, and understanding the Soul of the World. The novel emphasizes the importance of pursuing one\'s Personal Legend (destiny).',
    author: 'dream_seeker',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: 'book-12',
    title: 'Deep Work (Cal Newport)',
    content: 'Cal Newport argues that the ability to focus without distraction (deep work) is becoming increasingly rare and valuable in our modern economy. He contrasts deep work with shallow work (emails, meetings, social media) and provides rules for training focus, embracing boredom, quitting social media, and draining the shallows to achieve cognitive depth.',
    author: 'productivity_hacks',
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString()
  },
  {
    id: 'book-13',
    title: 'Zero to One (Peter Thiel)',
    content: 'Peter Thiel offers a philosophy on startup strategy and innovation. He argues that true progress comes from going from zero to one (creating something completely new and monopolistic) rather than one to n (copying existing models globally). Thiel outlines critical business questions regarding technology, timing, monopoly, team, and distribution.',
    author: 'venture_capital',
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    id: 'book-14',
    title: 'Design Patterns (Erich Gamma et al.)',
    content: 'Often referred to as the "Gang of Four" book, this software engineering classic defines 23 reusable solutions to common software design problems. It divides patterns into three categories: Creational (e.g., Singleton, Factory), Structural (e.g., Adapter, Decorator), and Behavioral (e.g., Observer, Strategy), establishing a common vocabulary for developers.',
    author: 'pattern_architect',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: 'book-15',
    title: 'The Pragmatic Programmer (Andy Hunt & Dave Thomas)',
    content: 'A guide filled with practical advice for programmers to improve their craft. It covers topics like career development, personal responsibility, keeping code DRY (Don\'t Repeat Yourself), writing flexible code, testing, and debugging. It teaches that being pragmatic means taking control of your career and focusing on continuous learning.',
    author: 'coding_wisdom',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    id: 'book-16',
    title: 'Siddhartha (Hermann Hesse)',
    content: 'A novel about the spiritual journey of self-discovery of a man named Siddhartha during the time of the Gautama Buddha. Siddhartha leaves his wealthy home to find enlightenment, experiencing asceticism, sensual love, wealth, and eventually finding wisdom by a river, learning that truth cannot be taught but must be experienced.',
    author: 'spiritual_read',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: 'book-17',
    title: 'The Selfish Gene (Richard Dawkins)',
    content: 'Richard Dawkins proposes a gene-centric view of evolution. He argues that natural selection operates on genes, not individuals or species, and that organisms are "survival machines" built to propagate genes. Dawkins also introduces the concept of the "meme" to explain how cultural information spreads and evolves analogous to genes.',
    author: 'science_hub',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 'book-18',
    title: 'Smarter Faster Better (Charles Duhigg)',
    content: 'Charles Duhigg explores the science of productivity. He identifies eight key concepts, including motivation, teams (psychological safety), focus, and decision making, that explain how some people and companies get so much done. Duhigg shows that productivity is about making choices in specific ways to govern our minds and energy.',
    author: 'self_improve',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'book-19',
    title: 'Crime and Punishment (Fyodor Dostoevsky)',
    content: 'A psychological novel following Rodion Raskolnikov, a poor former student in St. Petersburg, who plans and executes the murder of an unscrupulous pawnbroker. Raskolnikov believes his intellect justifies the crime, but he is consumed by guilt and paranoia. The novel details his psychological suffering and eventual redemption through love and faith.',
    author: 'classic_library',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'book-20',
    title: 'Man\'s Search for Meaning (Viktor Frankl)',
    content: 'Psychiatrist Viktor Frankl describes his experiences in Nazi concentration camps, including Auschwitz. He uses these observations to outline Logotherapy, his psychotherapeutic method. Frankl argues that we cannot avoid suffering, but we can choose how to cope with it, find meaning in it, and move forward with renewed purpose.',
    author: 'stoic_mind',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
]

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
