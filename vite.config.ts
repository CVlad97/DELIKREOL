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
      mode: 'development',
      registerType: 'autoUpdate',
      includeAssets: ['branding/*.svg', 'branding/*.png'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 } },
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
            'react-vendor': ['react', 'react-dom'],
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
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'tests/**'],
    },
  };
});
