import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

/** Exposes the list of files that really exist in public/assets as `virtual:asset-index`. */
function assetIndex(): Plugin {
  const id = 'virtual:asset-index'
  const resolved = '\0' + id
  const root = path.resolve(process.cwd(), 'public/assets')
  const walk = (dir: string, base = ''): string[] =>
    !fs.existsSync(dir)
      ? []
      : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
          e.isDirectory() ? walk(path.join(dir, e.name), base + e.name + '/') : [base + e.name],
        )
  return {
    name: 'asset-index',
    resolveId: (s) => (s === id ? resolved : null),
    load: (s) => (s === resolved ? `export default ${JSON.stringify(walk(root))}` : null),
    configureServer(server) {
      const reload = () => {
        const mod = server.moduleGraph.getModuleById(resolved)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(root)
      server.watcher.on('add', (f) => f.includes('public/assets') && reload())
      server.watcher.on('unlink', (f) => f.includes('public/assets') && reload())
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwind(), assetIndex()],
  server: { host: true, port: 5173, allowedHosts: true },
  build: { target: 'es2020', chunkSizeWarningLimit: 700 },
})
