import { test, expect } from 'vitest'
import { handle_lint_css } from './lint-css.ts'

function post(body: string) {
	return handle_lint_css(new Request('https://example.com/api/lint-css', { method: 'POST', body }))
}

test('rejects invalid JSON', async () => {
	let response = await post('{nope')
	expect(response.status).toBe(400)
	expect(await response.json()).toEqual({ message: 'Request body must be valid JSON' })
})

test('rejects non-object bodies', async () => {
	let response = await post('"css"')
	expect(response.status).toBe(400)
})

test('lints CSS and reports timing', async () => {
	let response = await post(JSON.stringify({ css: 'a { color: red; }', preset: 'recommended' }))
	expect(response.status).toBe(200)
	expect(response.headers.get('server-timing')).toMatch(/^lint;dur=\d/)

	let data = (await response.json()) as { result: { warnings: unknown[] }; packages: { name: string }[] }
	expect(Array.isArray(data.result.warnings)).toBe(true)
	expect(data.packages.map((p) => p.name)).toContain('stylelint')
})
