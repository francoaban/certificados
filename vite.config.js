import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isElectron = mode === 'electron'
  const env = loadEnv(mode, '.', '')

  return {
    // Electron carga con file://, necesita rutas relativas.
    // Para publicar la PWA en un subdirectorio: BASE_PATH=/certificados/
    base: isElectron ? './' : env.BASE_PATH || '/',
    build: { outDir: isElectron ? 'dist-renderer' : 'dist' },
    server: { port: 5173, strictPort: true },
    plugins: [
      react(),
      tailwindcss(),
      !isElectron &&
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'pwa-64x64.png', 'apple-touch-icon-180x180.png'],
          manifest: {
            name: 'Generador de certificados',
            short_name: 'Certificados',
            description: 'Genera certificados en PDF a partir de planillas Excel o CSV.',
            lang: 'es-AR',
            theme_color: '#4f46e5',
            background_color: '#f1f5f9',
            display: 'standalone',
            start_url: './',
            scope: './',
            icons: [
              { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
              { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
              {
                src: 'maskable-icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
            // jspdf + xlsx pesan bastante: subimos el límite de precache
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          },
        }),
    ].filter(Boolean),
  }
})