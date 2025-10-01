import { test, type Locator, type Page } from '@playwright/test'
import { expect } from '../../../../tests/fixtures'
import type { CSSOrigin } from '$lib/css-origins'

let fixture = [
	{
		type: 'link',
		href: 'https://example.com/test.css',
		url: 'https://example.com/test.css',
		media: undefined,
		rel: 'stylesheet',
		css: 'test-link-element {}'
	},
	{
		type: 'link',
		href: 'https://example.com/test.css',
		url: 'https://example.com/test.css',
		media: '(min-width: 1000px)',
		rel: 'stylesheet',
		css: 'test-link-element {}'
	},
	{
		type: 'style',
		href: 'https://example.com',
		css: 'style-tag-css {}'
	},
	{
		type: 'import',
		url: 'https://example.com',
		href: 'https://example.com',
		css: '@import url(test); import-css {}'
	}
] as CSSOrigin[]

test.beforeEach(async ({ page }) => {
	await page.route('/api/get-css*', async (route) => {
		await route.fulfill({ json: fixture })
	})
	await page.route('https://example.com*', async (route) => {
		await route.fulfill({ body: fixture[0].css })
	})

	await page.goto('/analyze-css', { waitUntil: 'domcontentloaded' })
	await expect(page).toBeHydrated()

	// Fill in a URL
	await page.getByLabel('URL to analyze').fill(`example.com`)

	// click 'Analyze URL'
	await page.getByRole('button', { name: 'Analyze URL' }).click()

	// Open the Network devtools panel
	await page.getByRole('tab', { name: 'Network' }).click()
})

test('shows the network panel', async ({ page }) => {
	await expect(page.getByTestId('network-panel')).toBeVisible()

	// Origins are shown
	let origins = page.locator('.network-body tbody').getByRole('row')
	await expect.soft(origins.first()).toBeVisible()
	await expect.soft(origins).toHaveCount(fixture.length)

	// Each origin shows all the data
	for (let origin of await origins.all()) {
		await expect.soft(origin.getByLabel('Link to origin')).not.toBeEmpty()
		await expect.soft(origin.getByLabel('type')).not.toBeEmpty()
		await expect.soft(origin.getByLabel('filesize')).not.toBeEmpty()
	}

	// Totals are shown
	await expect.soft(page.getByTestId('network-origins-count')).toHaveText(fixture.length.toString())
	await expect.soft(page.getByTestId('network-total-filesize')).not.toBeEmpty()
})

test.describe('Unchecking a single origin', () => {
	let total: Locator
	let first_checkbox: Locator

	test.beforeEach(async ({ page }) => {
		total = page.getByTestId('network-origins-count')
		first_checkbox = page.locator('.network-body tbody').getByRole('row').first().getByRole('checkbox')
		// Uncheck an item
		await first_checkbox.click()
	})

	test('updates the footer totals', async ({ page }) => {
		// Check that the totals were updated
		await expect(total).toHaveText((fixture.length - 1).toString())
		// Turn the origin back on
		await first_checkbox.click()
		// Check that the totals were updated again
		await expect(total).toHaveText(fixture.length.toString())
	})

	test('Marks the "select all" checkbox as indeterminate', async ({ page }) => {
		let check_all = page.getByLabel('Toggle all sources')
		await expect(check_all).toBeChecked({ indeterminate: true })

		// Turn the origin back on
		await first_checkbox.click()
		// Check that the "select all" checkbox is checked again
		await expect(check_all).toBeChecked({ indeterminate: false })
	})
})

test('Toggle-all-checkbox updates footer and checks or unchecks all origins', async ({ page }) => {
	let check_all = page.getByLabel('Toggle all sources')
	let total = page.getByTestId('network-origins-count')

	// Uncheck all items
	await check_all.click()
	// Check that the total is 0
	await expect(total).toHaveText('0')
	// Enable all items
	await check_all.click()
	// Check that the total is correct
	await expect(total).toHaveText(fixture.length.toString())
})

test('Unchecking all origins marks the "select all" checkbox as unchecked', async ({ page }) => {
	let check_all = page.getByLabel('Toggle all sources')
	let rows = page.locator('.network-body tbody').getByRole('row')
	// Uncheck all items
	for (let row of await rows.all()) {
		let checkbox = row.getByRole('checkbox')
		await checkbox.uncheck()
	}
	// Check that the "select all" checkbox is unchecked
	await expect(check_all).not.toBeChecked()
})

test.describe('Inspecting an origin', () => {
	let first_origin: Locator
	let css_slide: Locator

	test.beforeEach(({ page }) => {
		first_origin = page.locator('.network-body tbody').getByRole('row').first()
		css_slide = page.getByTestId('css-slide')
	})

	test('Clicking an origin opens the CSS view and highlights the active origin', async ({ page }) => {
		// Open the CSS Slide
		await first_origin.click()
		await expect.soft(css_slide).toBeVisible()

		// Check that the CSS Slide is shown
		await expect.soft(css_slide.getByRole('button', { name: 'Format CSS' })).toBeVisible()
		await expect.soft(css_slide.getByRole('button', { name: 'Copy CSS' })).toBeVisible()

		// Check that the clicked origin is highlighted in the table
		await expect.soft(first_origin).toHaveAttribute('aria-selected', 'true')
	})

	test('Shift+clicking an origin opens the HTML/CSS in a new tab', async ({ page, context }) => {
		let new_page_promise: Promise<Page> = new Promise((resolve) => context.once('page', resolve))

		// Shift+click the origin
		await first_origin.click({ modifiers: ['Shift'] })

		// Check that the new tab is opened
		let new_page = await new_page_promise
		let pages = context.pages()
		expect.soft(pages).toHaveLength(2)
		if (fixture[0] && 'url' in fixture[0]) {
			expect.soft(new_page.url()).toContain(fixture[0].url)
		}

		// Check that the click did not select the origin
		// await expect.soft(first_origin).not.toHaveClass(/highlight/)

		// Check that the click did not cause the CSS Slide to be shown
		await expect.soft(css_slide).not.toBeVisible()
	})

	test('Allows the selected CSS to be copied', async ({ page, context }) => {
		// Open the CSS Slide
		await first_origin.click()

		await context.grantPermissions(['clipboard-write', 'clipboard-read'])
		await css_slide.getByRole('button', { name: 'Copy CSS' }).click()
		let clipboard_text = await page.evaluate(async () => {
			return await navigator.clipboard.readText()
		})
		expect(clipboard_text).toBe('test-link-element {}')
	})

	test('Allows the selected CSS to be formatted', async ({ page, context }) => {
		// Open the CSS Slide
		await first_origin.click()

		await context.grantPermissions(['clipboard-write', 'clipboard-read'])
		await css_slide.getByRole('button', { name: 'Format CSS' }).click()
		// Hacky way to get the formatted CSS
		await css_slide.getByRole('button', { name: 'Copy CSS' }).click()
		let clipboard_text = await page.evaluate(async () => {
			return await navigator.clipboard.readText()
		})
		expect(clipboard_text).toBe('test-link-element {}')
	})

	test('Closing the origin detail view hides the CSS view and un-highlights the selected origin', async ({
		page
	}) => {
		// Open the CSS Slide
		await first_origin.click()

		await page.getByLabel('Close panel').click()

		await expect.soft(css_slide).not.toBeVisible()
		await expect.soft(first_origin).not.toHaveAttribute('aria-selected', 'true')
	})
})
