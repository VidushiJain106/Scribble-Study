import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-ignore
import { createProxyMiddleware } from 'http-proxy-middleware';
// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

const openAIProxyPlugin = () => ({
  name: 'openai-proxy',
  configureServer(server: any) {
    server.middlewares.use(
      '/api/generate-module',
      createProxyMiddleware({
        target: 'https://api.openai.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api/generate-module': '/v1/chat/completions',
        },
        onProxyReq: (proxyReq: any) => {
          const apiKey = process.env.VITE_OPENAI_API_KEY;
          if (apiKey) {
            proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
          }
        },
      })
    );
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["c6ff1dcd-ea02-4da9-a97a-39609ec8b971.lovableproject.com"],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    mode === 'development' && openAIProxyPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Disable HMR completely in production mode
  ...(mode === 'production' ? {
    // No HMR configuration for production
  } : {
    // Add proper HMR configuration for development mode
    hmr: {
      clientPort: 443, // Use HTTPS port for secure WebSocket
      protocol: 'wss', // Use secure WebSocket protocol
      host: 'c6ff1dcd-ea02-4da9-a97a-39609ec8b971.lovableproject.com', // Match the domain
      overlay: false, // Disable the error overlay as it can cause issues
    }
  })
}));
