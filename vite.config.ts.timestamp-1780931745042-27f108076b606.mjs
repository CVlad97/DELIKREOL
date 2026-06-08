// vite.config.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "file:///opt/vlad/projects/DELIKREOL/node_modules/vite/dist/node/index.js";
import react from "file:///opt/vlad/projects/DELIKREOL/node_modules/@vitejs/plugin-react-swc/index.js";
var __vite_injected_original_import_meta_url = "file:///opt/vlad/projects/DELIKREOL/vite.config.ts";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH || "/";
  const projectRoot = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "src")
      }
    },
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    build: {
      target: "es2015",
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "map-vendor": ["leaflet", "react-leaflet"],
            "qr-vendor": ["html5-qrcode", "qrcode.react"]
          }
        }
      },
      chunkSizeWarningLimit: 500,
      sourcemap: false
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L3ZsYWQvcHJvamVjdHMvREVMSUtSRU9MXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvb3B0L3ZsYWQvcHJvamVjdHMvREVMSUtSRU9ML3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9vcHQvdmxhZC9wcm9qZWN0cy9ERUxJS1JFT0wvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIGNvbnN0IGJhc2UgPSBlbnYuVklURV9CQVNFX1BBVEggfHwgJy8nO1xuICBjb25zdCBwcm9qZWN0Um9vdCA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG4gIHJldHVybiB7XG4gICAgYmFzZSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUocHJvamVjdFJvb3QsICdzcmMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXMyMDE1JyxcbiAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgJ21hcC12ZW5kb3InOiBbJ2xlYWZsZXQnLCAncmVhY3QtbGVhZmxldCddLFxuICAgICAgICAgICAgJ3FyLXZlbmRvcic6IFsnaHRtbDUtcXJjb2RlJywgJ3FyY29kZS5yZWFjdCddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDAsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1EsT0FBTyxVQUFVO0FBQ3ZSLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUg4SSxJQUFNLDJDQUEyQztBQUtqTixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxPQUFPLElBQUksa0JBQWtCO0FBQ25DLFFBQU0sY0FBYyxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBRS9ELFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsYUFBYSxLQUFLO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQzFCO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxZQUNyQyxjQUFjLENBQUMsV0FBVyxlQUFlO0FBQUEsWUFDekMsYUFBYSxDQUFDLGdCQUFnQixjQUFjO0FBQUEsVUFDOUM7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsTUFDdkIsV0FBVztBQUFBLElBQ2I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
