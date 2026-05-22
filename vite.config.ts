import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite plugin that auto-generates /workshops/index.json
 * listing all .md files in public/workshops/.
 * In dev: served dynamically via middleware (always fresh).
 * At build: written to dist so it's available in production.
 */
function workshopIndexPlugin(base: string): Plugin {
  const workshopsDir = path.resolve(__dirname, 'public/workshops');

  function getWorkshopFiles(): string[] {
    if (!fs.existsSync(workshopsDir)) return [];
    return fs.readdirSync(workshopsDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'));
  }

  return {
    name: 'workshop-index',
    configureServer(server) {
      // Serve index.json dynamically during dev
      server.middlewares.use((req, res, next) => {
        const indexPath = `${base}workshops/index.json`;
        if (req.url === indexPath) {
          const files = getWorkshopFiles();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(files));
          return;
        }
        next();
      });
    },
    writeBundle(options) {
      // Generate index.json at build time
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      const targetDir = path.join(outDir, 'workshops');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      const files = getWorkshopFiles();
      fs.writeFileSync(path.join(targetDir, 'index.json'), JSON.stringify(files));
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const base = '/';
  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), workshopIndexPlugin(base)],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
