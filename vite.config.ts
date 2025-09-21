import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Isso torna a variável de ambiente do Netlify (process.env.API_KEY)
    // disponível no código do cliente durante o processo de build.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
