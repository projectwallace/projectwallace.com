import { test, expect } from '../../../../tests/fixtures'

// - focus-visible: baseline "high" (widely available)
// - accent-color: baseline false (limited availability)
// - backdrop-filter: baseline "low" (newly available)
const MOCK_CSS = `
a:focus-visible {
	color: red;
}

input {
	accent-color: auto;
}

.card {
	backdrop-filter: blur(4px);
}
`

test('does SEO well', async ({ page }) => {
	await page.goto('/baseline-overview', { waitUntil: 'domcontentloaded' })

	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
	await expect.soft(page).not.toHaveHorizontalOverflow()
})

test('shows nothing when the CSS has no Baseline-tracked features', async ({ page }) => {
	await page.goto('/baseline-overview')
	await expect(page).toBeHydrated()
	await page.getByRole('tab', { name: 'Paste CSS' }).click()
	await page.getByLabel('CSS to analyze').fill(`a {}`)
	await page.getByRole('button', { name: 'Analyze CSS' }).click()

	await expect.soft(page.getByRole('heading', { name: 'Baseline status summary' })).not.toBeVisible()
	await expect.soft(page.getByRole('heading', { name: 'Widely available features by year' })).not.toBeVisible()
	await expect.soft(page.getByRole('heading', { name: 'Feature usage' })).not.toBeVisible()
})

test.describe('with css', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/baseline-overview')
		await expect(page).toBeHydrated()
		await page.getByRole('tab', { name: 'Paste CSS' }).click()
		await page.getByLabel('CSS to analyze').fill(MOCK_CSS)
		await page.getByRole('button', { name: 'Analyze CSS' }).click()
	})

	test('shows the Baseline status summary section', async ({ page }) => {
		let summary_table = page.getByRole('table', { name: 'Baseline status summary' })
		await expect.soft(summary_table).toBeVisible()

		let rows = summary_table.getByRole('row')
		await expect
			.soft(rows.filter({ has: page.getByRole('cell', { name: 'Widely available', exact: true }) }))
			.toContainText('1')
		await expect
			.soft(rows.filter({ has: page.getByRole('cell', { name: 'Newly available', exact: true }) }))
			.toContainText('1')
		await expect
			.soft(rows.filter({ has: page.getByRole('cell', { name: 'Limited availability', exact: true }) }))
			.toContainText('1')
	})

	test('shows the Widely available features by year section', async ({ page }) => {
		await expect.soft(page.getByRole('heading', { name: 'Widely available features by year' })).toBeVisible()
	})

	test('shows the Usage per Baseline feature table with all detected features', async ({ page }) => {
		await expect.soft(page.getByRole('heading', { name: 'Feature usage' })).toBeVisible()

		let feature_table = page.getByRole('table', { name: 'Usage per Baseline feature' })
		let feature_rows = feature_table.locator('tbody tr')

		await expect.soft(feature_rows).toHaveCount(3)
		await expect.soft(feature_rows.filter({ hasText: ':focus-visible' })).toHaveCount(1)
		await expect.soft(feature_rows.filter({ hasText: 'accent-color' })).toHaveCount(1)
		await expect.soft(feature_rows.filter({ hasText: 'backdrop-filter' })).toHaveCount(1)
	})

	test('filters the Usage per Baseline feature table by Baseline status', async ({ page }) => {
		let feature_table = page.getByRole('table', { name: 'Usage per Baseline feature' })
		let feature_rows = feature_table.locator('tbody tr')

		await expect.soft(page.getByRole('radio', { name: 'All (3)' })).toBeChecked()
		await expect.soft(feature_rows).toHaveCount(3)

		await page.getByRole('radio', { name: 'Widely available (1)' }).check()
		await expect.soft(feature_rows).toHaveCount(1)
		await expect.soft(feature_rows).toContainText(':focus-visible')

		await page.getByRole('radio', { name: 'Newly available (1)' }).check()
		await expect.soft(feature_rows).toHaveCount(1)
		await expect.soft(feature_rows).toContainText('backdrop-filter')

		await page.getByRole('radio', { name: 'Limited availability (1)' }).check()
		await expect.soft(feature_rows).toHaveCount(1)
		await expect.soft(feature_rows).toContainText('accent-color')

		await page.getByRole('radio', { name: 'All (3)' }).check()
		await expect.soft(feature_rows).toHaveCount(3)
	})

	test('sorts the Usage per Baseline feature table when clicking a column header', async ({ page }) => {
		let feature_header = page.getByRole('columnheader', { name: 'Feature', exact: true })

		// The table starts out sorted by "Count", so "Feature" has no aria-sort yet
		await expect.soft(feature_header).not.toHaveAttribute('aria-sort')

		await feature_header.getByRole('button').click()
		await expect.soft(feature_header).toHaveAttribute('aria-sort', 'ascending')

		await feature_header.getByRole('button').click()
		await expect.soft(feature_header).toHaveAttribute('aria-sort', 'descending')
	})

	test('opens devtools and shows the inspector when clicking a feature row', async ({ page }) => {
		let feature_table = page.getByRole('table', { name: 'Usage per Baseline feature' })
		let feature_rows = feature_table.locator('tbody tr')
		let devtools = page.getByTestId('devtools')
		let inspector_tab = devtools.getByTestId('inspector')

		// Devtools are closed initially
		await expect.soft(inspector_tab).not.toBeVisible()
		await expect.soft(devtools.getByRole('tab').getByText('Inspector')).toHaveAttribute('data-state', 'inactive')

		let row = feature_rows.first()
		await expect.soft(row).toHaveAttribute('aria-selected', 'false')
		await row.click()

		// Devtools open and show the Inspector panel for the clicked row
		await expect.soft(inspector_tab).toBeVisible()
		await expect.soft(devtools.getByRole('tab').getByText('Inspector')).toHaveAttribute('data-state', 'active')
		await expect.soft(row).toHaveAttribute('aria-selected', 'true')
	})

	test('shows the expected devtools tabs', async ({ page }) => {
		await expect.soft(page.getByRole('tab', { name: 'Network' })).toBeVisible()
		await expect.soft(page.getByRole('tab', { name: 'Report Data' })).toBeVisible()
		await expect.soft(page.getByRole('tab', { name: 'All CSS' })).toBeVisible()
	})
})
