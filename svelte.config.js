import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-netlify'
import { mdsvex } from 'mdsvex'
import { preprocessMeltUI } from '@melt-ui/pp'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', ...mdsvexConfig.extensions],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig), preprocessMeltUI()],

	kit: {
		adapter: adapter({
			// We don't generate enough traffic to keep edge workers ready,
			// so disable edge to avoid cold-starts
			edge: false
		}),
		alias: {
			$components: 'src/lib/components'
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
	}
}

export default config
