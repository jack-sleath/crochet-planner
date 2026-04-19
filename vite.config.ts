import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/crochet-planner/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      },
      manifest: {
        name: 'Crochet Planner',
        short_name: 'Crochet',
        description: 'Plan your crochet projects with image upload, grid overlay, and colour palettes',
        theme_color: '#7c6b4a',
        background_color: '#faf7f2',
        display: 'standalone',
        scope: '/crochet-planner/',
        start_url: '/crochet-planner/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
