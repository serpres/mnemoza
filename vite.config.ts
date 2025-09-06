import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/mnemoza/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 4000,
    host: '0.0.0.0',
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.ico'],
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot,json,webmanifest}',
          '**/assets/**/*',
          'offline.html',
        ],
        globIgnores: ['**/node_modules/**/*', '**/sw.js', '**/workbox-*.js'],
        maximumFileSizeToCacheInBytes: 50000000,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
      },
      manifest: {
        name: 'Mnemoza - Интервальные повторения',
        short_name: 'Mnemoza',
        description: 'Полностью автономная система интервальных повторений',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'ru',
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['education', 'productivity'],
        shortcuts: [
          {
            name: 'Создать колоду',
            short_name: 'Новая колода',
            description: 'Создать новую колоду карточек',
            url: '/?action=create-deck',
          },
        ],
      },

      devOptions: {
        enabled: true, // Включаем SW в режиме разработки
        type: 'module',
        navigateFallback: 'index.html',
      },
      disable: false,
      selfDestroying: false,
    }),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          db: ['idb'],
        },
      },
    },
  },
})
