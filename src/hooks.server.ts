import { sequence } from '@sveltejs/kit/hooks'
import { redirect, type Handle } from '@sveltejs/kit'
import * as v from 'valibot'
import { theme_schema, type Theme } from '$lib/theme'

export const handle_redirects: Handle = async function ({ event, resolve }) {
	const redirects = [
		{ source: '/blog/automatically-analyze-css-on-every-push', destination: '/blog' },
		{ source: '/blog/cancel-subscription', destination: '/blog' },
		{ source: '/blog/privacy-by-default', destination: '/blog' },
		{ source: '/blog/delete-account', destination: '/blog' },
		{ source: '/blog/private-projects', destination: '/blog' },
		{ source: '/docs/recipes/automatically-push-css-with-webhook', destination: '/docs' },
		{ source: '/docs/recipes/preview-css-diff', destination: '/docs' },
		{ source: '/security.txt', destination: '/.well-known/security.txt' },
		{ source: '/blog/feed', destination: '/blog/feed.xml' },
		{ source: '/pricing', destination: '/funding' },
		{ source: '/blog/tiny-css-prettifier', destination: '/blog/tiny-css-formatter' },
		{ source: '/custom-property-linter', destination: '/custom-property-inspector' },
		// Common 404s found in Sentry and Counterscale
		{ source: '/analyze', destination: '/analyze-css' },
		{ source: '/css-analysis', destination: '/analyze-css' },
		{ source: '/register', destination: '/' },
		{ source: '/dashboard', destination: '/' },
		{ source: '/projects-coming-soon', destination: '/' }
	]

	// Redirect old /~username to the home page
	if (event.url.pathname.startsWith('/~')) {
		redirect(301, '/')
	}

	let route = redirects.find((item) => item.source === event.url.pathname)

	if (route) {
		redirect(301, route.destination)
	}

	let response = await resolve(event)
	return response
}

const apply_security_headers: Handle = async function ({ event, resolve }) {
	let security_headers: Record<string, string> = {
		'referrer-policy': 'strict-origin-when-cross-origin',
		'x-content-type-options': 'nosniff',
		'x-frame-options': 'DENY',
		'x-xss-protection': '1; mode=block'
	}
	let response = await resolve(event)

	for (let header in security_headers) {
		response.headers.set(header, security_headers[header])
	}

	return response
}

const set_theme: Handle = async function ({ event, resolve }) {
	let cookie_theme = event.cookies.get('theme')
	let theme: Theme = 'system'
	let parsed_theme = v.safeParse(theme_schema, cookie_theme)

	if (parsed_theme.success) {
		theme = parsed_theme.output
	}

	event.locals.theme = theme

	let response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('%sveltekit.theme%', theme)
		}
	})
	return response
}

const log_request_details: Handle = async function ({ event, resolve }) {
	let headers = event.request.headers
	let ua = headers.get('user-agent')
	let ip = headers.get('x-nf-client-connection-ip')
	let path = event.url.pathname
	let context =
		process.env.CONTEXT ||
		process.env.DEPLOY_CONTEXT ||
		headers.get('x-nf-deploy-context') ||
		headers.get('x-nf-site-id') ||
		'unknown' // e.g. 'production', 'deploy-preview'

	console.log('request-details', JSON.stringify({ context, ip, path, ua }))

	let response = await resolve(event)
	return response
}

export const handle: Handle = sequence(set_theme, handle_redirects, apply_security_headers, log_request_details)
