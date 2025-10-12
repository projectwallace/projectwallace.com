import type { CSSOrigin } from '$lib/css-origins'
import { test, expect } from '../../../../tests/fixtures'

test('does SEO well', async ({ page }) => {
	await page.goto('/get-css', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('scrapes CSS on a valid URL', async ({ page }) => {
	const css_fixture = 'this-is-my-css { color: red; }'
	await page.route('/api/get-css*', async (route) => {
		await route.fulfill({
			json: [
				{
					type: 'link',
					media: undefined,
					href: 'https://example.com/fixture.css',
					url: 'https://example.com/fixture.css',
					rel: 'stylesheet',
					css: css_fixture
				}
			] satisfies CSSOrigin[]
		})
	})
	await page.goto('/get-css', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()

	let output = page.getByTestId('pre-css')

	// Verify that we're starting off empty
	await expect.soft(page.getByLabel('URL to crawl')).toHaveValue('')
	await expect.soft(output).not.toBeVisible()

	// Fill in a URL and submit
	await page.getByLabel('URL').fill('example.com')
	await page.getByRole('button', { name: 'Crawl URL' }).click()

	await expect.soft(page).toHaveURL('/get-css?url=example.com')
	await expect.soft(output).toHaveText(css_fixture)
	await expect.soft(page.getByTestId('network-panel')).toBeVisible()
})

test('Loads with a prefilled URL', async ({ page }) => {
	await page.goto('/get-css?url=example.com')
	await expect.soft(page.getByLabel('URL to crawl')).toHaveValue('example.com')
})

test('pre-fills the page when coming from another page', async ({ page }) => {
	const css_fixture = 'this-is-my-css { color: red; }'

	await page.route('/api/get-css*', async (route) => {
		await route.fulfill({
			json: [
				{
					type: 'link',
					media: undefined,
					href: 'https://example.com/fixture.css',
					url: 'https://example.com/fixture.css',
					rel: 'stylesheet',
					css: css_fixture
				}
			] satisfies CSSOrigin[]
		})
	})

	await test.step('Analyze CSS', async () => {
		await page.goto('/analyze-css?url=example.com', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		await expect.soft(page.getByTestId('css-report')).toBeVisible()
	})

	// Now navigate to the get-css page
	await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'CSS Scraper' }).click()
	await expect.soft(page).toHaveURL('/get-css?url=example.com&prettify=1')
	await expect.soft(page.getByLabel('URL to crawl')).toHaveValue('example.com')
	await expect.soft(page.getByTestId('pre-css')).toHaveText(css_fixture)
	await expect.soft(page.getByTestId('network-panel')).toBeVisible()
	await expect.soft(page.getByRole('button', { name: 'Copy CSS' })).toBeVisible()
})

test.describe('offline', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/get-css', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Make the page go offline after it was loaded
		await page.context().setOffline(true)
	})

	test('shows an error message when the browser is offline', async ({ page }) => {
		await expect(page.getByTestId('offline-message')).toBeVisible()
	})

	test('offline message is gone after the connection is restored', async ({ page }) => {
		await page.context().setOffline(false)
		await expect(page.getByTestId('offline-message')).not.toBeVisible()
	})
})

test('errors on an invalid URL', async ({ page }) => {
	await page.goto('/get-css', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()

	// Fill in a URL and submit
	await page.getByLabel('URL').fill('not-a-valid-url')
	await page.getByRole('button', { name: 'Crawl URL' }).click()

	await expect.soft(page.getByTestId('error-message')).toBeVisible()
})
