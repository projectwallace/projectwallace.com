import type { Locator } from '@playwright/test'
import { test, expect } from '../../../../tests/fixtures'

/** Encode a value to base64 JSON for use in the URL hash (mirrors encodeHashState) */
function encodeHash(value: unknown): string {
	return btoa(encodeURIComponent(JSON.stringify(value)))
}

test('does SEO well', async ({ page }) => {
	await page.goto('/prettify-css', { waitUntil: 'domcontentloaded' })
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

let copy_button: Locator
let fixture = `h1 { color: red; font-size: 1em; }`
let prettified = `h1 {\n\tcolor: red;\n\tfont-size: 1em;\n}`

test.beforeEach(async ({ page }) => {
	await page.goto('/prettify-css')
	copy_button = page.getByRole('button', { name: 'Copy CSS' })
})

test('prettifies css', async ({ page }) => {
	let output = page.getByTestId('pre-css')

	await expect.soft(output).toHaveText('')

	// Fill in some CSS
	await page.getByLabel('CSS input').fill(fixture)

	// Check that result is prettified
	await expect.soft(output).toHaveText(prettified)
	await expect.soft(copy_button).toBeVisible()
})

test('allows prettified CSS to be copied', async ({ page, context }) => {
	await expect.soft(copy_button).not.toBeVisible()

	// Fill in some CSS
	await page.getByLabel('CSS input').fill(fixture)

	// Check the clipboard
	await context.grantPermissions(['clipboard-write', 'clipboard-read'])
	await copy_button.click()
	let clipboard_contents = await page.evaluate(async () => await navigator.clipboard.readText())
	expect(clipboard_contents).toBe(prettified)
})

test.describe('indentation settings', () => {
	test.beforeEach(async ({ page }) => {
		await page.getByLabel('Use spaces for indentation').click()
		await expect.soft(page.getByLabel('Use spaces for indentation')).toBeChecked()
		await page.getByLabel('Indent size').fill('4')
		await page.getByLabel('CSS input').fill(fixture)
	})

	test('allows spaces to be used for indentation', async ({ page }) => {
		await expect.soft(page.getByTestId('pre-css')).toHaveText(`h1 {\n    color: red;\n    font-size: 1em;\n}`)
	})

	test('converts back to tabs when spaces are disabled', async ({ page }) => {
		await page.getByLabel('Use spaces for indentation').click()
		await expect.soft(page.getByLabel('Use spaces for indentation')).not.toBeChecked()
		await expect.soft(page.getByTestId('pre-css')).toHaveText(prettified)
	})

	test('does not crash when indent size input is empty', async ({ page }) => {
		let errors: string[] = []
		page.on('pageerror', (exception) => {
			errors.push(exception.message)
		})
		await page.getByLabel('Indent size').clear()
		// Check that the output contains 2 spaces as fallback for empty indent size
		await expect.soft(page.getByTestId('pre-css')).toHaveText(`h1 {\n  color: red;\n  font-size: 1em;\n}`)
		expect.soft(errors).toEqual([])
	})
})

test.describe('URL hash state', () => {
	test('no hash shows empty input', async ({ page }) => {
		await page.goto('/prettify-css', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('CSS input')
		await expect(input).toHaveValue('')
	})

	test('changing input updates hash', async ({ page }) => {
		await page.goto('/prettify-css', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('CSS input')
		await input.fill(fixture)
		let expected_url = `/prettify-css#${encodeHash({ css: fixture, use_spaces: false, indent_size: 2 })}`
		await page.waitForURL(expected_url)
		await expect(page).toHaveURL(expected_url)
	})

	test('opening page with hash shows prefilled input and prettified output', async ({ page }) => {
		let hash = encodeHash({ css: fixture, use_spaces: false, indent_size: 2 })
		await page.goto(`/prettify-css#${hash}`, { waitUntil: 'domcontentloaded' })

		let input = page.getByLabel('CSS input')
		await expect.soft(input).toHaveValue(fixture)

		let output = page.getByTestId('pre-css')
		await expect.soft(output).toHaveText(prettified)
	})

	test('corrupted hash shows page in default state', async ({ page }) => {
		await page.goto('/prettify-css#invalid-base64-!!!', { waitUntil: 'domcontentloaded' })

		let input = page.getByLabel('CSS input')
		await expect.soft(input).toHaveValue('')

		let output = page.getByTestId('pre-css')
		await expect.soft(output).toHaveText('')
	})
})
