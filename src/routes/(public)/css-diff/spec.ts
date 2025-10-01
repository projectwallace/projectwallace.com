import { test, expect } from '../../../../tests/fixtures'

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
	await expect.soft(page.getByTestId('explainer')).toBeVisible()
})

test('Goes back to initial state when one of the fields is cleared', async ({ page }) => {
	await expect(page).toBeHydrated()
	await page.getByLabel('CSS Before').clear()

	await expect.soft(page.getByTestId('empty-diff')).toBeVisible()
	await expect.soft(page.getByTestId('diffstat')).not.toBeVisible()
	await expect.soft(page.getByTestId('explainer')).toBeVisible()
})

test('can swap the before/afters', async ({ page }) => {
	await page.getByLabel('CSS Before').fill('before {}')
	await page.getByLabel('CSS After').fill('after {}')

	await expect(page).toBeHydrated()

	await page.getByRole('button', { name: 'Swap before/after' }).click()

	await expect.soft(page.getByLabel('CSS Before')).toHaveValue('after {}')
	await expect.soft(page.getByLabel('CSS After')).toHaveValue('before {}')
})
