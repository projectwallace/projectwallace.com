import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-netlify'
import { mdsvex } from 'mdsvex'
import { /** @type {import('vite').UserConfig} */ preprocessMeltUI } from '@melt-ui/pp'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { Features } from 'lightningcss'

const config = {
	plugins: [
		enhancedImages(),
		sveltekit({
			extensions: ['.svelte', '.svx', ...mdsvexConfig.extensions],
			// Consult https://github.com/sveltejs/svelte-preprocess
			// for more information about preprocessors
			preprocess: [vitePreprocess(), mdsvex(mdsvexConfig), preprocessMeltUI({ svelteConfigPath: false })],

			adapter: adapter({
				// We don't generate enough traffic to keep edge workers ready, so disable edge to avoid cold-starts
				// Also cannot run on edge because stylelint requires NodeJS-specific APIs
				edge: false,

				// We split the bundles to not impact other routes with Stylelint's slow start
				split: true
			}),
			csp: {
				directives: {
					'script-src': [
						"'sha256-szIw4XmtuyhpgMdFVs5O/R2m7k/FGTZj2yRT8ddh/aI='",
						'counterscale.bartveneman.workers.dev',
						'self'
					],
					'connect-src': ['self', 'counterscale.bartveneman.workers.dev'],
					'style-src': ['self', 'unsafe-inline', 'blob:'],
					'worker-src': ['self', 'blob:'],
					'default-src': ['self']
				}
			}
		})
	],
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
	build: { assetsInlineLimit: 0 },
	server: { fs: { allow: ['..'] } }
}

export default config
