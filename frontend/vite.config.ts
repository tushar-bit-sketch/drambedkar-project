import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },

    server: {
      port: 5173,
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons'
            }
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')
            ) {
              return 'vendor-react'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },
})
