import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { Features } from 'lightningcss'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [enhancedImages(), sveltekit()],
	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: {
				chrome: 123 << 16,
				edge: 123 << 16,
				firefox: 120 << 16,
				safari: (17 << 16) | (5 << 8)
			},
			exclude: Features.LightDark | Features.Nesting
		}
	},
	build: {
		// Prevent base64 inlining of images (to avoid running into unexpected CSP issues)
		// https://vite.dev/config/build-options.html#build-assetsinlinelimit
		assetsInlineLimit: 0
	},

	// https://vitejs.dev/config/#server-fs-allow
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			// content
			allow: ['..']
		}
	}
}

export default config
