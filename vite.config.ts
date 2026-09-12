import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cabinApiPlugin } from './server/cabinApi.ts'

export default defineConfig(({ mode }) => ({
  plugins: [react(), cabinApiPlugin(mode)],
  server: {
    host: true,
    port: 5173,
  },
}))
