import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy encaminha as chamadas /api para o backend (porta 3001),
// evitando problemas de CORS durante o desenvolvimento.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
