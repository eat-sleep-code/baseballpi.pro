import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		viteStaticCopy({
			targets: [
				{
					src: 'src/images/*',
					dest: 'images',  // copies to dist/images
					rename: { stripBase: true  }
				},
				{
					src: 'src/_headers',
					dest: '', // copies to root of dist
					rename: { stripBase: true  }
				},
				{
					src: 'src/robots.txt',
					dest: '', // copies to root of dist
					rename: { stripBase: true  }
				},
				{
					src: 'src/sitemap.xml',
					dest: '',  // copies to root of dist
					rename: { stripBase: true  }
				},
			]
		})
	],
	preview: {
		port: 3000,
	},
	server: {
		port: 3200,
		open: true,
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		rolldownOptions: {
			output: {
				entryFileNames: `scripts/index.js`,     // no hash in main entry file name
				chunkFileNames: `scripts/[name].js`,    // no hash in chunks
				assetFileNames: `[name].[ext]`  // no hash in assets (css, images, etc)
			}
		},
	}
})
