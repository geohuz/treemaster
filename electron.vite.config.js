import { resolve } from 'path'

import path from 'node:path'
import { createRequire } from 'node:module';
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

const require = createRequire(import.meta.url)
const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
const standardFontsDir = path.join(
  path.dirname(require.resolve('pdfjs-dist/package.json')),
  'standard_fonts',
)


export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react({jsxImportSource: "@emotion/react"}),
      svgr({exportAsDefault: true}),
      viteStaticCopy({
        targets: [
          { src: cMapsDir, dest: '' },
          { src: standardFontsDir, dest: '' },
        ],
      })
    ]
  }
})
