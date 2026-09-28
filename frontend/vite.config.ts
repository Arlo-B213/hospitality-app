import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification and source maps for better debugging
    minify: 'terser',
    sourcemap: false, // Set to true for production debugging
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    // Optimize chunks and bundles
    rollupOptions: {
      input: {
        main: 'index.html',
        sw: 'src/service-worker.ts',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'sw') {
            return 'service-worker.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Manual chunk strategy for better code splitting
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-recharts': ['recharts'],
          // Page/route chunks (lazy loaded)
          'page-analytics': ['./src/pages/AnalyticsPage.tsx'],
          'page-evaluation': ['./src/pages/EvaluationPage.tsx'],
          'page-settings': ['./src/pages/SettingsPage.tsx'],
          // Component chunks
          'chart-components': ['./src/components/RadarChart.tsx', './src/components/TrendChart.tsx', './src/components/CohortComparison.tsx', './src/components/SkillHeatmap.tsx'],
        },
      },
    },
    // Optimize chunk size thresholds
    chunkSizeWarningLimit: 1000, // Warn if chunks exceed 1MB
    // Target modern browsers for better compression
    target: 'esnext',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
