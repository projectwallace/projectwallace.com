/**
 * Headers and redirects come from `_headers` and `_redirects`, which only a host applies,
 * not the local dev/preview server. Specs that depend on them only run against a non-local base URL.
 */
export const deployed = !['localhost', '127.0.0.1'].includes(
	new URL(process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost').hostname
)

export const SKIP_REASON = 'Only runs against a deployed site (set PLAYWRIGHT_TEST_BASE_URL)'
