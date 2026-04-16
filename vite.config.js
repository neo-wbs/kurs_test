import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    // Basis-URL für GitHub Pages: /ci_cd_web_test/
    // Passe den Namen an deinen Repo-Namen an!
    base: command === 'build' ? '/kurs_test/' : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        input: 'index.html',   // ← Vite liest index.html und findet app.js automatisch
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    }
  }));