import path from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    TanStackRouterVite({
      routesDirectory: './src/react-app/routes',
      generatedRouteTree: './src/react-app/routeTree.gen.ts',
    }),
  ],
  server: {
    port: 5995,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src/react-app'),
    },
  },
});
