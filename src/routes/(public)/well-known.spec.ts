import { test, expect } from '@playwright/test'

test.describe('.well-known/security.txt', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/.well-known/security.txt', { waitUntil: 'domcontentloaded' })
	})

	test('contains contact information', async ({ page }) => {
		let content = await page.locator('pre').first().textContent()
		expect(/mailto:(.+@.+\.[a-z]{2,3})/i.test(content!)).toBeTruthy()
	})

	test('contains valid expiration date', async ({ page }) => {
		let content = await page.locator('pre').first().textContent()
		expect.soft(content).toContain('Expires: ')
		let date_match = content?.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/i)
		expect.soft(date_match).toBeTruthy()
		let parsed_date = new Date(date_match![0])
		expect.soft(parsed_date.getTime()).toBeGreaterThanOrEqual(new Date().getTime())
	})
})

test.describe('.well-known/atproto-did', () => {
	test('it exists', async ({ page }) => {
		await page.goto('/.well-known/atproto-did', { waitUntil: 'domcontentloaded' })
		let content = await page.locator('pre').first().textContent()
		expect(/did:plc:[a-z0-9]{24}/.test(content!)).toBeTruthy()
	})
})
