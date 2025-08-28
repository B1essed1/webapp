import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
        'concert-injury-iii-reasons.trycloudflare.com',
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
