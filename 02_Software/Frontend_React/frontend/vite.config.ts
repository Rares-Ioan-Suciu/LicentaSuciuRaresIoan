import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Această linie este MAGICĂ pentru problema ta.
    // Forțează Vite să nu încarce duplicate ale acestor biblioteci.
    dedupe: ['react', 'react-dom'],
  },
})