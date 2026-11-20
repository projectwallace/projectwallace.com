import { test, expect, type APIResponse } from '@playwright/test'
import { deployed, SKIP_REASON } from '#tests/deployed.ts'

test.describe('Security headers', () => {
	let response: APIResponse

	test.beforeAll(async ({ request }) => {
		response = await request.get('/')
	})

	test('referrer-policy', () => {
		test.skip(!deployed, SKIP_REASON)
		expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
	})

	test('x-content-type-options', () => {
		test.skip(!deployed, SKIP_REASON)
		expect(response.headers()['x-content-type-options']).toBe('nosniff')
	})

	test('x-frame-options', () => {
		test.skip(!deployed, SKIP_REASON)
		expect(response.headers()['x-frame-options']).toBe('DENY')
	})

	test('x-xss-protection', () => {
		test.skip(!deployed, SKIP_REASON)
		expect(response.headers()['x-xss-protection']).toBe('1; mode=block')
	})

	test('strict-transport-security', () => {
		test.skip(!deployed, SKIP_REASON)
		expect(response.headers()['strict-transport-security']).toBeDefined()
	})
})
