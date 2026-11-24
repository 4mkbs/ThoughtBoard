import './style.css'

interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

// State
let currentUser: string | null = localStorage.getItem('thoughtboard_user')
let posts: Post[] = []
let editingPostId: string | null = null
let dbFilePath = 'Loading database path...'

// Toast Notifications Helper
function showToast(message: string, type: 'success' | 'error' = 'success') {
  const container = document.querySelector('.toast-container') || document.createElement('div')
  if (!container.classList.contains('toast-container')) {
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`
  const span = document.createElement('span')
  span.textContent = message // textContent: messages can contain user/file data
  toast.appendChild(span)
  container.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(10px)'
    toast.style.transition = 'all 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Initial UI Structure (including custom titlebar and sliding drawer)
const appEl = document.querySelector<HTMLDivElement>('#app')!
appEl.innerHTML = `
  <div class="window-titlebar">
    <div class="titlebar-brand">
      <span class="titlebar-brand-icon">T</span>
      <span>ThoughtBoard</span>
    </div>
    <div class="titlebar-controls">
      <button class="control-btn" id="win-min" title="Minimize">&mdash;</button>
      <button class="control-btn" id="win-max" title="Maximize">&#9633;</button>
      <button class="control-btn control-btn-close" id="win-close" title="Close">&times;</button>
    </div>
  </div>

  <div class="app-container">
    <header class="header-bar">
      <div class="brand-section">
        <div class="brand-icon">T</div>
        <h1 class="brand-title">ThoughtBoard</h1>
      </div>
      <div class="identity-area" id="identity-area">
        <!-- Trigger button for sliding drawer -->
      </div>
    </header>
    
    <main class="feed-section">
      <div class="feed-header">
        <h2 class="feed-title">Recent Thoughts</h2>
        <span class="feed-count" id="feed-count">0 thoughts</span>
      </div>
      <div class="thoughts-list" id="thoughts-list">
        <!-- Thoughts will go here -->
      </div>
    </main>
  </div>

  <!-- Sliding Drawer & Overlay Backdrop -->
  <div class="drawer-backdrop" id="drawer-backdrop"></div>
  <div class="sliding-drawer" id="sliding-drawer">
    <div class="drawer-header">
      <h3 class="drawer-title">Settings & Editor</h3>
      <button class="drawer-close" id="drawer-close-btn" title="Close Settings">&times;</button>
    </div>
    
    <div class="drawer-identity-box" id="drawer-identity-area">
      <!-- Profile status/form goes here -->
    </div>
    
    <div class="editor-section" id="editor-section">
      <!-- Editor form goes here -->
    </div>
    
    <div class="db-section" id="db-section">
      <!-- DB Storage Info goes here -->
    </div>
  </div>

  <div class="toast-container"></div>
`

// DOM Elements Reference
const identityArea = document.getElementById('identity-area')!
const thoughtsList = document.getElementById('thoughts-list')!
const feedCount = document.getElementById('feed-count')!
const drawerEl = document.getElementById('sliding-drawer')!
const backdropEl = document.getElementById('drawer-backdrop')!
const drawerIdentityArea = document.getElementById('drawer-identity-area')!
const editorSection = document.getElementById('editor-section')!
const dbSection = document.getElementById('db-section')!

// Drawer Toggle Controls
function openDrawer() {
  drawerEl.classList.add('active')
  backdropEl.classList.add('active')
}

function closeDrawer() {
  drawerEl.classList.remove('active')
  backdropEl.classList.remove('active')
}

document.getElementById('drawer-close-btn')!.addEventListener('click', closeDrawer)
backdropEl.addEventListener('click', closeDrawer)

// Window Controls Event Listeners
document.getElementById('win-min')!.addEventListener('click', () => {
  window.ipcRenderer.invoke('window-minimize')
})
document.getElementById('win-max')!.addEventListener('click', () => {
  window.ipcRenderer.invoke('window-maximize')
})
document.getElementById('win-close')!.addEventListener('click', () => {
  window.ipcRenderer.invoke('window-close')
})

// Identity Management
function updateIdentity() {
  // 1. Render trigger button in header bar
  if (currentUser) {
    identityArea.innerHTML = `
      <button class="btn btn-secondary" id="toggle-drawer-btn">
        <span class="user-badge">@${escapeHTML(currentUser)}</span> &nbsp;⚙️ Settings
      </button>
    `
  } else {
    identityArea.innerHTML = `
      <button class="btn btn-primary" id="toggle-drawer-btn">
        ✍️ Write & Settings
      </button>
    `
  }
  document.getElementById('toggle-drawer-btn')!.addEventListener('click', openDrawer)

  // 2. Render user settings/login inside the sliding drawer
  if (currentUser) {
    drawerIdentityArea.innerHTML = `
      <div class="drawer-identity-title">Current Profile</div>
      <div class="identity-active" style="border: none; background: transparent; padding: 0; box-shadow: none;">
        <span>Active User: <span class="user-badge" style="font-size: 1.05rem;">@${escapeHTML(currentUser)}</span></span>
      </div>
      <button class="btn btn-secondary btn-sm" id="logout-btn" style="margin-top: 0.25rem;">Switch Profile</button>
    `
    document.getElementById('logout-btn')!.addEventListener('click', handleLogout)
  } else {
    drawerIdentityArea.innerHTML = `
      <div class="drawer-identity-title">Join Board to Write</div>
      <form class="identity-guest-form" id="login-form" style="display: flex; flex-direction: column; gap: 0.50rem;">
        <input 
          type="text" 
          placeholder="Choose Username" 
          class="input-field" 
          id="username-input" 
          required 
          maxlength="15"
          pattern="[A-Za-z0-9_]+"
          title="Letters, numbers and underscores only"
          style="width: 100%;"
        />
        <button type="submit" class="btn btn-primary btn-sm">Join Board</button>
      </form>
    `
    document.getElementById('login-form')!.addEventListener('submit', handleLogin)
  }

  // Whenever identity changes, re-render editor and post actions
  renderEditor()
  renderPosts()
}

function handleLogin(e: Event) {
  e.preventDefault()
  const input = document.getElementById('username-input') as HTMLInputElement
  const username = input.value.trim().toLowerCase()
  if (username) {
    currentUser = username
    localStorage.setItem('thoughtboard_user', username)
    showToast(`Logged in as @${username}`)
    updateIdentity()
  }
}

function handleLogout() {
  const previousUser = currentUser
  currentUser = null
  editingPostId = null // Cancel editing
  localStorage.removeItem('thoughtboard_user')
  if (previousUser) {
    showToast(`Logged out from @${previousUser}`)
  }
  updateIdentity()
}

// Fetch Posts from Storage
async function fetchPosts() {
  try {
    posts = await window.ipcRenderer.invoke('get-posts')
    renderPosts()
  } catch (error: any) {
    showToast(`Failed to load posts: ${error.message}`, 'error')
  }
}

// Fetch DB File Location
async function fetchDbPath() {
  try {
    dbFilePath = await window.ipcRenderer.invoke('get-db-path')
    renderDbPanel()
  } catch (error: any) {
    console.error('Failed to get database path:', error)
  }
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Render Thoughts Feed
function renderPosts() {
  feedCount.textContent = `${posts.length} ${posts.length === 1 ? 'thought' : 'thoughts'}`
  
  if (posts.length === 0) {
    thoughtsList.innerHTML = `
      <div style="text-align: center; padding: 4rem 1.5rem; color: var(--text-tertiary);">
        <p style="font-size: 1.6rem; margin-bottom: 0.5rem; font-family: var(--font-serif); font-style: italic;">The board is silent...</p>
        <p style="font-size: 0.95rem;">Be the first to share a thought. Open the Tools panel above to begin.</p>
      </div>
    `
    return
  }

  thoughtsList.innerHTML = posts.map(post => {
    const isOwner = currentUser && post.author === currentUser
    const isEdited = post.updatedAt !== post.createdAt
    
    return `
      <article class="thought-card" data-id="${escapeHTML(post.id)}">
        <div class="card-header">
          <div class="card-meta">
            <span class="card-author-badge">@${escapeHTML(post.author)}</span>
            <span class="card-time">${formatDate(post.createdAt)}${isEdited ? ' (edited)' : ''}</span>
          </div>
          ${isOwner ? `
            <div class="card-actions">
              <button class="btn btn-secondary btn-icon edit-btn" title="Edit Thought">✏️</button>
              <button class="btn btn-secondary btn-icon delete-btn" title="Delete Thought">🗑️</button>
            </div>
          ` : ''}
        </div>
        <h3 class="thought-title">${escapeHTML(post.title)}</h3>
        <p class="thought-content">${escapeHTML(post.content)}</p>
      </article>
    `
  }).join('')

  // Bind Actions
  thoughtsList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.thought-card')!
      const id = card.getAttribute('data-id')!
      startEditing(id)
    })
  })

  thoughtsList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.thought-card')!
      const id = card.getAttribute('data-id')!
      handleDeletePost(id)
    })
  })
}

function startEditing(id: string) {
  editingPostId = id
  const post = posts.find(p => p.id === id)
  if (post) {
    // Render and open the drawer
    renderEditor()
    openDrawer()
    
    // Populate form
    const titleInput = document.getElementById('post-title') as HTMLInputElement
    const contentInput = document.getElementById('post-content') as HTMLTextAreaElement
    titleInput.value = post.title
    contentInput.value = post.content
    contentInput.focus()
  }
}

function cancelEditing() {
  editingPostId = null
  renderEditor()
}

async function handleDeletePost(id: string) {
  if (!confirm('Are you sure you want to delete this thought?')) return
  try {
    posts = await window.ipcRenderer.invoke('delete-post', { id, currentUser })
    showToast('Thought deleted successfully')
    renderPosts()
    if (editingPostId === id) {
      cancelEditing()
    }
  } catch (error: any) {
    showToast(error.message, 'error')
  }
}

// Render Sidebar Editor
function renderEditor() {
  if (!currentUser) {
    editorSection.innerHTML = `
      <div class="guest-editor-warning">
        <span style="font-size: 2rem;">✍️</span>
        <p style="font-weight: 600; color: var(--text-primary);">Join the Board to Write</p>
        <p style="font-size: 0.85rem;">Choose a username in the panel above to start writing and editing your thoughts.</p>
      </div>
    `
    return
  }

  const isEditing = editingPostId !== null

  editorSection.innerHTML = `
    <div class="editor-card">
      <h3 class="editor-title">${isEditing ? 'Edit Thought' : 'Share a Thought'}</h3>
      <form class="editor-form" id="editor-form">
        <div class="form-group">
          <label class="form-label" for="post-title">Title</label>
          <input 
            type="text" 
            id="post-title" 
            class="input-field form-input" 
            placeholder="Give your thought a headline..." 
            required 
            maxlength="80"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="post-content">Thought</label>
          <textarea 
            id="post-content" 
            class="form-textarea" 
            placeholder="What is on your mind?" 
            required
            maxlength="2000"
          ></textarea>
        </div>
        <div class="editor-actions">
          ${isEditing ? `<button type="button" class="btn btn-secondary" id="cancel-edit-btn">Cancel</button>` : ''}
          <button type="submit" class="btn btn-primary">${isEditing ? 'Update Post' : 'Post Thought'}</button>
        </div>
      </form>
    </div>
  `

  document.getElementById('editor-form')!.addEventListener('submit', handleSavePost)
  if (isEditing) {
    document.getElementById('cancel-edit-btn')!.addEventListener('click', cancelEditing)
  }
}

async function handleSavePost(e: Event) {
  e.preventDefault()
  if (!currentUser) return

  const titleInput = document.getElementById('post-title') as HTMLInputElement
  const contentInput = document.getElementById('post-content') as HTMLTextAreaElement
  const title = titleInput.value.trim()
  const content = contentInput.value.trim()

  try {
    if (editingPostId) {
      posts = await window.ipcRenderer.invoke('update-post', {
        id: editingPostId,
        title,
        content,
        currentUser
      })
      showToast('Thought updated successfully')
      editingPostId = null
    } else {
      posts = await window.ipcRenderer.invoke('create-post', {
        title,
        content,
        author: currentUser
      })
      showToast('Thought posted to the board')
    }
    
    closeDrawer() // Automatically close drawer upon saving
    renderEditor()
    renderPosts()
  } catch (error: any) {
    showToast(error.message, 'error')
  }
}

// Render Database Info Panel
function renderDbPanel() {
  dbSection.innerHTML = `
    <div class="db-info-panel">
      <div class="db-info-header">
        <span class="db-info-icon">📂</span>
        <span class="db-info-title">Database Storage</span>
      </div>
      <div class="db-info-path" id="db-path-text">${escapeHTML(dbFilePath)}</div>
      
      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
        <div class="db-info-actions">
          <button style="flex: 1;" class="btn btn-secondary btn-sm" id="open-db-dir-btn">Open Folder</button>
          <button style="flex: 1;" class="btn btn-secondary btn-sm" id="copy-db-path-btn">Copy Path</button>
        </div>
        <div class="db-info-actions">
          <button style="flex: 1;" class="btn btn-primary btn-sm" id="export-backup-btn">📤 Export Backup</button>
          <button style="flex: 1;" class="btn btn-primary btn-sm" id="import-backup-btn">📥 Import Backup</button>
        </div>
      </div>
    </div>
  `

  document.getElementById('open-db-dir-btn')!.addEventListener('click', async () => {
    try {
      await window.ipcRenderer.invoke('open-db-folder')
      showToast('Opened database directory')
    } catch (error: any) {
      showToast(`Failed to open folder: ${error.message}`, 'error')
    }
  })

  document.getElementById('copy-db-path-btn')!.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(dbFilePath)
      showToast('Database path copied to clipboard')
    } catch (error: any) {
      showToast(`Failed to copy path: ${error.message}`, 'error')
    }
  })

  document.getElementById('export-backup-btn')!.addEventListener('click', async () => {
    try {
      const res = await window.ipcRenderer.invoke('export-posts')
      if (res.success) {
        showToast('Backup exported successfully')
      } else if (res.error !== 'Cancelled') {
        showToast(`Export failed: ${res.error}`, 'error')
      }
    } catch (error: any) {
      showToast(`Export error: ${error.message}`, 'error')
    }
  })

  document.getElementById('import-backup-btn')!.addEventListener('click', async () => {
    try {
      const res = await window.ipcRenderer.invoke('import-posts')
      if (res.success) {
        posts = res.posts
        showToast(`Successfully imported ${res.importedCount} new thoughts!`)
        renderPosts()
      } else if (res.error !== 'Cancelled') {
        showToast(`Import failed: ${res.error}`, 'error')
      }
    } catch (error: any) {
      showToast(`Import error: ${error.message}`, 'error')
    }
  })
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Initial Setup
updateIdentity()
fetchPosts()
fetchDbPath()

// Listen to any events if needed
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log('Main process message:', message)
})
