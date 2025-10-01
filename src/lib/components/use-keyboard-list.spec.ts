import type { Locator } from '@playwright/test'
import { expect, test } from '../../../tests/fixtures'
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
		}

		third {
			color: green;
			font-size: 3rem;
			border: 1px solid black;
			outline: none;
		}`.repeat(20)
	}
] satisfies CSSOrigin[]

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

	table = page.locator('#rulesets').getByRole('table').locator('tbody')
	await table.scrollIntoViewIfNeeded()
})

test('clicking an item in the keyboard list focuses the element', async ({ page }) => {
	let row = table.getByRole('row').first()
	await row.click()
	await page.pause()
	expect.soft(row).toBeFocused()
})

test.describe('navigating the list', () => {
	test('pressing ArrowDown moves focus to the next item', async ({ page }) => {
		await table.getByRole('row').first().click()
		await page.keyboard.press('ArrowDown')
		await expect.soft(table.getByRole('row').nth(1)).toBeFocused()
	})

	test('pressing ArrowUp moves focus to the previous item', async ({ page }) => {
		await table.getByRole('row').nth(2).click()
		await page.keyboard.press('ArrowUp')
		await expect.soft(table.getByRole('row').nth(1)).toBeFocused()
	})

	test('pressing Home moves focus to the first item', async ({ page }) => {
		await table.getByRole('row').nth(2).click()
		await page.keyboard.press('Home')
		await expect.soft(table.getByRole('row').first()).toBeFocused()
	})

	test('pressing End moves focus to the last item', async ({ page }) => {
		await table.getByRole('row').first().click()
		await page.keyboard.press('End')
		expect.soft(table.getByRole('row').last()).toBeFocused()
	})

	test('pressing Meta+ArrowDown moves focus to the last item', async ({ page }) => {
		await table.getByRole('row').first().click()
		await page.keyboard.press('Meta+ArrowDown')
		await expect.soft(table.getByRole('row').last()).toBeFocused()
	})

	test('pressing Meta+ArrowUp moves focus to the first item', async ({ page }) => {
		await table.getByRole('row').nth(2).click()
		await page.keyboard.press('Meta+ArrowUp')
		await expect.soft(table.getByRole('row').first()).toBeFocused()
	})

	test('pressing Tab moves focus to the next item', async ({ page }) => {
		let row = table.getByRole('row').first()
		await row.click()
		await page.keyboard.press('Tab')
		await expect.soft(page.locator('#specificity').locator('.scroller')).toBeFocused()
		await expect.soft(row).toHaveAttribute('aria-selected', 'true')
	})

	test('pressing Shift+Tab moves focus to the previous item', async ({ page }) => {
		await table.getByRole('row').nth(2).click()
		await page.keyboard.press('Shift+Tab') // focus table scroller
		await page.keyboard.press('Shift+Tab') // focus radio
		await expect.soft(page.getByRole('radio', { name: 'Ruleset sizes' })).toBeFocused()
		await expect.soft(table.getByRole('row').nth(2)).toHaveAttribute('aria-selected', 'true')
	})
})

test('pressing Enter selects the focused item', async ({ page }) => {
	let row = table.getByRole('row').first()
	await row.click()
	await row.press('ArrowDown')
	await row.press('Enter')
	await expect.soft(row).not.toHaveAttribute('aria-selected', 'true')
	await expect.soft(table.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'true')
})

test('pressing Space selects the focused item', async ({ page }) => {
	let row = table.getByRole('row').first()
	await row.click()
	await row.press(' ')
	await expect.soft(row).toHaveAttribute('aria-selected', 'true')
})

test.fixme('tabbing into the list focuses the first item', async ({ page }) => {
	let radio = page.getByRole('radio', { name: 'Ruleset sizes' })
	await radio.scrollIntoViewIfNeeded()
	await radio.click()
	await radio.press('Tab') // tab into table scroller
	await radio.press('Tab') // tab to selectable item
	await expect.soft(table.getByRole('row').first()).toBeFocused()
})

test('tabbing into the list with an active item focuses the active item instead of the first', async ({ page }) => {
	let row = table.getByRole('row').nth(2)
	await row.click()
	await expect.soft(row).toBeFocused()
	await row.press('Tab')
	await expect.soft(row).not.toBeFocused()
	await expect.soft(row).toHaveAttribute('aria-selected', 'true') // item is still active
	await page.keyboard.press('Shift+Tab')
	await expect.soft(row).toBeFocused()
})
