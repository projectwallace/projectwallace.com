import { test, expect } from 'vitest'
import { handle_theme } from './theme.ts'

function post(body: string, url = 'https://example.com/api/theme') {
	return handle_theme(new Request(url, { method: 'POST', body }))
}

test('sets a script-readable, year-long theme cookie', async () => {
	let response = await post('dark')
	expect(response.status).toBe(200)

	let cookie = response.headers.get('set-cookie')!
	expect(cookie).toContain('theme=dark')
	expect(cookie).toContain('Path=/')
	expect(cookie).toContain('Max-Age=31536000')
	expect(cookie).toContain('SameSite=Lax')
	expect(cookie).not.toContain('HttpOnly')
	expect(cookie).toContain('Secure')
})

test('does not mark the cookie Secure on http', async () => {
	let response = await post('light', 'http://localhost:5173/api/theme')
	expect(response.headers.get('set-cookie')).not.toContain('Secure')
})

test('rejects unknown themes', async () => {
	let response = await post('hotdog')
	expect(response.status).toBe(400)
	expect(response.headers.get('set-cookie')).toBeNull()
})
