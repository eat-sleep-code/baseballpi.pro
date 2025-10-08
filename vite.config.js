import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
				src: 'src/images/*',
				dest: 'images'  // copies to dist/images
				},
				{
					src: 'src/scripts/tag-manager.js',
					dest: 'scripts'  // copies to dist/scripts
				},
				{
					src: 'src/_headers',
					dest: ''  // copies to root of dist
				},
				{
					src: 'src/robots.txt',
					dest: ''  // copies to root of dist
				},
				{
					src: 'src/sitemap.xml',
					dest: ''  // copies to root of dist
				},
			]
		})
	],
	server: {
		port: 3201,
		open: true,
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		rollupOptions: {
			output: {
				entryFileNames: `scripts/index.js`,     // no hash in main entry file name
				chunkFileNames: `scripts/[name].js`,    // no hash in chunks
				assetFileNames: `[name].[ext]`  // no hash in assets (css, images, etc)
			}
		},
	}
})
