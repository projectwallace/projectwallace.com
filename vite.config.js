import mdsvexConfig from './mdsvex.config.ts'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-netlify'
import { mdsvex } from 'mdsvex'
import { preprocessMeltUI } from '@melt-ui/pp'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { Features } from 'lightningcss'
import { readFileSync } from 'node:fs'
import { enhancedImgDefaults } from './scripts/vite-plugin-enhanced-img-defaults.ts'

// Redirects live in _redirects (applied by the host), so the prerender crawler sees 404s for old URLs that content still links to
const redirected_paths = new Set(
	readFileSync(new URL('./_redirects', import.meta.url), 'utf8')
		.split('\n')
		.filter((line) => line.startsWith('/') && !line.includes('*'))
		.map((line) => line.split(/\s+/)[0])
)

const config = {
	plugins: [
		// Blog column renders images at ~704px max; 2x of that is the largest variant worth encoding
		enhancedImgDefaults({ max_width: 1408, effort: 2 }),
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
			prerender: {
				handleHttpError: ({ path, message }) => {
					if (redirected_paths.has(path)) return
					throw new Error(message)
				}
			},
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
