import type { Locator } from '@playwright/test'
import { test, expect } from '../../../../tests/fixtures'

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