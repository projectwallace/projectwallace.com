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

	// lintPostcssResult.mjs's own `./timing.mjs` import drags in the `table`
	// package (for `TIMING=<n> stylelint ...` CLI output we never trigger),
	// which doesn't bundle for the browser. See shims/stylelint-timing.ts.
	{ find: './timing.mjs', replacement: stylelint_browser_dir + 'shims/stylelint-timing.ts' },

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

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [enhancedImages(), sveltekit()],
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
