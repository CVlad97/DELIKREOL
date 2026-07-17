import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';
  const projectRoot = path.dirname(fileURLToPath(import.meta.url));

  return {
    base,
    plugins: [react(), VitePWA({
      registerType: 'prompt',
      includeAssets: ['branding/*.svg', 'branding/*.png'],
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,ico,json}'],
        runtimeCaching: [
          {
            // The former StaleWhileRevalidate strategy could display an old
            // photograph on the first visit after a deployment. NetworkFirst
            // keeps the original pixels current while retaining an offline copy.
            urlPattern: /\.(?:png|jpg|jpeg|webp)(?:\?.*)?$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'delikreol-images-v2',
              networkTimeoutSeconds: 8,
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 86400,
              },
              purgeOnQuotaError: true,
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 31536000,
              },
            },
          },
        ],
      },
    })],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      target: 'es2015',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'map-vendor': ['leaflet', 'react-leaflet'],
            'qr-vendor': ['html5-qrcode', 'qrcode.react'],
          },
        },
      },
      chunkSizeWarningLimit: 500,
      sourcemap: false,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [],
      include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/supabase/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    },
  };
});
