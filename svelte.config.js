import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import { preprocessMeltUI } from '@melt-ui/pp'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex(mdsvexConfig),
		preprocessMeltUI(),
	],

	kit: {
		adapter: adapter(),
		serviceWorker: {
			register: false,
		},
		alias: {
			'$components': 'src/lib/components'
		},
		csp: {
			directives: {
				// unsafe-inline is required for Sentry 😑
				'script-src': [
					'counterscale.bartveneman.workers.dev',
					'self',
					'unsafe-inline'
				],
				'connect-src': [
					'self',
					'counterscale.bartveneman.workers.dev',
					'o50610.ingest.us.sentry.io',
				],
				'style-src': ['self', 'unsafe-inline', 'blob:'],
				'img-src': ['self'],
				'frame-src': ['codepen.io'],
				'worker-src': ['self', 'blob:'],
				'font-src': [
					'self',
					'https://www.projectwallace.com',
				],
				'default-src': ['self', 'o50610.ingest.us.sentry.io'],
			}
		}
	},
}

export default config
