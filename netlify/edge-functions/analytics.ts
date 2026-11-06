// Minimal types, so we don't need @netlify/edge-functions as a dependency
type Context = { next: () => Promise<Response>; waitUntil: (promise: Promise<unknown>) => void }

/**
 * Server-side page view tracking for Counterscale.
 *
 * Pages are prerendered and served from the Netlify CDN, so SvelteKit hooks never see them.
 * This edge function runs in front of the CDN and reports every document request to a
 * separate Counterscale site, so it can be compared to the client-side tracker (which is
 * hidden by ad blockers).
 *
 * Known limitations (compared to the client-side tracker):
 * - Only full document loads are seen, not SvelteKit client-side navigations.
 * - Every hit is reported as a new visit (ht=1), so visitor and bounce numbers are not meaningful.
 * - Country is derived from the collect request, so it is not the visitor's country.
 * - Bots are intentionally NOT filtered.
 *
 * NOTE: this runs on Deno and cannot import from `$lib`, so SITE_HOSTNAME is duplicated from src/lib/site.ts.
 */
const SITE_HOSTNAME = 'www.projectwallace.com'
const COLLECT_URL = 'https://counterscale.bartveneman.workers.dev/collect'
const SITE_ID = 'projectwallace.com-server'

const UTM_PARAMS = {
	utm_source: 'us',
	utm_medium: 'um',
	utm_campaign: 'uc',
	utm_term: 'ut',
	utm_content: 'uco'
} as const

function build_collect_url(request: Request): string {
	const url = new URL(request.url)
	const collect = new URL(COLLECT_URL)
	collect.searchParams.set('sid', SITE_ID)
	collect.searchParams.set('h', `${url.protocol}//${url.hostname}`)
	collect.searchParams.set('p', url.pathname)
	collect.searchParams.set('ht', '1')

	let referrer = request.headers.get('referer')
	if (referrer) {
		collect.searchParams.set('r', referrer)
	}

	for (let [utm, short] of Object.entries(UTM_PARAMS)) {
		let value = url.searchParams.get(utm)
		if (value) {
			collect.searchParams.set(short, value)
		}
	}
	return collect.toString()
}

function is_document_request(request: Request): boolean {
	if (request.method !== 'GET') {
		return false
	}
	if (!request.headers.get('accept')?.includes('text/html')) {
		return false
	}
	// Skip speculative loads, they are not real page views
	if (request.headers.get('sec-purpose')?.includes('prefetch')) {
		return false
	}
	if (request.headers.get('purpose') === 'prefetch') {
		return false
	}
	return true
}

export default async function handler(request: Request, context: Context) {
	let response = await context.next()

	try {
		let url = new URL(request.url)
		if (
			url.hostname === SITE_HOSTNAME &&
			is_document_request(request) &&
			response.status >= 200 &&
			response.status < 300 &&
			response.headers.get('content-type')?.includes('text/html')
		) {
			context.waitUntil(
				fetch(build_collect_url(request), {
					headers: { 'user-agent': request.headers.get('user-agent') ?? '' }
				}).catch(() => {})
			)
		}
	} catch {
		// Analytics must never break the page
	}

	return response
}

export const config = {
	path: '/*',
	excludedPath: ['/_app/*', '/api/*']
}
