import { test, expect } from '../../../../../tests/fixtures'

test('does SEO well', async ({ page }) => {
	await page.goto('/blog/prettify-css-online', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()

	// Has a date
	await expect.soft(page.locator('time').first()).toHaveAttribute('datetime', '2022-11-09T00:00:00.000Z')
	await expect.soft(page.locator('time').first()).toHaveText('9 November 2022')
})

test('has link to blog index', async ({ page }) => {
	// testing this blog post specifically because it contains lots of markdown stuff which
	// increases chances of catching any rendering issues and increases CSS code coverage.
	await page.goto('/blog/css-day-2023-takeaways', { waitUntil: 'domcontentloaded' })
	let backLink = page.getByText('Back to blog')

	await expect(backLink).toHaveAttribute('href', '/blog')
	await backLink.click()

	await page.waitForURL('**/blog')
})

test('Show 404 when blog post not found', async ({ page }) => {
	await page.goto('/blog/xxxxxxxxxxxx', { waitUntil: 'domcontentloaded' })

	await expect(page.locator('h1')).toHaveText('404')
})
