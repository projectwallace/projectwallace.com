import type { Locator } from '@playwright/test'
import { test, expect } from '../../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/css-coverage', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveTitle('CSS Coverage inspector - Project Wallace')
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

test('start off empty', async ({ page }) => {
	await expect.soft(page.getByTestId('coverage-summary')).not.toBeVisible()
	await expect.soft(page.getByRole('table', { name: 'Coverage per origin' })).not.toBeVisible()
})

test.describe('loading example file', () => {
	let table: Locator
	let summary: Locator

	test.beforeEach(async ({ page }) => {
		await expect(page).toBeHydrated()
		table = page.getByRole('table', { name: 'Coverage per origin' })
		summary = page.getByTestId('coverage-summary')
		await page.getByRole('button', { name: 'load an example' }).click()
	})

	test('initial state', async ({ page }) => {
		// All elements visible:
		await expect.soft(table).toBeVisible()
		await expect.soft(summary).toBeVisible()
		await expect.soft(table.getByRole('row')).toHaveCount(28) // 27 origins + header
		await expect.soft(page.getByTestId('pre-css')).toBeVisible()

		// Table header: no sorting applied
		let header = table.getByRole('row').first()
		let url_column = header.getByRole('columnheader').nth(0)
		await expect.soft(url_column).toHaveAccessibleName('URL')
		await expect.soft(url_column).not.toHaveAttribute('aria-sort')
		let size_column = header.getByRole('columnheader').nth(1)
		await expect.soft(size_column).toHaveAccessibleName('Total size')
		await expect.soft(size_column).not.toHaveAttribute('aria-sort')
		let coverage_column = header.getByRole('columnheader').nth(2)
		await expect.soft(coverage_column).toHaveAccessibleName('Coverage')
		await expect.soft(coverage_column).not.toHaveAttribute('aria-sort')

		// Row contents:
		let first_row = table.getByRole('row').nth(1)
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/0.BBE7cspC.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('38 kB')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('72.16%')

		// Elements in correct state:
		await expect.soft(table.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'true')
		await expect.soft(table.getByRole('row').nth(2)).toHaveAttribute('aria-selected', 'false')
		let css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('.logo.svelte-1jiwtxp {')

		// Pre has correct coverage applied
		let ranges = page.locator('.css-slide .line-number-range')
		await expect.soft(ranges.nth(0)).not.toHaveClass(/uncovered/)
		await expect.soft(ranges.nth(1)).toHaveClass(/uncovered/)
		await expect.soft(ranges.nth(2)).not.toHaveClass(/uncovered/)
		await expect.soft(ranges.nth(3)).toHaveClass(/uncovered/)

		await expect.soft(ranges.nth(0)).toHaveText('1 2 3 4 5 6 7 8 9 10 11 12 13 14')
		await expect.soft(ranges.nth(1)).toHaveText('15 16 17 18')
		await expect.soft(ranges.nth(3)).toHaveText('51 52 53 54 55 56')
	})

	test('selecting a row', async ({ page }) => {
		let row = table.getByRole('row').nth(2)
		await row.click()
		await expect.soft(row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(table.getByRole('row').nth(1)).toHaveAttribute('aria-selected', 'false')
		let css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('table.svelte-gxaf12 {')
	})

	test('sorting by URL', async ({ page }) => {
		let header = table.getByRole('row').first()
		let url_header = header.getByRole('columnheader').nth(0)
		await url_header.click()
		await expect.soft(url_header).toHaveAttribute('aria-sort', 'descending')
		let first_row = table.getByRole('row').nth(1)
		await expect.soft(first_row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/Textarea.D3Oc5lUl.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('238 B')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('100%')
		let css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('textarea.svelte-g7hyhb {')

		// Click the same column again to reverse the sort
		await url_header.click()
		await expect.soft(url_header).toHaveAttribute('aria-sort', 'ascending')
		await expect.soft(first_row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/0.BBE7cspC.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('38 kB')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('72.16%')
	})

	test('sorting by total size', async ({ page }) => {
		let header = table.getByRole('row').first()
		let size_header = header.getByRole('columnheader').nth(1)
		await size_header.click()
		await expect.soft(size_header).toHaveAttribute('aria-sort', 'descending')
		let first_row = table.getByRole('row').nth(1)
		await expect.soft(first_row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/0.BBE7cspC.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('38 kB')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('72.16%')
		let css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('.logo.svelte-1jiwtxp {')

		// Click the same column again to reverse the sort
		await size_header.click()
		await expect.soft(size_header).toHaveAttribute('aria-sort', 'ascending')
		await expect.soft(first_row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/FormattedDate.JHv9Zh3p.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('69 B')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('100%')
		css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('time.svelte-60ldmz {')
	})

	test('sorting by coverage', async ({ page }) => {
		let header = table.getByRole('row').first()
		let coverage_header = header.getByRole('columnheader').nth(2)
		await coverage_header.click()
		await expect.soft(coverage_header).toHaveAttribute('aria-sort', 'descending')
		let first_row = table.getByRole('row').nth(1)
		await expect.soft(first_row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/23.lTvFD_l9.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('405 B')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('100%')
		let css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('.form.svelte-148ca8f {')

		// Click the same column again to reverse the sort
		await coverage_header.click()
		await expect.soft(coverage_header).toHaveAttribute('aria-sort', 'ascending')
		await expect.soft(first_row).toHaveAttribute('aria-selected', 'true')
		await expect.soft(first_row.getByRole('cell').nth(0)).toHaveAccessibleName('https://www.projectwallace.com/_app/immutable/assets/25.C4edrrKC.css')
		await expect.soft(first_row.getByRole('cell').nth(1)).toHaveAccessibleName('780 B')
		await expect.soft(first_row.getByRole('cell').nth(2)).toHaveAccessibleName('0%')
		css_content = await page.getByTestId('pre-css').textContent()
		expect.soft(css_content).toContain('.page.svelte-1b1m7j9 {')
	})
})