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
      minify: false,
      disable: mode === 'production',
      includeAssets: ['branding/*.svg', 'branding/*.png'],
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,ico,json}'],
        runtimeCaching: [
          // Product and partner photographs are intentionally not cached by the
          // service worker. Stable file paths are frequently replaced with a
          // verified original, so the network/browser cache must remain the
          // source of truth after each deployment.
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
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/@supabase/')) {
              return 'app-vendor';
            }
            if (id.includes('/leaflet/') || id.includes('/react-leaflet/')) {
              return 'map-vendor';
            }
            if (id.includes('/html5-qrcode/') || id.includes('/qrcode.react/')) {
              return 'qr-vendor';
            }
            return undefined;
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
