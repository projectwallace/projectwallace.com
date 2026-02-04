import { test, expect } from '../../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/blog', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('has link to RSS feed', async ({ page }) => {
	const rssLink = page.getByTestId('rss-link')

	await expect.soft(rssLink).toBeVisible()
	await expect.soft(rssLink).toHaveAttribute('href', '/blog/feed.xml')
})

test('has links to some blog posts', async ({ page }) => {
	const posts = page.getByRole('article')

	// Has more than 1 post
	expect.soft(await posts.count()).toBeGreaterThan(1)

	// Clicking an entry makes us go to the blog post page
	await posts.nth(2).click()
	await page.waitForURL('**/blog/*')
})
