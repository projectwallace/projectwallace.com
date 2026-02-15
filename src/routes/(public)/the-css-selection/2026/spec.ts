import { test, expect } from '../../../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/the-css-selection/2026', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
	await expect.soft(page).toHaveOpenGraphImage()
})

test('should show navigation', async ({ page }) => {
	await expect(page.getByRole('navigation', { name: 'Navigate this page' })).toBeVisible()
})

// Skipping this because we're hammering other people's websites for no good reason. This ran fine
// just after release of the initial article, so safe to skip now.
test.skip('content contains no dead links', async ({ page, request }) => {
	// Requesting all these URLs is slow, so make sure Playwright doesn't timeout
	test.slow()

	const links = await page.locator('main .content a[href^="http"]').all()
	const urls = await Promise.all(links.map((link) => link.getAttribute('href')))
	const uniqueUrls = [...new Set(urls.filter(Boolean))]

	// Sites with bot protection that block non-browser requests
	const skipDomains = ['bsky.app']

	for (const url of uniqueUrls) {
		if (skipDomains.some((domain) => url!.includes(domain))) {
			test.info().annotations.push({ type: 'skip', description: `${url} skipped (bot protection)` })
			continue
		}
		const response = await request.head(url!)
		if (response.status() === 429) {
			test.info().annotations.push({ type: 'skip', description: `${url} returned 429 (rate limited)` })
			continue
		}
		expect.soft(response.status(), `${url} should return 200`).toBe(200)
	}
})
