import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true,  // Ensures Hot Module Replacement is enabled
    watch: {
      usePolling: true,  // Helps if file changes are not detected (especially in WSL, Docker, or network file systems)
    },
  },
  optimizeDeps: {
    exclude: ["fsevents"], // Tell Vite not to bundle fsevents
  },
})
