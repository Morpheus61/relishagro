import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // DISABLED FOR NOW

export default defineConfig({
  plugins: [
    react(),
    // PWA DISABLED - Causing service worker caching issues
    // We'll re-enable once CORS is fixed and app is stable
    // VitePWA({
    //   ... config
    // })
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