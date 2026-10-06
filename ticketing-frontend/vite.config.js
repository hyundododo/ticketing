import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/user': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/api\/user/, '/user'),
      },
      '/api': 'http://localhost:8080',
      '/login': {
        target: 'http://localhost:8080',
        bypass: (req) => {
          const acceptsHtml = req.headers.accept?.includes('text/html')
          const isNavigation = req.headers['sec-fetch-mode'] === 'navigate' || req.headers['sec-fetch-dest'] === 'document'
          return req.method === 'GET' && (acceptsHtml || isNavigation) ? '/index.html' : undefined
        },
      },
      '/jwt': 'http://localhost:8080',
      '/oauth2': 'http://localhost:8080',
    },
  },
})
