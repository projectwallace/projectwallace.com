import { test, expect, type APIResponse } from '@playwright/test'

// _headers is applied by the host, so the dev server never sends these headers
const deployed = process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined

test.describe('Security headers', () => {
	let response: APIResponse

	test.beforeAll(async ({ request }) => {
		response = await request.get('/')
	})

	test('referrer-policy', () => {
		test.skip(!deployed, 'Only runs against a deployed site (set PLAYWRIGHT_TEST_BASE_URL)')
		expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
	})

	test('x-content-type-options', () => {
		test.skip(!deployed, 'Only runs against a deployed site (set PLAYWRIGHT_TEST_BASE_URL)')
		expect(response.headers()['x-content-type-options']).toBe('nosniff')
	})

	test('x-frame-options', () => {
		test.skip(!deployed, 'Only runs against a deployed site (set PLAYWRIGHT_TEST_BASE_URL)')
		expect(response.headers()['x-frame-options']).toBe('DENY')
	})

	test('x-xss-protection', () => {
		test.skip(!deployed, 'Only runs against a deployed site (set PLAYWRIGHT_TEST_BASE_URL)')
		expect(response.headers()['x-xss-protection']).toBe('1; mode=block')
	})

	test('strict-transport-security', () => {
		test.skip(!deployed, 'Only runs against a deployed site (set PLAYWRIGHT_TEST_BASE_URL)')
		expect(response.headers()['strict-transport-security']).toBeDefined()
	})
})
