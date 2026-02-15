import type { Locator } from '@playwright/test'
import { test, expect } from '../../../../tests/fixtures'

/** Encode a value to base64 JSON for use in the URL hash (mirrors encodeHashState) */
function encodeHash(value: unknown): string {
	return btoa(encodeURIComponent(JSON.stringify(value)))
}

test('does SEO well', async ({ page }) => {
	await page.goto('/minify-css', { waitUntil: 'domcontentloaded' })
	await expect.soft(page).toHaveSeoTitle()
	await expect.soft(page).toHaveCanonical()
	await expect.soft(page).toHaveMetaDescription()
	await expect.soft(page).toHaveH1()
})

let copy_button: Locator
let fixture = `h1 { color: red; font-size: 1em; }`
let minified = `h1{color:red;font-size:1em}`

test.beforeEach(async ({ page }) => {
	await page.goto('/minify-css', { waitUntil: 'domcontentloaded' })
	copy_button = page.getByRole('button', { name: 'Copy CSS' })
})

test('shows minified output', async ({ page }) => {
	let output = page.getByLabel('Minified CSS')
	await expect.soft(output).toHaveText('')

	// Fill in some CSS
	await page.getByLabel('CSS input').fill(fixture)

	// Check that result is prettified
	await expect.soft(output).toHaveText(minified)
	await expect.soft(copy_button).toBeVisible()
})

test('allows minified CSS to be copied', async ({ page, context }) => {
	await expect.soft(copy_button).not.toBeVisible()

	// Fill in some CSS
	await page.getByLabel('CSS input').fill(fixture)

	// Check the clipboard
	await context.grantPermissions(['clipboard-write', 'clipboard-read'])
	await copy_button.click()
	let clipboard_contents = await page.evaluate(async () => await navigator.clipboard.readText())
	expect(clipboard_contents).toBe(minified)
})

test.describe('URL hash state', () => {
	test('no hash shows empty input', async ({ page }) => {
		await page.goto('/minify-css', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('CSS input')
		await expect(input).toHaveValue('')
	})

	test('changing input updates hash', async ({ page }) => {
		await page.goto('/minify-css', { waitUntil: 'domcontentloaded' })
		let input = page.getByLabel('CSS input')
		await input.fill(fixture)
		await page.waitForURL(`/minify-css#${encodeHash(fixture)}`)
		await expect(page).toHaveURL(`/minify-css#${encodeHash(fixture)}`)
	})

	test('opening page with hash shows prefilled input and minified output', async ({ page }) => {
		let hash = encodeHash(fixture)
		await page.goto(`/minify-css#${hash}`, { waitUntil: 'domcontentloaded' })

		let input = page.getByLabel('CSS input')
		await expect.soft(input).toHaveValue(fixture)

		let output = page.getByLabel('Minified CSS')
		await expect.soft(output).toHaveText(minified)
	})

	test('corrupted hash shows page in default state', async ({ page }) => {
		await page.goto('/minify-css#invalid-base64-!!!', { waitUntil: 'domcontentloaded' })

		let input = page.getByLabel('CSS input')
		await expect.soft(input).toHaveValue('')

		let output = page.getByLabel('Minified CSS')
		await expect.soft(output).toHaveText('')
	})
})
