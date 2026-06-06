import { sequence } from '@sveltejs/kit/hooks'
import { redirect, type Handle } from '@sveltejs/kit'
import { type Theme, validate_theme } from '$lib/theme'

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

const set_theme: Handle = async function ({ event, resolve }) {
	let cookie_theme = event.cookies.get('theme')
	let theme: Theme = 'system'

	if (validate_theme(cookie_theme)) {
		theme = cookie_theme
	}

	event.locals.theme = theme

	let response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('%sveltekit.theme%', theme)
		}
	})
	return response
}

export const handle: Handle = sequence(set_theme, handle_redirects, apply_security_headers)
