import { test, expect, type APIResponse } from '@playwright/test'

test.describe('Security headers', () => {
	let response: APIResponse

	test.beforeAll(async ({ request }) => {
		response = await request.get('/')
	})

	test('referrer-policy', () => {
		test.skip(process.env.NETLIFY === undefined, 'Only runs on Netlify')
		expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
	})

	test('x-content-type-options', () => {
		test.skip(process.env.NETLIFY === undefined, 'Only runs on Netlify')
		expect(response.headers()['x-content-type-options']).toBe('nosniff')
	})

	test('x-frame-options', () => {
		test.skip(process.env.NETLIFY === undefined, 'Only runs on Netlify')
		expect(response.headers()['x-frame-options']).toBe('DENY')
	})

	test('x-xss-protection', () => {
		test.skip(process.env.NETLIFY === undefined, 'Only runs on Netlify')
		expect(response.headers()['x-xss-protection']).toBe('1; mode=block')
	})

	test('strict-transport-security', () => {
		test.skip(process.env.NETLIFY === undefined, 'Only runs on Netlify')
		expect(response.headers()['strict-transport-security']).toBeDefined()
	})
})
