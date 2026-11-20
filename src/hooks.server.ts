import type { Handle } from '@sveltejs/kit'

// SvelteKit always renders the head in this fixed internal order (hardcoded
// in `Head.build()`, see the `@sveltejs/kit@2.70.1` source we're pinned to:
// https://github.com/sveltejs/kit/blob/%40sveltejs/kit%402.70.1/packages/kit/src/runtime/server/page/render.js#L708-L717):
// [CSP meta] [modulepreload links] [rendered <svelte:head>, incl. <title>] [stylesheets]
// That buries the CSP meta, <title>, and the real stylesheets behind dozens
// of low-priority preload hints and meta tags, which Capo
// (https://rviscomi.github.io/capo.js/) flags as a performance issue since
// the browser can't act on higher-priority elements until much later.
//
// CSP meta, <title>, and the stylesheet <link> tags are all appended by
// SvelteKit's renderer directly (not part of the Svelte-compiled
// `<svelte:head>` output), so none of them carry hydration boundary
// comments and they're safe to relocate as standalone strings.
const CSP_META = /<meta http-equiv="content-security-policy"[^>]*>/i

const TITLE_TAG = /<title>[\s\S]*?<\/title>/i
const VIEWPORT_META = /<meta name="viewport"[^>]*>/i
const STYLESHEET_LINKS = /(?:<link href="[^"]+"\s+rel="stylesheet"[^>]*>\s*)+/i
const FONT_PRELOAD = /<link rel="preload" href="\/teko-500[^>]*>/i

function reorder_head(html: string): string {
	const head_start = html.indexOf('<head')
	const head_end = html.indexOf('</head>')

	if (head_start === -1 || head_end === -1) {
		return html
	}

	let head = html.slice(head_start, head_end)
	const original_head = head
	const viewport_match = head.match(VIEWPORT_META)

	// Without an anchor to hoist behind, leave the head untouched rather than
	// risk dropping content.
	if (!viewport_match) {
		return html
	}

	// Hoist the CSP meta and <title> to right after the viewport meta.
	const csp_match = head.match(CSP_META)
	const title_match = head.match(TITLE_TAG)
	let hoisted_top = ''
	if (csp_match) {
		hoisted_top += csp_match[0]
		head = head.replace(csp_match[0], '')
	}
	if (title_match) {
		hoisted_top += title_match[0]
		head = head.replace(title_match[0], '')
	}
	if (hoisted_top) {
		head = head.replace(viewport_match[0], viewport_match[0] + hoisted_top)
	}

	// Hoist the stylesheet links to right before the font preload, so they
	// outrank the modulepreload hints and meta tags SvelteKit places ahead
	// of them.
	const stylesheets_match = head.match(STYLESHEET_LINKS)
	const font_preload_match = head.match(FONT_PRELOAD)
	if (stylesheets_match && font_preload_match) {
		head = head.replace(stylesheets_match[0], '')
		head = head.replace(font_preload_match[0], stylesheets_match[0] + font_preload_match[0])
	}

	if (head === original_head) {
		return html
	}

	return html.slice(0, head_start) + head + html.slice(head_end)
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

export const handle: Handle = handle_head_order
