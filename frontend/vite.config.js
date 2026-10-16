import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/* Donde escucha la API en desarrollo. El backend usa 4000 salvo que se cambie PORT */
const API_LOCAL = process.env.VITE_API_LOCAL || 'http://localhost:4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',

  server: {
    port: 5173,

    /*
     * En desarrollo el sitio llama a /api y /uploads contra su propio origen
     * (localhost:5173) y Vite los reenvia al backend. Asi:
     *  - no hay CORS de por medio,
     *  - no hay que mantener VITE_API_URL sincronizada con el puerto del backend,
     *  - y da igual si el navegador resuelve localhost por IPv4 o IPv6.
     *
     * En produccion no interviene: ahi el sitio es estatico y usa VITE_API_URL.
     */
    proxy: {
      '/api': { target: API_LOCAL, changeOrigin: true },
      '/uploads': { target: API_LOCAL, changeOrigin: true },
    },
  },

  build: {
    outDir: 'dist',
    // Los sourcemaps no se publican: pesan y exponen el codigo fuente.
    sourcemap: false,
  },
})
