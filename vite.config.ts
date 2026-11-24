import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
// `vite build --mode web` builds only the website (no Electron), for GitHub Pages.
export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web'
  return {
    // GitHub Pages serves the site from /<repo-name>/
    // Desktop loads index.html from disk (file://), so asset paths must be relative
    base: isWeb ? (process.env.WEB_BASE ?? '/ThoughtBoard/') : './',
    build: isWeb ? { outDir: 'dist-web' } : {},
    plugins: isWeb ? [] : [
      electron({
        main: {
          // Shortcut of `build.lib.entry`.
          entry: 'electron/main.ts',
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: path.join(__dirname, 'electron/preload.ts'),
        },
        // Polyfill the Electron and Node.js API for Renderer process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: process.env.NODE_ENV === 'test'
          // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
          ? undefined
          : {},
      }),
    ],
  }
})
