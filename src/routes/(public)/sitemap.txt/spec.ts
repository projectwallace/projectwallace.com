import { test, expect } from '@playwright/test'

test('valid sitemap', async ({ page }) => {
	// It should exist
	await page.goto('/sitemap.txt', { waitUntil: 'domcontentloaded' })

	// Expect a bunch of text-based entries
	let sitemap = await page.locator('pre').first().textContent()
	expect.soft(sitemap).toContain('https://www.projectwallace.com/analyze-css')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/get-css')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/css-code-quality')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/prettify-css')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/blog')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/docs')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/docs/metrics')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/docs/recipes')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/oss')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/sponsor')
	expect.soft(sitemap).toContain('https://www.projectwallace.com/funding')

	// Users should not be listed in sitemap anymore
	expect.soft(sitemap).not.toContain('~teamwallace')
})
