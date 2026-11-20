import { test, expect, vi, afterEach } from 'vitest'
import { handle_get_css } from './get-css.ts'

afterEach(() => {
	vi.unstubAllGlobals()
})

function get(search: string) {
	return handle_get_css(new Request(`https://example.com/api/get-css${search}`))
}

test('requires a url', async () => {
	let response = await get('')
	expect(response.status).toBe(400)
	expect(await response.json()).toEqual({ error: 'Missing URL' })
})

function stub_page(html: string) {
	vi.stubGlobal(
		'fetch',
		vi.fn(() => Promise.resolve(new Response(html, { headers: { 'content-type': 'text/html' } })))
	)
}

test('returns the scraped CSS with cache headers', async () => {
	stub_page('<html><head><style>a { color: red }</style></head></html>')

	let response = await get('?url=https://example.com')
	expect(response.status).toBe(200)
	expect(response.headers.get('cache-control')).toBe('s-maxage=600')
	let data = (await response.json()) as { type: string; css: string }[]
	expect(data.some((origin) => origin.css.includes('color: red'))).toBe(true)
})

test('decodes base64 data: stylesheets', async () => {
	let css = 'b { color: blue }'
	stub_page(`<html><head><link rel="stylesheet" href="data:text/css;base64,${btoa(css)}"></head></html>`)

	let response = await get('?url=https://example.com')
	let data = (await response.json()) as { css: string }[]
	expect(data.some((origin) => origin.css === css)).toBe(true)
})

test('reports invalid URLs in the body', async () => {
	let response = await get('?url=not-a-url%20body%7B%7D')
	let data = (await response.json()) as { error?: { statusCode: number } }
	expect(data.error?.statusCode).toBe(400)
})
