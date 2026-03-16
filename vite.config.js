import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'

/**
 * Wraps enhancedImages() to exclude raw .md files from the markup transform.
 * The vite-plugin-enhanced-img-markup plugin inherits vite-plugin-svelte's id
 * filter, which includes .md files (because mdsvex handles them). But the plugin
 * tries to parse raw markdown as Svelte before mdsvex runs, which fails when the
 * markdown mentions <enhanced:img> in prose or code blocks. Since actual
 * <enhanced:img> usage lives in .svelte files, .md files are safe to skip.
 */
function enhancedImagesWithMdExclusion() {
	const plugins = enhancedImages()
	const markupPlugin = plugins.find((p) => p.name === 'vite-plugin-enhanced-img-markup')
	if (markupPlugin && typeof markupPlugin.configResolved === 'function') {
		const original = markupPlugin.configResolved
		markupPlugin.configResolved = function (config) {
			original.call(this, config)
			const filter = markupPlugin.transform?.filter
			if (filter?.id && typeof filter.id === 'object') {
				// rolldown uses a native {include, exclude} filter format.
				// Create a NEW object rather than mutating the shared vite-plugin-svelte filter
				// (mutation would also exclude .md from vite-plugin-svelte's own transforms).
				filter.id = {
					include: filter.id.include,
					exclude: [...(filter.id.exclude ?? []), /\.md$/]
				}
			}
		}
	}
	return plugins
}

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		enhancedImagesWithMdExclusion(),
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
