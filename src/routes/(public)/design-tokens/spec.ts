import { test, expect } from '../../../../tests/fixtures'
import type { CSSOrigin } from '$lib/css-origins'
import { nav } from './nav'

const file_fixture_1 = {
	name: 'style_1.css',
	mimeType: 'text/css',
	buffer: Buffer.from('a { color: red; }')
}

test('does SEO well', async ({ page }) => {
	await page.goto('/design-tokens', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test.describe('navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.route('**/api/get-css*', async (route) => {
			await route.fulfill({
				status: 200,
				json: [
					{
						href: 'https://example.com/style.css',
						url: 'https://example.com/style.css',
						media: undefined,
						rel: 'stylesheet',
						type: 'link',
						css: 'body { color: red; &:hover { font-size: 16px; } }'
					}
				] satisfies CSSOrigin[]
			})
		})
		await page.goto('/design-tokens', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// Fill in a valid URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()
	})

	test('each navigation link works', async ({ page }) => {
		// Verify that the whole report is shown
		for (let section of nav) {
			let element = page.locator('#' + section.id)
			await expect.soft(element, `Expect "#${section.id}" to be on the page`).toHaveCount(1)

			if (section.items !== undefined) {
				for (let sub_section of section.items) {
					let link = page.getByRole('link', { name: sub_section.title })
					let element = page.locator('#' + sub_section.id)
					await expect.soft(element, `Expect "#${sub_section.id}" to be on the page`).toHaveCount(1)
					await link.click()
					await expect.soft(element).toBeInViewport()
				}
			}
		}
	})

	test('shows/hides the navigation using keyboard shortcut', async ({ page }) => {
		// Verify nav is shown
		let navigation = page.getByRole('navigation', { name: 'Navigate this page' })
		await expect.soft(navigation).toBeVisible()

		// Toggle the nav
		await page.keyboard.press('Meta+\\')
		await expect.soft(navigation).not.toBeVisible()

		// Toggle the nav back again
		await page.keyboard.press('Meta+\\')
		await expect.soft(navigation).toBeVisible()
	})
})

test.describe('URL input mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/design-tokens', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
	})

	test('analyzes a valid URL', async ({ page }) => {
		// Fill in a valid URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		// Verify that the URL is updated
		await expect.soft(page).toHaveURL('/design-tokens?url=example.com&prettify=1')

		// Verify that focus is restored
		await expect.soft(page.getByRole('button', { name: 'Analyze URL' })).toBeFocused()
	})
})

test.describe('URL preloading', () => {
	test('url=example.com', async ({ page }) => {
		await page.goto('/design-tokens?url=example.com', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
		// 2. prettify is checked by default
		await expect.soft(page.getByLabel('Prettify CSS?').first()).toBeChecked()
	})

	test('url=example.com&prettify=1', async ({ page }) => {
		await page.goto('/design-tokens?url=example.com&prettify=1', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
		// 2. prettify is checked by default
		await expect.soft(page.getByLabel('Prettify CSS?').first()).toBeChecked()
	})

	test('url=example.com&prettify=0', async ({ page }) => {
		await page.goto('/design-tokens?url=example.com&prettify=0', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// 1. URL input is prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('example.com')
		// 2. Prettify is NOT checked
		await expect.soft(page.getByLabel('Prettify CSS?').first()).not.toBeChecked()
	})

	test('prettify=0', async ({ page }) => {
		await page.goto('/design-tokens?prettify=0', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()
		// 1. URL input is NOT prefilled
		await expect.soft(page.getByLabel('URL to analyze')).toHaveValue('')
		// 2. Prettify is NOT checked
		await expect.soft(page.getByLabel('Prettify CSS?').first()).not.toBeChecked()
	})

	test('Raw input unsets URL param', async ({ page }) => {
		await page.goto('/design-tokens', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Analyze URL first
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		await expect.soft(page).toHaveURL('/design-tokens?url=example.com&prettify=1')

		// Fill in Raw CSS
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
		await page.getByLabel('CSS to analyze').fill(`h1{color:red;font-size:1em;}`)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()
		await expect.soft(page).toHaveURL('/design-tokens')
	})

	test('File input unsets URL param', async ({ page }) => {
		await page.goto('/design-tokens', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Analyze URL first
		await page.getByLabel('URL to analyze').fill(`example.com`)
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		await expect.soft(page).toHaveURL('/design-tokens?url=example.com&prettify=1')

		// Select a file
		await page.getByRole('tab', { name: 'Analyze File' }).click()
		await page.getByLabel('File to analyze').setInputFiles([file_fixture_1])
		await page.getByRole('button', { name: 'Analyze CSS' }).click()
		await expect.soft(page).toHaveURL('/design-tokens')
	})
})

test.describe('Design Tokens panel', () => {
	let fixture = [
		{
			type: 'link',
			href: 'https://example.com/test.css',
			url: 'https://example.com/test.css',
			media: undefined,
			rel: 'stylesheet',
			css: `test-link-element {
				color: red;
				font-size: 12px;
			}`
		}
	] satisfies CSSOrigin[]
	test.beforeEach(async ({ page }) => {
		await page.route('/api/get-css*', async (route) => {
			await route.fulfill({ json: fixture })
		})

		await page.goto('/design-tokens', { waitUntil: 'domcontentloaded' })
		await expect(page).toBeHydrated()

		// Fill in a URL
		await page.getByLabel('URL to analyze').fill(`example.com`)

		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()

		// Click the Design Tokens tab
		await page.getByRole('tab', { name: 'Design Tokens' }).click()
	})

	test('download button', async ({ page }) => {
		let button = page.getByRole('link', { name: 'Download tokens' })
		await expect.soft(button).toHaveAttribute('download', 'projectwallace-css.tokens.json')
		// Start waiting for download before clicking. Note no await.
		const download_promise = page.waitForEvent('download')
		await button.click()
		const download = await download_promise
		expect.soft(download.suggestedFilename()).toBe('projectwallace-css.tokens.json')
	})

	test('copy button', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-write', 'clipboard-read'])

		let button = page.getByRole('button', { name: 'Copy tokens' })
		await button.click()

		let clipboard_text = await page.evaluate(async () => {
			return await navigator.clipboard.readText()
		})
		expect.soft(clipboard_text).toContain('"com.projectwallace.css-authored-as": "12px"')
	})
})
