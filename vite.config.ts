import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '現在要吃啥',
        short_name: '要吃啥',
        description: '專為台灣胃設計的美食決策器，結合即時停車場資訊',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'restaurant-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
})
