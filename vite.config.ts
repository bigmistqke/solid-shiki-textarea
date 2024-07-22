import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import dtsBundleGenerator from 'vite-plugin-dts-bundle-generator'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import solid from 'vite-plugin-solid'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    solid(),
    libInjectCss(),
    dts(),
    dtsBundleGenerator({ fileName: 'index.d.ts' }),
  ],
  server: { port: 3000 },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'solid-shiki-textarea',
      fileName: format => `index.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['solid-js', 'shiki'],
      output: {
        globals: {
          'solid-js': 'SolidJS',
          shiki: 'Shiki',
        },
      },
    },
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
})
