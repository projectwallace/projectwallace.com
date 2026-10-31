import type { Locator } from '@playwright/test'
import { test, expect } from '#tests/fixtures.ts'

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
	await expect.soft(page).not.toHaveHorizontalOverflow()
})

test('CSS without custom properties', async ({ page }) => {
	await page.goto('/custom-property-inspector')
	await expect(page).toBeHydrated()
	await page.getByRole('tab', { name: 'Paste CSS' }).click()
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
		await page.getByRole('tab', { name: 'Paste CSS' }).click()
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

		// Locations are only rendered in the DOM once their property is expanded,
		// so open every property and keep them open for the rest of the test
		for (let property of await properties.all()) {
			await property.click()
		}

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

	test('expanding, collapsing and resetting property details', async ({ page }) => {
		await test.step('devtools are shown', async () => {
			await expect.soft(page.getByRole('tab', { name: 'Network' })).toBeVisible()
			await expect.soft(page.getByRole('tab', { name: 'Properties' })).toBeVisible()
		})

		await test.step('clicking properties toggles their details', async () => {
			await expect.soft(property1).toHaveAttribute('aria-expanded', 'false')
			await expect.soft(property2).toHaveAttribute('aria-expanded', 'false')

			await property1.click()
			await property2.click()

			await expect.soft(property1).toHaveAttribute('aria-expanded', 'true')
			await expect.soft(property2).toHaveAttribute('aria-expanded', 'true')
		})

		await test.step('the "Collapse all" button closes all details', async () => {
			await page.getByRole('button', { name: 'Collapse all' }).click()

			for (let property of await properties.all()) {
				await expect.soft(property).toHaveAttribute('aria-expanded', 'false')
			}
		})

		// Last step: this replaces the CSS, so keep it at the end
		await test.step('details are closed when the CSS changes', async () => {
			await property1.click()
			await property2.click()

			await page.getByLabel('CSS to analyze').fill(mock_css + mock_css)
			await page.getByRole('button', { name: 'Analyze CSS' }).click()

			for (let property of await properties.all()) {
				await expect.soft(property).toHaveAttribute('aria-expanded', 'false')
			}
		})
	})

	test.describe('search', () => {
		let search_input: Locator

		test.beforeEach(({ page }) => {
			search_input = page.getByRole('searchbox', { name: 'Search property name' })
		})

		test('filtering the properties with a search query', async ({ page }) => {
			await test.step('no search info is shown initially', async () => {
				await expect.soft(properties).toHaveCount(4)
				await expect.soft(page.getByTestId('search-info')).not.toBeVisible()
			})

			await test.step('filters the properties based on the query', async () => {
				await search_input.fill('declared')
				await expect.soft(properties).toHaveCount(2)

				for (let property of await properties.all()) {
					await expect.soft(property).toContainText('declared')
					await expect.soft(property.locator('mark.match')).toContainText('declared')
				}
			})

			await test.step('shows helpful info when search is active', async () => {
				let info = page.getByTestId('search-info')
				await expect.soft(info).toBeVisible()
				await expect.soft(info).toHaveText('2 properties shown, 2 hidden by search')
			})

			await test.step('clicking "Clear search" clears the query', async () => {
				let clear_search = page.getByRole('button', { name: 'Clear search' })
				await expect.soft(clear_search).toBeVisible()
				await clear_search.click()

				await expect.soft(search_input).toHaveValue('')
				await expect.soft(properties).toHaveCount(4)
				await expect.soft(clear_search).not.toBeVisible()
			})

			await test.step('allows negating the query', async () => {
				await search_input.fill('!declared')

				for (let property of await properties.all()) {
					await expect.soft(property).not.toContainText('declared')
				}

				// Negating something that doesn't exist matches every property
				await search_input.fill('!exist')
				await expect.soft(properties).toHaveCount(4)

				for (let property of await properties.all()) {
					await expect.soft(property).not.toContainText('exist')
				}
			})

			await test.step("shows an empty state if the query doesn't match any property", async () => {
				await search_input.fill('nonexistent')

				let clear_button = page.getByRole('button', { name: 'Clear all' })
				await expect.soft(properties).toHaveCount(0)
				await expect.soft(clear_button).toBeVisible()

				await clear_button.click()
				await expect.soft(search_input).toHaveValue('')
				await expect.soft(properties).toHaveCount(4)
				await expect.soft(clear_button).not.toBeVisible()
			})
		})

		test('clears the search query when the CSS changes', async ({ page }) => {
			await search_input.fill('declared')

			await page.getByLabel('CSS to analyze').fill(mock_css + mock_css)
			await page.getByRole('button', { name: 'Analyze CSS' }).click()

			await expect(search_input).toHaveValue('')
		})
	})
})
