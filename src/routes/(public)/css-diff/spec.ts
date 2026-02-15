import { test, expect } from '../../../../tests/fixtures'

/** Encode a value to base64 JSON for use in the URL hash (mirrors encodeHashState) */
function encodeHash(value: unknown): string {
	return btoa(encodeURIComponent(JSON.stringify(value)))
}

test.beforeEach(async ({ page }) => {
	await page.goto('/css-diff', { waitUntil: 'domcontentloaded' })
})

test('does SEO well', async ({ page }) => {
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()

	await expect.soft(page.getByTestId('explainer')).toBeVisible()
})

test('Initially shows placeholders and no empty state', async ({ page }) => {
	await expect.soft(page.getByTestId('empty-diff')).not.toBeVisible()
	await expect.soft(page.getByTestId('diffstat')).toBeVisible()
	await expect.soft(page.getByTestId('explainer')).toBeVisible()
})

test('Shows diff when before and after CSS are filled in', async ({ page }) => {
	const css_fixture_before = 'this-is-my-css { color: red; }'
	const css_fixture_after = 'this-is-my-css { color: green; }'

	await page.getByLabel('CSS Before').fill(css_fixture_before)
	await page.getByLabel('CSS After').fill(css_fixture_after)

	await expect.soft(page.getByTestId('diffstat')).toBeVisible()
	await expect.soft(page.getByTestId('empty-diff')).not.toBeVisible()
	await expect.soft(page.getByTestId('explainer')).toBeVisible()

	let lines_deleted = page.getByTestId('diff-line-deleted')
	let lines_added = page.getByTestId('diff-line-added')
	let lines_unchanged = page.getByTestId('diff-line-unchanged')
	await expect(lines_deleted).toHaveCount(1)
	await expect(lines_added).toHaveCount(1)
	await expect(lines_unchanged).toHaveCount(2)
})

test('Shows empty state when before and after CSS are the same', async ({ page }) => {
	const css_fixture = 'this-is-my-css { color: red; }'

	await page.getByLabel('CSS Before').fill(css_fixture)
	await page.getByLabel('CSS After').fill(css_fixture)

	await expect.soft(page.getByTestId('no-diff-detected')).toBeVisible()
	await expect.soft(page.getByTestId('diffstat')).not.toBeVisible()
})

test('Goes back to initial state when one of the fields is cleared', async ({ page }) => {
	await expect(page).toBeHydrated()
	await page.getByLabel('CSS Before').clear()

	await expect.soft(page.getByTestId('empty-diff')).toBeVisible()
	await expect.soft(page.getByTestId('diffstat')).not.toBeVisible()
})

test('can swap the before/afters', async ({ page }) => {
	await page.getByLabel('CSS Before').fill('before {}')
	await page.getByLabel('CSS After').fill('after {}')

	await expect(page).toBeHydrated()

	await page.getByRole('button', { name: 'Swap before/after' }).click()

	await expect.soft(page.getByLabel('CSS Before')).toHaveValue('after {}')
	await expect.soft(page.getByLabel('CSS After')).toHaveValue('before {}')
})

test.describe('URL hash state', () => {
	test('no hash shows placeholder inputs', async ({ page }) => {
		await page.goto('/css-diff', { waitUntil: 'domcontentloaded' })
		// Page uses placeholders as default values, not empty strings
		let before_input = page.getByLabel('CSS Before')
		let after_input = page.getByLabel('CSS After')
		await expect.soft(before_input).not.toHaveValue('')
		await expect.soft(after_input).not.toHaveValue('')
	})

	test('changing input updates hash', async ({ page }) => {
		await page.goto('/css-diff', { waitUntil: 'domcontentloaded' })
		let old_css = 'before { color: red; }'
		let new_css = 'after { color: blue; }'

		await page.getByLabel('CSS Before').fill(old_css)
		await page.getByLabel('CSS After').fill(new_css)

		let expected_url = `/css-diff#${encodeHash({ old_css, new_css })}`
		await page.waitForURL(expected_url)
		await expect(page).toHaveURL(expected_url)
	})

	test('opening page with hash shows prefilled inputs and diff output', async ({ page }) => {
		let old_css = 'old { color: red; }'
		let new_css = 'new { color: blue; }'
		let hash = encodeHash({ old_css, new_css })
		await page.goto(`/css-diff#${hash}`, { waitUntil: 'domcontentloaded' })

		let before_input = page.getByLabel('CSS Before')
		let after_input = page.getByLabel('CSS After')
		await expect.soft(before_input).toHaveValue(old_css)
		await expect.soft(after_input).toHaveValue(new_css)

		// Diff should be visible
		await expect.soft(page.getByTestId('diffstat')).toBeVisible()
	})

	test('corrupted hash shows page in default state with placeholders', async ({ page }) => {
		await page.goto('/css-diff#invalid-base64-!!!', { waitUntil: 'domcontentloaded' })

		// Should fall back to placeholder values
		let before_input = page.getByLabel('CSS Before')
		let after_input = page.getByLabel('CSS After')
		await expect.soft(before_input).not.toHaveValue('')
		await expect.soft(after_input).not.toHaveValue('')

		// Diff should still be visible (placeholders differ)
		await expect.soft(page.getByTestId('diffstat')).toBeVisible()
	})
})
