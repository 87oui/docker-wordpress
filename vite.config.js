import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import devManifest from 'vite-plugin-dev-manifest'
import { liveReload } from 'vite-plugin-live-reload'

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'theme/assets',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: 'src/scripts/main.js',
        'main.css': 'src/styles/main.css',
        'editor.css': 'src/styles/editor.css',
      },
      output: {
        entryFileNames: 'scripts/[name]-[hash].js',
        chunkFileNames: `scripts/[name]-[hash].js`,
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpeg|jpg|png|svg|webp|)$/.test(name ?? '')) {
            return 'images/[name]-[hash].[ext]'
          }
          if (/\.css$/.test(name ?? '')) {
            return 'styles/[name]-[hash].[ext]'
          }
          if (/\.js$/.test(name ?? '')) {
            return 'scripts/[name]-[hash].[ext]'
          }
          return '[name]-[hash].[ext]'
        },
      },
    },
    manifest: true,
    minify: true,
    emptyOutDir: false,
    sourcemap: import.meta.env.DEV && 'inline',
  },
  server: {
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  plugins: [
    liveReload(['./theme/**/*.php', './theme/views/**/*.twig']),
    devManifest({ cleanOnClose: true }),
    tailwindcss(),
  ],
})
