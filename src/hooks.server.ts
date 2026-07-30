import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

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

// SvelteKit always renders the prerendered `<head>` in this fixed order:
// [CSP meta] [modulepreload links] [rendered <svelte:head>, incl. <title>] [stylesheets]
// That buries the CSP meta and <title> tag behind dozens of low-priority
// preload hints, which Capo (https://rviscomi.github.io/capo.js/) flags as a
// performance issue since the browser can't act on them until much later.
// Hoist both back up to the top of <head>, right after the viewport meta.
const CSP_META = /<meta http-equiv="content-security-policy"[^>]*>/i
const TITLE_TAG = /<title>[\s\S]*?<\/title>/i
const VIEWPORT_META = /<meta name="viewport"[^>]*>/i

function reorder_head(html: string): string {
	const head_start = html.indexOf('<head')
	const head_end = html.indexOf('</head>')

	if (head_start === -1 || head_end === -1) {
		return html
	}

	const head = html.slice(head_start, head_end)
	const csp_match = head.match(CSP_META)
	const title_match = head.match(TITLE_TAG)

	if (!csp_match && !title_match) {
		return html
	}

	const viewport_match = head.match(VIEWPORT_META)

	// Without an anchor to hoist behind, leave the head untouched rather than
	// risk dropping content.
	if (!viewport_match) {
		return html
	}

	const hoisted = (csp_match?.[0] ?? '') + (title_match?.[0] ?? '')
	let new_head = head
	if (csp_match) new_head = new_head.replace(csp_match[0], '')
	if (title_match) new_head = new_head.replace(title_match[0], '')
	new_head = new_head.replace(viewport_match[0], viewport_match[0] + hoisted)

	return html.slice(0, head_start) + new_head + html.slice(head_end)
}

export const handle_head_order: Handle = function ({ event, resolve }) {
	let buffer = ''

	return resolve(event, {
		transformPageChunk: function ({ html, done }) {
			buffer += html
			return done ? reorder_head(buffer) : ''
		}
	})
}

export const handle: Handle = sequence(handle_redirects, handle_head_order)
