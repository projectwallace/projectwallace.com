import type { Locator } from '@playwright/test'
import { expect, test } from '../../../../tests/fixtures'
import type { CSSOrigin } from '$lib/css-origins'

let fixture = [
	{
		type: 'link',
		href: 'https://example.com/test.css',
		url: 'https://example.com/test.css',
		media: undefined,
		rel: 'stylesheet',
		css: `test-link-element {
			color: green;
			font-size: 2rem;
		}

		second {
			background-color: yellow;
			color: black;
		}`.repeat(20)
	}
] satisfies CSSOrigin[]

test.describe('DevTools: ItemUsage Panel', () => {
	let devtools: Locator
	let inspector: Locator
	let table: Locator

	test.beforeEach(async ({ page }) => {
		// Mock the API response
		await page.route('/api/get-css*', async (route) => {
			await route.fulfill({ json: fixture })
		})
		// Load the page
		await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
		// Wait for hydration
		await expect(page).toBeHydrated()
		// Fill in a URL
		await page.getByLabel('URL to analyze').fill(`example.com`)
		// click 'Analyze URL'
		await page.getByRole('button', { name: 'Analyze URL' }).click()
		// Open the ItemUsage panel by clicking the first link in the Properties Panel
		await page
			.locator('#properties')
			.getByRole('table')
			.locator('tbody')
			.getByRole('row')
			.nth(1)
			.click()

		devtools = page.getByTestId('devtools')
		inspector = devtools.getByTestId('inspector')
		table = inspector.getByRole('table').locator('tbody')
	})

	test.describe('Initial inspector view', () => {
		test('ItemUsage panel is shown in devtools', async () => {
			await expect.soft(inspector).toBeVisible()
			await expect.soft(devtools.getByRole('tab').getByText('Inspector')).toHaveAttribute('data-state', 'active')
			await expect.soft(devtools.getByRole('tabpanel')).toBeVisible()
		})

		test('Shows all CSS Locations', async () => {
			let rows = table.getByRole('row')
			await expect.soft(rows).toHaveCount(20)
			await expect.soft(rows.first().locator('td').nth(0)).toHaveText('font-size')
			await expect.soft(rows.first().locator('td').nth(1)).toHaveText('3:2')
		})

		test('It highlights the first CSS Location', async () => {
			let rows = table.getByRole('row')
			await expect.soft(rows.first()).toHaveAttribute('aria-selected', 'true')
			await expect.soft(table.getByRole('row', { selected: true })).toHaveCount(1)
		})

		test('Shows the CSS inspection panel', async () => {
			let panel = inspector.getByTestId('css-slide')
			await expect(panel).toBeVisible()
		})

		test('Allows the selected CSS to be copied', async ({ page, context }) => {
			await context.grantPermissions(['clipboard-write', 'clipboard-read'])
			let panel = inspector.getByTestId('css-slide')

			await panel.getByRole('button', { name: 'Copy selection' }).click()

			let clipboard_text = await page.evaluate(async () => {
				return await navigator.clipboard.readText();
			});
			expect(clipboard_text).toBe('font-size')
		})
	})

	test('Clicking a location highlights it', async () => {
		let rows = table.getByRole('row')
		await rows.nth(1).click()
		await expect.soft(rows.nth(1)).toHaveAttribute('aria-selected', 'true')
		await expect.soft(table.getByRole('row', { selected: true })).toHaveCount(1)
	})

	test('Clicking the Close Panel button closes the CSS inspection panel', async () => {
		let panel = inspector.getByTestId('css-slide')

		await panel.getByLabel('Close panel').click()
		await expect.soft(panel).not.toBeVisible()
		await expect.soft(table.getByRole('row', { selected: true })).toHaveCount(0)
	})
})
