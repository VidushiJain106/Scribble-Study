
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
