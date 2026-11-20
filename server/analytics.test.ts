import { test, expect, vi, afterEach } from 'vitest'
import handler, { type EdgeContext } from './analytics.ts'

afterEach(() => {
	vi.unstubAllGlobals()
})

function html_response(status = 200) {
	return new Response('<html></html>', { status, headers: { 'content-type': 'text/html' } })
}

function setup(response: Response = html_response()) {
	let waited: Promise<unknown>[] = []
	let fetch_mock = vi.fn<(url: string) => Promise<Response>>(() => Promise.resolve(new Response('ok')))
	vi.stubGlobal('fetch', fetch_mock)
	let context: EdgeContext = { next: () => Promise.resolve(response), waitUntil: (p) => void waited.push(p) }
	return { context, fetch_mock, waited }
}

const HTML_HEADERS = { accept: 'text/html' }

function page(url: string, headers: Record<string, string>) {
	return new Request(url, { headers })
}

test('returns the response untouched and reports page views', async () => {
	let { context, fetch_mock, waited } = setup()
	let response = await handler(page('https://www.projectwallace.com/blog?utm_source=x', HTML_HEADERS), context)

	expect(await response.text()).toBe('<html></html>')
	await Promise.all(waited)
	expect(fetch_mock).toHaveBeenCalledOnce()
	let collect_url = new URL(fetch_mock.mock.calls[0]![0])
	expect(collect_url.searchParams.get('p')).toBe('/blog')
	expect(collect_url.searchParams.get('us')).toBe('x')
})

test('ignores other hostnames, assets, prefetches and errors', async () => {
	for (let request of [
		page('https://preview.example.com/', HTML_HEADERS),
		page('https://www.projectwallace.com/app.js', { accept: '*/*' }),
		page('https://www.projectwallace.com/', { accept: 'text/html', 'sec-purpose': 'prefetch' })
	]) {
		let { context, fetch_mock } = setup()
		await handler(request, context)
		expect(fetch_mock).not.toHaveBeenCalled()
	}

	let { context, fetch_mock } = setup(html_response(404))
	await handler(page('https://www.projectwallace.com/missing', HTML_HEADERS), context)
	expect(fetch_mock).not.toHaveBeenCalled()
})
