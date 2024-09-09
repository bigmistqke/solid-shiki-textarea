import path from 'path'
import { defineConfig } from 'vite'
import cssClassnames from 'vite-plugin-css-classnames'
import dts from 'vite-plugin-dts'
// import dtsBundleGenerator from 'vite-plugin-dts-bundle-generator'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import solid from 'vite-plugin-solid'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    cssClassnames(),
    tsconfigPaths(),
    solid({
      babel: {
        plugins: [['@babel/plugin-proposal-decorators', { version: '2023-05' }]],
      },
    }),
    libInjectCss(),
    dts(),
  ],
  server: { port: 3000 },
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        'custom-element': path.resolve(__dirname, 'src/custom-element.tsx'),
      },
      name: 'solid-shiki-textarea',
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        globals: {
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
