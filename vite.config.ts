import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['flavorcore-logo.png', 'favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'RelishAgro Management System',
        short_name: 'RelishAgro',
        description: 'Production management system for HarvestFlow and FlavorCore operations',
        theme_color: '#7C3AED',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/flavorcore-logo-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/flavorcore-logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Don't cache the login page to prevent stale authentication
        navigateFallback: null,
        // Runtime caching for API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/relishagrobackend-production\.up\.railway\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        // Clean up old caches
        cleanupOutdatedCaches: true
      },
      // Disable in development to avoid caching issues
      devOptions: {
        enabled: false // ✅ Disabled in dev mode
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true
  }
})