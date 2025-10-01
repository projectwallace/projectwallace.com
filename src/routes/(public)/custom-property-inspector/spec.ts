import type { Locator } from '@playwright/test'
import { test, expect } from '../../../../tests/fixtures'

let mock_css = `a {
	--declared: #f00;
	color: var(--undeclared, #f00);
	color: var(--declared, var(--undeclared));
}

@property --typo-typo {
	syntax: "<color>";
	inherits: false;
	initial-value: #c0ffee;
}

a { color: var(--typo); }`

test('does SEO well', async ({ page }) => {
	await page.goto('/custom-property-inspector', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('CSS without custom properties', async ({ page }) => {
	await page.goto('/custom-property-inspector')
	await expect(page).toBeHydrated()
	await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
	await page.getByLabel('CSS to analyze').fill(`a { color: red; }`)
	await page.getByRole('button', { name: 'Analyze CSS' }).click()

	let property_count = await page.getByTestId('property-name').count()
	expect.soft(property_count).toBe(0)
	await expect.soft(page.getByTestId('empty')).toBeVisible()
})

test.describe('with css', () => {
	let properties: Locator
	let property1: Locator
	let property2: Locator

	test.beforeEach(async ({ page }) => {
		await page.goto('/custom-property-inspector')
		await expect(page).toBeHydrated()
		await page.getByRole('tab', { name: 'Analyze CSS input' }).click()
		await page.getByLabel('CSS to analyze').fill(mock_css)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		properties = page.getByTestId('property-name')
		property1 = properties.nth(0)
		property2 = properties.nth(1)
	})

	test('filter buttons', async ({ page }) => {
		let locations = page.getByTestId('property-location')
		let unused_toggler = page.getByRole('button', { name: 'Unused: 1' })
		let undefined_toggler = page.getByRole('button', { name: 'Undefined: 1' })
		let undefined_with_fallback_toggler = page.getByRole('button', { name: 'Undefined with fallback: 1' })

		// Starting state
		await expect.soft(properties).toHaveCount(4)
		await expect.soft(locations).toHaveCount(6)
		await expect.soft(unused_toggler).toHaveAttribute('aria-pressed', 'false')
		await expect.soft(undefined_toggler).toHaveAttribute('aria-pressed', 'false')
		await expect.soft(undefined_with_fallback_toggler).toHaveAttribute('aria-pressed', 'false')

		// Click the "Unused" button
		await unused_toggler.click()
		await expect.soft(properties).toHaveCount(1)
		await expect.soft(locations).toHaveCount(1)
		await expect.soft(unused_toggler).toHaveAttribute('aria-pressed', 'true')
		await expect.soft(undefined_toggler).toHaveAttribute('aria-pressed', 'false')

		// Click the "Undefined" button too
		await undefined_toggler.click()
		await expect.soft(properties).toHaveCount(2)
		await expect.soft(locations).toHaveCount(2)
		await expect.soft(unused_toggler).toHaveAttribute('aria-pressed', 'true')
		await expect.soft(undefined_toggler).toHaveAttribute('aria-pressed', 'true')

		// Click the "Unused" button again
		await unused_toggler.click()
		await expect.soft(properties).toHaveCount(1)
		await expect.soft(locations).toHaveCount(1)
		await expect.soft(unused_toggler).toHaveAttribute('aria-pressed', 'false')
		await expect.soft(undefined_toggler).toHaveAttribute('aria-pressed', 'true')

		// Click the "total" button to reset the filters
		await page.getByRole('button', { name: 'Total: 4' }).click()
		await expect.soft(properties).toHaveCount(4)
		await expect.soft(locations).toHaveCount(6)
		await expect.soft(unused_toggler).toHaveAttribute('aria-pressed', 'false')
		await expect.soft(undefined_toggler).toHaveAttribute('aria-pressed', 'false')
	})

	test('toggles all details when clicking properties in the list', async () => {
		// verify that the details are closed
		await expect.soft(property1).toHaveAttribute('aria-expanded', 'false')
		await expect.soft(property2).toHaveAttribute('aria-expanded', 'false')

		// open 2 properties' details
		await property1.click()
		await property2.click()

		// Verify that the details are open
		await expect.soft(property1).toHaveAttribute('aria-expanded', 'true')
		await expect.soft(property2).toHaveAttribute('aria-expanded', 'true')
	})

	test('closes all details when clicking the "close all" button', async ({ page }) => {
		// verify that the details are closed
		await expect.soft(property1).toHaveAttribute('aria-expanded', 'false')
		await expect.soft(property2).toHaveAttribute('aria-expanded', 'false')

		// open 2 properties' details
		await property1.click()
		await property2.click()

		// Verify that the details are open
		await expect.soft(property1).toHaveAttribute('aria-expanded', 'true')
		await expect.soft(property2).toHaveAttribute('aria-expanded', 'true')

		// Close all details
		await page.getByRole('button', { name: 'Collapse all' }).click()

		// Verify that the details are closed
		for (let property of await properties.all()) {
			await expect(property).toHaveAttribute('aria-expanded', 'false')
		}
	})

	test('closes all details when the CSS changes', async ({ page }) => {
		// open 2 properties' details
		await property1.click()
		await property2.click()

		// Change the CSS
		await page.getByLabel('CSS to analyze').fill(mock_css + mock_css)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()

		// Verify that the details are closed
		for (let property of await properties.all()) {
			await expect(property).toHaveAttribute('aria-expanded', 'false')
		}
	})

	test('devtools are shown', async ({ page }) => {
		await expect.soft(page.getByRole('tab', { name: 'Network' })).toBeVisible()
		await expect.soft(page.getByRole('tab', { name: 'Properties' })).toBeVisible()
	})

	test.describe('search', () => {
		let search_input: Locator

		test.beforeEach(({ page }) => {
			search_input = page.getByRole('searchbox', { name: 'Search property name' })
		})

		test('filters the properties based on search query', async ({ page }) => {
			// Starting state
			await expect.soft(properties).toHaveCount(4)

			// Search for a property that exists
			await search_input.fill('declared')

			await expect.soft(properties).toHaveCount(2)

			for (let property of await properties.all()) {
				await expect.soft(property).toContainText('declared')
			}

			// Search for a property that doesn't exist
			await search_input.fill('nonexistent')
			await expect.soft(properties).toHaveCount(0)
		})

		test('allows negating the search query', async ({ page }) => {
			// Show show properties that don't contain the word declared
			await search_input.fill('!declared')

			for (let property of await properties.all()) {
				await expect.soft(property).not.toContainText('declared')
			}

			// Search for a property that doesn't exist
			await search_input.fill('!exist')

			await expect.soft(properties).toHaveCount(4)

			for (let property of await properties.all()) {
				await expect.soft(property).not.toContainText('exist')
			}
		})

		test('clears the search query when the CSS changes', async ({ page }) => {
			// Search for a property that exists
			await search_input.fill('declared')

			// Change the CSS
			await page.getByLabel('CSS to analyze').fill(mock_css + mock_css)
			await page.getByRole('button', { name: 'Analyze CSS' }).click()

			// Verify that the search query is cleared
			await expect(search_input).toHaveValue('')
		})

		test('shows empty state if the search query doesn\'t match any property', async ({ page }) => {
			// Search for a property that doesn't exist
			await search_input.fill('nonexistent')

			let clear_button = page.getByRole('button', { name: 'Clear all' })

			await expect.soft(properties).toHaveCount(0)
			await expect.soft(clear_button).toBeVisible()

			// Clear the search query
			await clear_button.click()
			await expect(search_input).toHaveValue('')
			await expect.soft(properties).toHaveCount(4)
			// This one is flaky, so skipping
			await expect.soft(clear_button).not.toBeVisible()
		})

		test('shows helpful info when search is active', async ({ page }) => {
			// Starting state
			await expect.soft(page.getByTestId('search-info')).not.toBeVisible()

			// Search for a property that exists
			await search_input.fill('declared')

			let info = page.getByTestId('search-info')
			await expect.soft(info).toBeVisible()
			await expect.soft(info).toHaveText('2 properties shown, 2 hidden by search')
		})

		test('clears the search query when clicking "clear all"', async ({ page }) => {
			// Search for a property that exists
			await search_input.fill('declared')

			let clear_search = page.getByRole('button', { name: 'Clear search' })
			await expect.soft(clear_search).toBeVisible()

			// Click the "clear all" button
			await clear_search.click()

			await expect.soft(search_input).toHaveValue('')
			await expect.soft(properties).toHaveCount(4)
			await expect.soft(clear_search).not.toBeVisible()
		})
	})
})