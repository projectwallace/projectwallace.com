import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: "project-wallace",
				project: "projectwallacecom"
			}
		}),
		enhancedImages(),
		sveltekit(),
	],
	build: {
		// Prevent base64 inlining of images (to avoid running into unexpected CSP issues)
		// https://vite.dev/config/build-options.html#build-assetsinlinelimit
		assetsInlineLimit: 0,
	},

	// https://vitejs.dev/config/#server-fs-allow
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			// content
			allow: ['..'],
		},
	}
}

export default config
