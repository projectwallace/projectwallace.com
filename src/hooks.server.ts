import { sequence } from '@sveltejs/kit/hooks'
import { redirect, type Handle } from '@sveltejs/kit'

const redirects = new Map<string, string>([
	['/blog/new-libraries-released', '/blog'],
	['/blog/php-library', '/blog'],
	['/blog/automatically-analyze-css-on-every-push', '/blog'],
	['/blog/cancel-subscription', '/blog'],
	['/blog/privacy-by-default', '/blog'],
	['/blog/delete-account', '/blog'],
	['/blog/private-projects', '/blog'],
	['/docs/recipes/automatically-push-css-with-webhook', '/docs'],
	['/docs/recipes/preview-css-diff', '/docs'],
	['/security.txt', '/.well-known/security.txt'],
	['/blog/feed', '/blog/feed.xml'],
	['/pricing', '/'],
	['/funding', '/'],
	['/sponsor', '/'],
	['/blog/tiny-css-prettifier', '/blog/tiny-css-formatter'],
	['/custom-property-linter', '/custom-property-inspector'],
	// Common 404s found in Sentry and Counterscale
	['/analyze', '/analyze-css'],
	['/css-analysis', '/analyze-css'],
	['/register', '/'],
	['/dashboard', '/'],
	['/projects-coming-soon', '/']
])

export const handle_redirects: Handle = async function ({ event, resolve }) {
	// Redirect old /~username to the home page
	if (event.url.pathname.startsWith('/~')) {
		redirect(301, '/')
	}

	const destination = redirects.get(event.url.pathname)

	if (destination) {
		redirect(301, destination)
	}

	let response = await resolve(event)
	return response
}

const security_headers: Record<string, string> = Object.freeze({
	'referrer-policy': 'strict-origin-when-cross-origin',
	'x-content-type-options': 'nosniff',
	'x-frame-options': 'DENY',
	'x-xss-protection': '1; mode=block'
})

const apply_security_headers: Handle = async function ({ event, resolve }) {
	let response = await resolve(event)

	for (let header in security_headers) {
		response.headers.set(header, security_headers[header])
	}

	return response
}

export const handle: Handle = sequence(handle_redirects, apply_security_headers)
