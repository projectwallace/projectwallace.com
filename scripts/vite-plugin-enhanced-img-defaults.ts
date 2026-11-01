import type { Plugin } from 'vite'

const OPTIMIZABLE = /\.(png|jpe?g)\?/

type Options = {
	/**
	 * Widest variant (in px) to generate. Should be ~2x the widest the image is
	 * ever rendered at. Narrower source images are never upscaled.
	 */
	max_width: number
	/** AVIF/WebP encoder effort. Lower is faster; the default of 4 is ~6x slower than 2 for ~10% smaller AVIFs. */
	effort: number
}

/**
 * Applies build-time defaults to every `?enhanced` image import (in .md/.svx/.svelte
 * files) so contributors don't need to remember to add them per image:
 *
 * - `imgWidth`: caps the largest generated variant, instead of encoding the full-size source
 * - `effort`: lowers the encoder effort to keep builds fast
 *
 * Both can still be set explicitly on an import. An explicit `w` skips `imgWidth`.
 */
export function enhancedImgDefaults({ max_width, effort }: Options): Plugin {
	return {
		name: 'enhanced-img-defaults',
		enforce: 'pre',
		resolveId(source, importer, options) {
			if (!OPTIMIZABLE.test(source)) {
				return
			}

			let query_start = source.indexOf('?')
			let params = new URLSearchParams(source.slice(query_start + 1))
			if (!params.has('enhanced')) {
				return
			}

			let resolved = source
			if (!params.has('effort')) {
				resolved += `&effort=${effort}`
			}
			if (!params.has('w') && !params.has('imgWidth')) {
				resolved += `&imgWidth=${max_width}`
			}
			if (resolved === source) {
				return
			}

			return this.resolve(resolved, importer, { ...options, skipSelf: true })
		}
	}
}
