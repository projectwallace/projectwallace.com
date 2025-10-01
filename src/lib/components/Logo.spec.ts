import type { Locator } from '@playwright/test'
import { test, expect } from '../../../tests/fixtures'

let logo: Locator

test.beforeEach(async ({ page }) => {
	await page.goto('/', { waitUntil: 'domcontentloaded' })
	logo = page
		.getByRole('navigation', { name: 'Primary' })
		.getByRole('link', { name: 'Project Wallace' })
})

test('should have an accessible name', async () => {
	await expect.soft(logo).toHaveAccessibleName('Project Wallace')
})

test('should link to the homepage', async () => {
	await expect.soft(logo).toHaveAttribute('href', '/')
})
