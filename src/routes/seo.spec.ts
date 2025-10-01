import { test, expect } from '../../tests/fixtures'

test('does homepage SEO', async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical({ trailing_slash: true })
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('generic redirects', async ({ page }) => {
	await page.goto('/pricing', { waitUntil: 'domcontentloaded' })
	await expect(page).toHaveURL(/\/funding$/)
})

test('outdated docs/blog', async ({ page }) => {
	await page.goto('/blog/delete-account', { waitUntil: 'domcontentloaded' })
	await expect(page).toHaveURL(/\/blog$/)
})
