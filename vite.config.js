import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// The portal calls its backend (ai-damage-assessment-service/panel-backends/callcenter-service)
// at the same-origin path /api: in dev/preview Vite proxies it to the local
// service, in production nginx does the same.
const apiProxy = {
    '/api': { target: process.env.CALLCENTER_API_TARGET || 'http://127.0.0.1:8050', changeOrigin: false },
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), 'src'),
        },
    },
    server: {
        port: 5190,
        host: true,
        proxy: apiProxy,
    },
    preview: {
        port: 4190,
        proxy: apiProxy,
    },
});
