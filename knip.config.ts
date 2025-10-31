import type { KnipConfig } from 'knip'
import { compile } from 'svelte/compiler'

export default {
	compilers: {
		svelte: (source: string) => compile(source, {}).js.code
	},
	ignoreUnresolved: [
		// Ignore imports like $env/static/private
		/\$env/
	],
	paths: {
		'$lib/*': ['./src/lib/*'],
		'$components/*': ['./src/lib/components/*']
	}
} satisfies KnipConfig
