
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add proper HMR configuration to handle WebSocket connections
  hmr: {
    clientPort: 443, // Use HTTPS port for secure WebSocket
    protocol: 'wss', // Use secure WebSocket protocol
    host: 'c6ff1dcd-ea02-4da9-a97a-39609ec8b971.lovableproject.com', // Match the domain
    overlay: false, // Disable the error overlay as it can cause issues
  }
}));
