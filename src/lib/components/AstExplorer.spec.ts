import { test, expect } from '../../../tests/fixtures'

test.beforeEach(async ({ page }) => {
	await page.goto('/ast-explorer', { waitUntil: 'domcontentloaded' })
})

test.describe('initial state', () => {
	test('shows the CSS input', ({ page }) => {
		let input = page.getByLabel('CSS to analyze').inputValue
		expect(input).not.toBe('')
	})

	test('shows the AST output', async ({ page }) => {
		let tree = page.getByRole('tree')
		await expect(tree).toBeVisible()
	})

	test('shows a link a to CSSTree documentation', async ({ page }) => {
		let link = page.getByRole('link', { name: /CSSTree/i })
		expect(link).not.toBeNull()
		await expect(link).toHaveAttribute('href', /github\.com\/csstree\/csstree/)
	})

	test('show location data is turned off by default', async ({ page }) => {
		let input = page.getByLabel('Show location data')
		await expect(input).not.toBeChecked()
	})

	test('Autofocus is turned on by default', async ({ page }) => {
		let input = page.getByLabel('Autofocus')
		await expect(input).toBeChecked()
	})

	test('location data is not visible', async ({ page }) => {
		let locations = page.getByRole('group', { name: 'locations' })
		await expect(locations).not.toBeVisible()
	})
})

test('location data is visible when the checkbox is checked', async ({ page }) => {
	let input = page.getByLabel('Show location data')
	await input.check()
	let locations = page.getByRole('group', { name: 'locations' })
	expect.soft(locations).toHaveCount(51)
	await expect.soft(locations.first()).toBeVisible()
})

test('auto scrolls to the selected node', async ({ page }) => {
	let input = page.getByLabel('CSS to analyze')
	await input.focus()
	for (let i = 0; i < 11; i++) {
		await input.press('ArrowDown')
	}
	let treeitem = page.getByRole('treeitem', {
		selected: true
	})
	expect.soft(treeitem).toHaveCount(1)
	await expect.soft(treeitem).toBeVisible()
	await expect.soft(treeitem).toBeInViewport()
})