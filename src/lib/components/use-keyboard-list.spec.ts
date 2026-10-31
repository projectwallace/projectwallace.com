import type { Locator } from '@playwright/test'
import { expect, test } from '#tests/fixtures.ts'
import type { CSSOrigin } from '#lib/css-origins.ts'

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
	await page.getByLabel('Website URL').fill(`example.com`)
	// click 'Analyze URL'
	await page.getByRole('button', { name: 'Analyze URL' }).click()

	table = page.locator('#rulesets').getByRole('table').locator('tbody')
	await table.scrollIntoViewIfNeeded()
})

// Every test needs the (expensive) analyzed report, so related checks are grouped
// into a few tests that share one page load. Each step starts by clicking a row,
// which resets focus and selection, so steps don't depend on each other.
test('navigating the list with the keyboard', async ({ page }) => {
	let rows = table.getByRole('row')

	await test.step('clicking an item focuses the element', async () => {
		let row = rows.first()
		await row.click()
		await expect.soft(row).toBeFocused()
	})

	await test.step('ArrowDown moves focus to the next item', async () => {
		await rows.first().click()
		await page.keyboard.press('ArrowDown')
		await expect.soft(rows.nth(1)).toBeFocused()
	})

	await test.step('ArrowUp moves focus to the previous item', async () => {
		await rows.nth(2).click()
		await page.keyboard.press('ArrowUp')
		await expect.soft(rows.nth(1)).toBeFocused()
	})

	await test.step('Home moves focus to the first item', async () => {
		await rows.nth(2).click()
		await page.keyboard.press('Home')
		await expect.soft(rows.first()).toBeFocused()
	})

	await test.step('End moves focus to the last item', async () => {
		await rows.first().click()
		await page.keyboard.press('End')
		await expect.soft(rows.last()).toBeFocused()
	})

	await test.step('Meta+ArrowDown moves focus to the last item', async () => {
		await rows.first().click()
		await page.keyboard.press('Meta+ArrowDown')
		await expect.soft(rows.last()).toBeFocused()
	})

	await test.step('Meta+ArrowUp moves focus to the first item', async () => {
		await rows.nth(2).click()
		await page.keyboard.press('Meta+ArrowUp')
		await expect.soft(rows.first()).toBeFocused()
	})
})

test('tabbing and selecting items in the list', async ({ page }) => {
	let rows = table.getByRole('row')

	await test.step('Tab moves focus out of the list to the next element', async () => {
		let row = rows.first()
		await row.click()
		await page.keyboard.press('Tab')
		await expect.soft(page.locator('#specificity').locator('.scroller')).toBeFocused()
		await expect.soft(row).toHaveAttribute('aria-selected', 'true')
	})

	await test.step('Shift+Tab moves focus to the previous element', async () => {
		await rows.nth(2).click()
		await page.keyboard.press('Shift+Tab') // focus table scroller
		await page.keyboard.press('Shift+Tab') // focus radio
		await expect.soft(page.getByRole('radio', { name: 'Ruleset sizes' })).toBeFocused()
		await expect.soft(rows.nth(2)).toHaveAttribute('aria-selected', 'true')
	})

	await test.step('Enter selects the focused item', async () => {
		let row = rows.first()
		await row.click()
		await row.press('ArrowDown')
		await row.press('Enter')
		await expect.soft(row).not.toHaveAttribute('aria-selected', 'true')
		await expect.soft(rows.nth(1)).toHaveAttribute('aria-selected', 'true')
	})

	await test.step('Space selects the focused item', async () => {
		let row = rows.first()
		await row.click()
		await row.press(' ')
		await expect.soft(row).toHaveAttribute('aria-selected', 'true')
	})

	await test.step('tabbing back into the list focuses the active item instead of the first', async () => {
		let row = rows.nth(2)
		await row.click()
		await expect.soft(row).toBeFocused()
		await row.press('Tab')
		await expect.soft(row).not.toBeFocused()
		await expect.soft(row).toHaveAttribute('aria-selected', 'true') // item is still active
		await page.keyboard.press('Shift+Tab')
		await expect.soft(row).toBeFocused()
	})
})

test.fixme('tabbing into the list focuses the first item', async ({ page }) => {
	let radio = page.getByRole('radio', { name: 'Ruleset sizes' })
	await radio.scrollIntoViewIfNeeded()
	await radio.click()
	await radio.press('Tab') // tab into table scroller
	await radio.press('Tab') // tab to selectable item
	await expect.soft(table.getByRole('row').first()).toBeFocused()
})
