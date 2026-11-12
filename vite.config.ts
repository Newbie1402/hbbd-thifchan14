import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig(({ mode }) => { const env = loadEnv(mode, process.cwd(), ''); const api=`http://127.0.0.1:${env.MEMORIES_API_PORT || '8787'}`; return { plugins: [react(), tailwindcss()], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }, server: { proxy: { '/api': { target: api, changeOrigin: true }, '/share': { target: api, changeOrigin: true } } }, test: { environment: 'jsdom', environmentOptions: { jsdom: { url: 'http://localhost' } }, setupFiles: './src/test/setup.ts' } }; });
