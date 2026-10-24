import mdsvexConfig from './mdsvex.config.js'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-netlify'
import { mdsvex } from 'mdsvex'
import { /** @type {import('vite').UserConfig} */ preprocessMeltUI } from '@melt-ui/pp'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { Features } from 'lightningcss'
import { fileURLToPath } from 'node:url'

const stylelint_lib_dir = fileURLToPath(new URL('./node_modules/stylelint/lib/', import.meta.url))
const stylelint_browser_dir = fileURLToPath(new URL('./src/lib/stylelint-browser/', import.meta.url))

// stylelint's package.json `exports` map only publishes `.`, `./package.json`
// and `./lib/utils/*`. src/lib/stylelint-browser/lint.ts deep-imports a few
// unpublished internals on purpose (see that file's header comment) - point
// those specifiers straight at the real files on disk so bundling and
// type-checking (via stylelint-internals.d.ts) both work.
//
// These use `resolve.alias` (not a custom plugin `resolveId` hook) because
// Vite's dependency optimizer pre-bundles reachable node_modules packages
// with esbuild directly, ahead of the normal plugin pipeline, and only
// honours declarative aliases - a custom resolver here would be silently
// skipped during that pre-bundling pass.
//
// Nothing server-side imports real `stylelint`/`node:os`/`node:process`
// anymore (linting is client-only), so these aliases apply everywhere rather
// than being scoped to the client build - simpler, and harmless for SSR
// since this code only ever executes in the browser (see the `browser` guard
// in Linter.svelte) and just needs to *resolve* for the SSR bundle.
const config_alias = [
	// Unpublished internals, aliased to the real files on disk.
	{ find: 'stylelint/lib/lintPostcssResult.mjs', replacement: stylelint_lib_dir + 'lintPostcssResult.mjs' },
	{
		find: 'stylelint/lib/normalizeAllRuleSettings.mjs',
		replacement: stylelint_lib_dir + 'normalizeAllRuleSettings.mjs'
	},
	{
		find: 'stylelint/lib/createPartialStylelintResult.mjs',
		replacement: stylelint_lib_dir + 'createPartialStylelintResult.mjs'
	},
	{ find: 'stylelint/lib/prepareReturnValue.mjs', replacement: stylelint_lib_dir + 'prepareReturnValue.mjs' },
	{
		find: 'stylelint/lib/formatters/jsonFormatter.mjs',
		replacement: stylelint_lib_dir + 'formatters/jsonFormatter.mjs'
	},

	// Node-free stand-ins for bare specifiers stylelint's internals (and our
	// plugin package) import.
	{ find: 'node:os', replacement: stylelint_browser_dir + 'shims/node-os.ts' },
	{ find: 'node:process', replacement: stylelint_browser_dir + 'shims/node-process.ts' },
	// `find` must be an exact-match regex here, not the plain string
	// shorthand: Vite's aliasing treats a bare string `find` as a *prefix*
	// (so it'd also rewrite real subpaths like `stylelint/lib/utils/report.mjs`
	// to `.../stylelint-shim.ts/lib/utils/report.mjs`), which those subpaths
	// need to keep resolving to the real, publicly-exported package files.
	{ find: /^stylelint$/, replacement: stylelint_browser_dir + 'stylelint-shim.ts' }
]

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
	resolve: {
		alias: config_alias
	},
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
