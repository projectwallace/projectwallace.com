/**
 * Copy of `base` with the shared `url` and/or `prettify` search params set.
 * Params that are left out (or `url: undefined`) are not touched.
 */
export function with_css_params(base: { href: string }, params: { url?: string; prettify?: boolean }): URL {
	let result = new URL(base.href)
	if (params.url !== undefined) {
		result.searchParams.set('url', params.url)
	}
	if (params.prettify !== undefined) {
		result.searchParams.set('prettify', params.prettify ? '1' : '0')
	}
	return result
}

/** Copy of `base` without the `url` and `prettify` search params, and without a hash. */
export function without_css_params(base: { href: string }): URL {
	let result = new URL(base.href)
	result.searchParams.delete('url')
	result.searchParams.delete('prettify')
	result.hash = ''
	return result
}
